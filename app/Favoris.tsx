


import React, { useEffect, useState, useRef } from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config";
import axios from "axios";
import Menu from "./Menu";
import { Ionicons } from "@expo/vector-icons";
import { VideoView, useVideoPlayer } from "expo-video";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

const API_URL2 = `${API_URL}/api/favorites`;
const screenWidth = Dimensions.get("window").width;

export default function FavorisScreen() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    getFavorites();
  }, []);

  const getFavorites = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      const res = await axios.get(API_URL2, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFavorites(res.data);
    } catch (err) {
      console.error("Erreur chargement favoris", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = (removedId) => {
    setFavorites((prev) => prev.filter((item) => item.id !== removedId));
  };

  // Détecte le type de média
  const detectMediaType = (media) => {
    const extension = media.url_photo?.split(".").pop()?.toLowerCase();
    const videoExtensions = [
      "mp4",
      "mov",
      "avi",
      "mkv",
      "webm",
      "m4v",
      "3gp",
      "flv",
    ];
    if (videoExtensions.includes(extension)) return "video";
    return media.type || "photo";
  };

  // Miniature avec overlay play pour vidéos
  const MediaThumbnail = ({ media, onPress }) => {
    const isVideo = detectMediaType(media) === "video";

    return (
      <TouchableOpacity onPress={onPress}>
        <View style={styles.mediaContainer}>
          {isVideo ? (
            <View
              style={[
                styles.photo,
                { backgroundColor: "#000", justifyContent: "center", alignItems: "center" },
              ]}
            >
              <Ionicons name="videocam" size={30} color="white" />
              <View style={styles.videoPlayOverlay}>
                <Ionicons name="play-circle" size={40} color="white" />
              </View>
            </View>
          ) : (
            <Image source={{ uri: `${API_URL}${media.url_photo}` }} style={styles.photo} />
          )}
          <Text style={styles.legende}>{media.legende}</Text>
          <TouchableOpacity
            style={styles.favoriteIcon}
            onPress={() => handleRemoveFavorite(media.id)}
          >
            <Ionicons name="heart" size={28} color="red" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Composant plein écran avec pinch-to-zoom pour les photos
  const FullScreenMedia = ({ media }) => {
    const isVideo = detectMediaType(media) === "video";

    if (isVideo) {
      const player = useVideoPlayer(`${API_URL}${media.url_photo}`, (player) => {
        player.loop = false;
        player.muted = false;
      });

      return (
        <View style={styles.fullScreenContainer}>
          <VideoView
            style={styles.modalVideo}
            player={player}
            allowsFullscreen
            allowsPictureInPicture
            nativeControls={true}
          />
          <Text style={styles.legende}>{media.legende}</Text>
        </View>
      );
    }

    // 🔍 Gestion du pinch-to-zoom
    const scale = useSharedValue(1);
    const focalX = useSharedValue(0);
    const focalY = useSharedValue(0);

    const pinch = Gesture.Pinch()
      .onUpdate((e) => {
        scale.value = e.scale;
        focalX.value = e.focalX;
        focalY.value = e.focalY;
      })
      .onEnd(() => {
        scale.value = withTiming(1, { duration: 200 });
      });

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <View style={styles.fullScreenContainer}>
        <GestureDetector gesture={pinch}>
          <Animated.Image
            source={{ uri: `${API_URL}${media.url_photo}` }}
            style={[styles.modalImage, animatedStyle]}
            resizeMode="contain"
          />
        </GestureDetector>
        <Text style={styles.legende}>{media.legende}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes favoris</Text>

      {loading ? (
        <Text style={styles.message}>Chargement en cours...</Text>
      ) : favorites.length === 0 ? (
        <Text style={styles.message}>Aucun favori pour le moment.</Text>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <MediaThumbnail media={item} onPress={() => setSelectedMedia(item)} />
          )}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}

      <View style={styles.floatingMenu}>
        <Menu />
      </View>

      {/* Modal plein écran */}
<Modal visible={!!selectedMedia} transparent={true}>
  <GestureHandlerRootView style={{ flex: 1 }}>
    <View style={styles.modalOverlay}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ alignItems: "center" }}
      >
        {selectedMedia && <FullScreenMedia media={selectedMedia} />}
      </ScrollView>

      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => setSelectedMedia(null)}
      >
        <Text style={styles.closeButtonText}>Fermer</Text>
      </TouchableOpacity>
    </View>
  </GestureHandlerRootView>
</Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#fff" },
  title: { fontSize: 20, marginVertical: 10, fontWeight: "bold" },
  message: { textAlign: "center", fontSize: 16, marginTop: 20, color: "#666" },
  floatingMenu: { position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 100 },
  mediaContainer: { marginBottom: 20, position: "relative" },
  photo: { width: "100%", height: 200, borderRadius: 8 },
  videoPlayOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 8,
  },
  legende: { marginTop: 5, textAlign: "center", fontSize: 14, color: "#fff" },
  favoriteIcon: { position: "absolute", top: 10, right: 10 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
  },
  fullScreenContainer: {
    width: screenWidth,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalImage: {
    width: screenWidth - 40,
    height: 400,
    borderRadius: 8,
  },
  modalVideo: {
    width: screenWidth * 0.9,
    height: 300,
    borderRadius: 8,
    backgroundColor: "black",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
    zIndex: 20,
  },
  closeButtonText: { color: "black", fontWeight: "bold" },
});
