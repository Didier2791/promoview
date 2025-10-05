
import React, { useState, useCallback, useEffect } from "react";
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { VideoView } from "expo-video";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config";
import axios from "axios";

import Menu from "./Menu";
import PublicationsProjet from "./PublicationsProjet";
import { getPublicationsByProjet } from "../services/publicationService";
import { useUser } from "./context/UserContext";
import NotificationService from "../services/NotificationService";

export default function AccueilClient() {


  // 🔹 Récupération des paramètres de navigation
  const params = useLocalSearchParams();
  let user = null;
  let projet = null;
  let publicationsFromParams: any[] = [];

  try {
    if (params.userData) user = JSON.parse(params.userData as string);
    if (params.projetData) projet = JSON.parse(params.projetData as string);
    if (params.publicationsData) publicationsFromParams = JSON.parse(params.publicationsData as string);
  } catch (error) {
    console.error("Erreur parsing paramètres:", error);
  }

  // 🔹 Contexte utilisateur/projet
  const { user: contextUser, projet: contextProjet, setUser, setProjet } = useUser();
  if (!user) user = contextUser;
  if (!projet) projet = contextProjet;

  const navigation = useNavigation();

  // 🔹 State publications
  const [publications, setPublications] = useState<any[]>(publicationsFromParams || []);
  const [isLoadingPublications, setIsLoadingPublications] = useState(false);

  // 🔹 Fonction de chargement des publications
  const fetchPublications = useCallback(async () => {
    if (!projet?.id || isLoadingPublications) return;

    setIsLoadingPublications(true);
    try {
      const fetched = await getPublicationsByProjet(projet.id);
      setPublications(fetched); // ⚡ met à jour avec les nouvelles publications

    } catch (err) {
      console.error("❌ Erreur chargement publications :", err);
    } finally {
      setIsLoadingPublications(false);
    }
  }, [projet?.id, isLoadingPublications]);

  // 🔔 Gestion notifications
  const handleNewPublicationNotification = useCallback(
    (data: any) => {
      if (data.type === "new_publication") {

        fetchPublications();
      }
    },
    [fetchPublications]
  );

  // 🔹 Abonnement notifications (une seule fois)
  useEffect(() => {

    const unsubscribe = NotificationService.subscribe(handleNewPublicationNotification);

    return () => {

      unsubscribe();
    };
  }, [handleNewPublicationNotification]);

  // 🔹 Chargement initial et au retour sur l’écran
  useFocusEffect(
    useCallback(() => {
      if (!user || !projet) return;

      if (user && !contextUser) setUser(user);
      if (projet && !contextProjet) setProjet(projet);


      fetchPublications();
    }, [user?.id, projet?.id])
  );

  // 🔹 Déconnexion
const onLogout = async () => {
  try {
    const userToken = await AsyncStorage.getItem("userToken");

    if (userToken) {
      // Appel au backend pour supprimer le push_token
      await axios.post(
        `${API_URL}/api/auth/logout`,
        {},
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );
    }

    // Nettoyage du stockage local
    await AsyncStorage.multiRemove(["userToken", "userId", "fcmToken"]);

    // Redirige vers la page de login
    router.replace("/LoginScreen");
  } catch (error) {
    console.error("Erreur lors de la déconnexion:", error);
  }
};

  // 🔹 Composant média principal projet
  const ProjectMainMedia = ({ projet }) => {
    const photoPrincipale = projet?.photos?.find((p) => p.id === projet.photo_principale_id);
    if (!photoPrincipale?.url_photo) return <Text>Aucune image disponible</Text>;

    const isVideo =
      photoPrincipale.type === "video" ||
      photoPrincipale.url_photo.match(/\.(mp4|mov|avi|mkv|webm|m4v)$/i);

    if (isVideo) {
      return (
        <View style={styles.projectMediaContainer}>
          <VideoView
            source={{ uri: `${API_URL}${photoPrincipale.url_photo}` }}
            style={styles.projectVideo}
            useNativeControls
            resizeMode="cover"
            shouldPlay={false}
            isLooping={false}
          />
        </View>
      );
    } else {
      return <Image source={{ uri: `${API_URL}${photoPrincipale.url_photo}` }} style={styles.projectImage} />;
    }
  };

  // 🔹 Loader si données manquantes
  if (!user || !projet) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#012d7d" />
        <Text style={styles.loaderText}>Chargement des données...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <LinearGradient colors={["#9daccb", "#ffffff"]} style={styles.gradientSection}>
          <Image source={{ uri: `${API_URL}/assets/Logo12.png` }} style={styles.logo} />
          <Text style={styles.title}>Bienvenue {user?.prenom}</Text>

          <View style={styles.publicationContainer}>
            <ProjectMainMedia projet={projet} />

            <View style={styles.rowWithLogo}>
              <Image source={{ uri: `${API_URL}/assets/Logo7.png` }} style={styles.inlineLogo} />
              <Text style={styles.subtitle}>{projet.titre}</Text>
            </View>

            <Text style={styles.adresse}>{projet.adresse}</Text>
            <Text style={styles.nblog}>Nombre de logements : {projet.nb_de_lots}</Text>

            <Text style={styles.avancementLabel}>Avancement du chantier</Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarFill, { width: `${projet.evol_chantier || 0}%` }]} />
            </View>
            <Text style={styles.percentageText}>{projet.evol_chantier || 0}%</Text>
          </View>
        </LinearGradient>

        <View style={styles.bottomSection}>
          <PublicationsProjet
            publications={publications}
            onLogout={onLogout}
            onRefreshPublications={fetchPublications}
          />
        </View>
      </ScrollView>

      <View style={styles.floatingMenu}>
        <Menu />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logo: {
    width: 400,
    height: 110,
    alignSelf: 'center',
    marginBottom: 20,
    marginTop: 30,
    borderRadius: 6,
  },
  gradientSection: {
    paddingHorizontal: 10,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 22,
    fontWeight: "600",
    marginTop: 10,
  },
  adresse: {
    fontSize: 16,
    marginBottom: 10,
  },
  nblog: {
    fontSize: 16,
    marginBottom: 10,
  },
  publicationContainer: {
    marginBottom: 10,
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 8,
  },
  projectImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  avancementLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 6,
  },
  progressBarContainer: {
    width: "99%",
    height: 12,
    backgroundColor: "#ddd",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "yellowgreen",
  },
  percentageText: {
    fontSize: 24,
    fontWeight: "500",
    marginBottom: 20,
  },
  bottomSection: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 50,
  },
  floatingMenu: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 12,
    paddingVertical: 0,
  },
  inlineLogo: {
    width: 24,
    height: 24,
    marginRight: 8,
    resizeMode: 'contain',
    marginBottom: -10,
  },
  rowWithLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  // Nouveaux styles pour le loader
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#012d7d',
  },
});