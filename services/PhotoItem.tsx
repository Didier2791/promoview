import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

import { API_URL } from "../config";

const screenWidth = Dimensions.get("window").width;

interface Photo {
  id: number;
  url_photo: string;
}

interface Props {
  photo: Photo;
  onRemoveFavorite?: (id: number) => void;
}

export default function PhotoItem({ photo, onRemoveFavorite }: Props) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageRatio, setImageRatio] = useState(0.5); // valeur par défaut

  useEffect(() => {
    checkIfFavorite();
    getImageSize();
  }, []);

  const checkIfFavorite = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      const res = await axios.get(`${API_URL}/api/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const favorites = res.data;
      const found = favorites.some((fav: Photo) => fav.id === photo.id);
      setIsFavorite(found);
    } catch (err) {
      console.error("Erreur récupération favoris", err);
    }
  };

  const getImageSize = () => {
    Image.getSize(
      `${API_URL}${photo.url_photo}`,
      (width, height) => {
        setImageRatio(height / width);
      },
      (error) => {
        console.error("Erreur récupération taille image", error);
      }
    );
  };

  const toggleFavorite = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      if (isFavorite) {
        await axios.delete(`${API_URL}/api/favorites/${photo.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsFavorite(false);
        if (onRemoveFavorite) onRemoveFavorite(photo.id);
      } else {
        await axios.post(
          `${API_URL}/api/favorites`,
          { photoId: photo.id },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setIsFavorite(true);
      }
    } catch (err) {
      console.error("Erreur mise à jour favoris", err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: `${API_URL}${photo.url_photo}` }}
          style={{
            width: screenWidth,
            height: screenWidth * imageRatio,
          }}
          resizeMode="cover"
        />
      </View>
      <TouchableOpacity onPress={toggleFavorite} style={styles.heartIcon}>
        <Ionicons
          name={isFavorite ? "heart" : "heart-outline"}
          size={28}
          color={isFavorite ? "red" : "gray"}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    marginBottom: 20,
  },
  heartIcon: {
    position: "absolute",
    bottom: 20,
    right: 20,
    padding: 8,
    backgroundColor: "white",
    borderRadius: 50,
  },
  imageWrapper: {
    borderRadius: 10,
    overflow: "hidden",
  },
});
