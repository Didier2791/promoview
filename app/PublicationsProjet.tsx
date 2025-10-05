

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Button,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
} from "react-native";

import { VideoView, useVideoPlayer } from "expo-video";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";
import { API_URL } from "../config";
import { GestureHandlerRootView, Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import NotificationService from '../services/NotificationService'; // Ajout de l'import

const ZoomableImage = ({ uri }: { uri: string }) => {
  const { width, height } = useWindowDimensions();
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value < 1) {
        scale.value = withTiming(1);
        savedScale.value = 1;
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    width: width - 40,
    height: height - 80,
  }));

  return (
    <GestureDetector gesture={pinch}>
      <Animated.Image
        source={{ uri }}
        style={[styles.modalImage, animatedStyle]}
        resizeMode="contain"
      />
    </GestureDetector>
  );
};

// Nouvelle interface pour les props
interface PublicationsProjetProps {
  publications: any[];
  onLogout: () => void;
  onRefreshPublications: () => void; // Nouvelle prop pour rafraîchir les données
}

const PublicationsProjet = ({ publications, onLogout, onRefreshPublications }: PublicationsProjetProps) => {


  const { width, height } = useWindowDimensions();
  const [selectedPublication, setSelectedPublication] = useState<any>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const [favoritePhotoIds, setFavoritePhotoIds] = useState<number[]>([]);

  const handlePhotoPress = (publication, index) => {
    setSelectedPublication(publication);
    setSelectedPhotoIndex(index);
  };

  const loadFavorites = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      const res = await axios.get(`${API_URL}/api/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const photoIds = res.data.map((photo) => photo.id);
      setFavoritePhotoIds(photoIds);
    } catch (err) {
      console.error("Erreur chargement favoris :", err);
    }
  };

  const toggleFavorite = async (photoId: number) => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      if (favoritePhotoIds.includes(photoId)) {
        await axios.delete(`${API_URL}/api/favorites/${photoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavoritePhotoIds((prev) => prev.filter((id) => id !== photoId));
      } else {
        await axios.post(
          `${API_URL}/api/favorites`,
          { photoId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFavoritePhotoIds((prev) => [...prev, photoId]);
      }
    } catch (err) {
      console.error("Erreur favori :", err);
    }
  };

  const detectMediaType = (media) => {
    const extension = media.url_photo?.split(".").pop()?.toLowerCase();
    const videoExtensions = ["mp4", "mov", "avi", "mkv", "webm", "m4v", "3gp", "flv"];
    if (videoExtensions.includes(extension)) return "video";
    return media.type || "photo";
  };

  const MediaThumbnail = ({ media, onPress, showOverlay = false, overlayText = "" }) => {
    const mediaType = detectMediaType(media);
    const isVideo = mediaType === "video";

    return (
      <TouchableOpacity onPress={onPress}>
        <View style={styles.mediaContainer}>
          {isVideo ? (
            <View style={[styles.photo, { backgroundColor: "#000", justifyContent: "center", alignItems: "center" }]}>
              <Ionicons name="videocam" size={30} color="white" />
              <View style={styles.videoPlayOverlay}>
                <Ionicons name="play-circle" size={40} color="white" />
              </View>
            </View>
          ) : (
            <Image source={{ uri: `${API_URL}${media.url_photo}` }} style={styles.photo} />
          )}
          {showOverlay && (
            <View style={styles.overlay}>
              <Text style={styles.overlayText}>{overlayText}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const FullScreenMedia = ({ media, index }) => {
    const mediaType = detectMediaType(media);
    const isVideo = mediaType === "video";
    const isFavorite = favoritePhotoIds.includes(media.id);

    if (isVideo) {
      const player = useVideoPlayer(`${API_URL}${media.url_photo}`, (player) => {
        player.loop = false;
        player.muted = false;
        player.play();
      });

      return (
        <View key={index} style={[styles.carouselImageContainer, { width, height }]}>
          <VideoView
            style={{ width: width - 40, height: height - 80, borderRadius: 8 }}
            player={player}
            allowsFullscreen
            allowsPictureInPicture
            nativeControls={false}
          />
          {media.legende ? <Text style={styles.legende}>{media.legende}</Text> : null}
          <TouchableOpacity style={styles.favoriteIcon} onPress={() => toggleFavorite(media.id)}>
            <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={32} color={isFavorite ? "red" : "white"} />
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <View key={index} style={[styles.carouselImageContainer, { width, height }]}>
          <ZoomableImage uri={`${API_URL}${media.url_photo}`} />
          <Text style={styles.legende}>{media.legende}</Text>
          <TouchableOpacity style={styles.favoriteIcon} onPress={() => toggleFavorite(media.id)}>
            <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={32} color={isFavorite ? "red" : "white" }/>
          </TouchableOpacity>
        </View>
      );
    }
  };

  // Gestionnaire des notifications de nouvelles publications
  const handleNewPublicationNotification = useCallback((data) => {

    // Rafraîchir les publications quand on reçoit une notification
    if (data.type === 'new_publication') {
      onRefreshPublications();
    }
  }, [onRefreshPublications]);



  useFocusEffect(useCallback(() => {
    loadFavorites();
    // Supprimé onRefreshPublications() ici pour éviter la boucle
    // Le refresh se fera seulement via les notifications
  }, []));

  useEffect(() => {
    if (scrollRef.current && selectedPublication) {
      scrollRef.current.scrollTo({ x: selectedPhotoIndex * width, animated: false });
    }
  }, [selectedPublication, width]);

  if (!publications || publications.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noPublication}>Aucune publication disponible.</Text>
        <Button title="Déconnexion" onPress={onLogout} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Fil d'Actualités</Text>
        {publications
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .map((publi, index) => (
            <View key={index} style={styles.publicationContainer}>
              <Text style={styles.publicationTitle}>{publi.titre}</Text>
              <Text style={styles.publicationDate}>{new Date(publi.date).toLocaleDateString("fr-FR")}</Text>
              <Text style={styles.publicationContent}>{publi.texte}</Text>
              {publi.photos && publi.photos.length > 0 && (
                <View style={styles.photosWrapper}>
                  {publi.photos.slice(0, 4).map((media, mediaIndex) => {
                    const isLastVisible = mediaIndex === 3 && publi.photos.length > 4;
                    const remainingCount = publi.photos.length - 4;
                    return (
                      <MediaThumbnail
                        key={mediaIndex}
                        media={media}
                        onPress={() => handlePhotoPress(publi, mediaIndex)}
                        showOverlay={isLastVisible}
                        overlayText={`+${remainingCount}`}
                      />
                    );
                  })}
                </View>
              )}
            </View>
          ))}
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal plein écran */}
      <Modal visible={selectedPublication !== null} transparent={true}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              snapToInterval={width}
              decelerationRate="fast"
              contentContainerStyle={{ alignItems: "center" }}
            >
              {selectedPublication?.photos?.map((media, idx) =>
                media ? <FullScreenMedia key={idx} media={media} index={idx} /> : null
              )}
            </ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedPublication(null)}>
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </GestureHandlerRootView>
      </Modal>
    </View>
  );
};

export default PublicationsProjet;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  noPublication: { padding: 10, fontSize: 16, textAlign: "center" },
  publicationContainer: {
    marginBottom: 30,
    backgroundColor: "#f0f0f0",
    padding: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  publicationTitle: { fontSize: 18, fontFamily:"Satoshi-Bold" },
  publicationDate: { fontSize: 14,fontFamily:"Satoshi"  },
  publicationContent: { fontSize: 16, marginTop: 5, fontFamily:"Satoshi" },
  photosWrapper: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginTop: 10 },
  photo: { width: 150, height: 150, marginBottom: 10, borderRadius: 8 },
  mediaContainer: { position: "relative" },
  videoPlayOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 8,
  },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.9)" },
  carouselImageContainer: { justifyContent: "center", alignItems: "center", padding: 20 },
  modalImage: { borderRadius: 8 },
  legende: { color: "white", textAlign: "center", marginTop: 10 },
  favoriteIcon: { position: "absolute", top: 50, left: 30 },
  closeButton: { position: "absolute", top: 40, right: 20, backgroundColor: "white", padding: 10, borderRadius: 8, zIndex: 20 },
  closeButtonText: { color: "black", fontWeight: "bold" },
  logoutButton: { backgroundColor: "#012d7d", paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, alignSelf: "center", marginBottom: 20 },
  logoutText: { color: "white", fontSize: 16, fontWeight: "bold" },
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 10, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", borderRadius: 8 },
  overlayText: { color: "white", fontSize: 24, fontWeight: "bold" },
});

