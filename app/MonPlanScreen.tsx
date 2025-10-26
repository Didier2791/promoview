/* 
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Menu from "./Menu";
import { API_URL } from "../config";
import { WebView } from "react-native-webview";

const MonPlanScreen = () => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        const token = await AsyncStorage.getItem("userToken");

        if (!token || !userId) {

          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_URL}/api/admin/plan/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.pdfPlan) {
          const fullUrl = `${API_URL}${response.data.pdfPlan}`;
          setPdfUrl(fullUrl);
        }
      } catch (error) {
        console.error("Erreur pour récupérer le plan PDF:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Chargement du plan...</Text>
      </View>
    );
  }

  if (!pdfUrl) {
    return (
      <View style={styles.centered}>
        <Text>Aucun plan PDF disponible.</Text>
      </View>
    );
  }

  // Choisir l'URL selon la plateforme
  const viewerUrl =
    Platform.OS === "ios"
      ? pdfUrl // iOS lit directement le PDF
      : `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(pdfUrl)}`; // Android via Google Docs

  return (
    <View style={{ flex: 1 }}>
      
      <WebView
        source={{ uri: viewerUrl }}
        style={{ flex: 1 }}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.centered}>
            <ActivityIndicator size="large" />
            <Text>Chargement du PDF...</Text>
          </View>
        )}
      />

      
      <View style={styles.floatingMenu}>
        <Menu />
      </View>
    </View>
  );
};

export default MonPlanScreen;

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  floatingMenu: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 12,
    paddingVertical: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    zIndex: 100,
  },
}); */




import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Menu from "./Menu";
import { API_URL } from "../config";
import { WebView } from "react-native-webview";

const MonPlanScreen = () => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        const token = await AsyncStorage.getItem("userToken");

        if (!token || !userId) {
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_URL}/api/admin/plan/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.pdfPlan) {
          const fullUrl = `${API_URL}${response.data.pdfPlan}`;
          setPdfUrl(fullUrl);
        } else {
          setPdfUrl(null);
        }
      } catch (error) {
        console.error("Erreur pour récupérer le plan PDF:", error);
        setPdfUrl(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, []);

  // Choisir l'URL selon la plateforme
  const viewerUrl =
    Platform.OS === "ios"
      ? pdfUrl
      : `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(pdfUrl || "")}`;

  return (
    <View style={{ flex: 1 }}>
      {/* --- CONTENU PRINCIPAL --- */}
      <View style={{ flex: 1 }}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" />
            <Text>Chargement du plan...</Text>
          </View>
        ) : pdfUrl ? (
          <WebView
            source={{ uri: viewerUrl }}
            style={{ flex: 1 }}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.centered}>
                <ActivityIndicator size="large" />
                <Text>Chargement du PDF...</Text>
              </View>
            )}
          />
        ) : (
          <View style={styles.centered}>
            <Text style={{ fontSize: 16, color: "#555" }}>
              Aucun plan PDF disponible.
            </Text>
          </View>
        )}
      </View>

      {/* --- MENU EN BAS --- */}
      <View style={styles.floatingMenu}>
        <Menu />
      </View>
    </View>
  );
};

export default MonPlanScreen;

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  floatingMenu: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 12,
    paddingVertical: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    zIndex: 100,
  },
});


 