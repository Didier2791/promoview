


/* import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "../config";
import Icon from "react-native-vector-icons/FontAwesome";
import { router } from "expo-router";
import { getPublicationsByProjet } from "../services/publicationService";
import { useUser } from "./context/UserContext";
import NotificationService from "../services/NotificationService";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [loading, setLoading] = useState(false);




  const { setUser, setProjet, setPublications, isInitialized } = useUser();

  const handleLogin = async () => {
    if (!email || !motDePasse) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    if (!isInitialized) {
      Alert.alert(
        "Erreur",
        "Application en cours d'initialisation, veuillez patienter..."
      );
      return;
    }

    try {
      setLoading(true);

      // 🔹 Initialiser NotificationService et récupérer pushToken
      const pushToken = await NotificationService.initialize();

      // 🔹 Login avec pushToken
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        mot_de_passe: motDePasse,
        pushToken,
      });

      const { utilisateur, token } = response.data;

      if (utilisateur && token) {
        // Stockage token JWT et userId
        await AsyncStorage.setItem("userToken", token);
        await AsyncStorage.setItem("userId", utilisateur.id.toString());

        // Mettre à jour le contexte utilisateur
        setUser(utilisateur);

        // Navigation
        if (utilisateur.role === "admin") {
          setProjet(null);
          setPublications([]);
          router.replace("/AdminDashboard");
        } else if (utilisateur.projets && utilisateur.projets.length > 0) {
          const projetAssocie = utilisateur.projets[0];
          setProjet(projetAssocie);

          let publications = [];
          try {
            publications = await getPublicationsByProjet(projetAssocie.id);
            setPublications(publications);
          } catch (pubError) {
            console.error("Erreur publications:", pubError);
            setPublications([]);
          }

          router.replace({
            pathname: "/AccueilClient",
            params: {
              userData: JSON.stringify(utilisateur),
              projetData: JSON.stringify(projetAssocie),
              publicationsData: JSON.stringify(publications),
            },
          });
        } else {
          setProjet(null);
          setPublications([]);
          Alert.alert("Info", "Aucun projet associé à cet utilisateur.");
        }
      } else {
        Alert.alert("Erreur", "Identifiants incorrects");
      }
    } catch (error: any) {
      console.error("Erreur lors de la requête :", error.message);
      if (error.response && error.response.status === 401) {
        Alert.alert("Erreur", "Identifiants incorrects");
      } else {
        Alert.alert(
          "Erreur",
          "Une erreur est survenue. Veuillez réessayer."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: `${API_URL}/assets/Logo12.png` }}
        style={styles.logo}
      />
      <Text style={styles.slogan}>
        L'Application qui donne vie à votre projet immobilier
      </Text>
      <Text style={styles.title}>Connexion</Text>

      <View style={styles.inputContainer}>
        <Icon name="envelope" size={20} color="#777" style={styles.icon} />
        <TextInput
          style={styles.inputWithIcon}
          placeholder="Email"
          onChangeText={setEmail}
          value={email}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="lock" size={22} color="#777" style={styles.icon} />
        <TextInput
          style={styles.inputWithIcon}
          placeholder="Mot de passe"
          onChangeText={setMotDePasse}
          value={motDePasse}
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        style={[styles.loginButton, loading && styles.loginButtonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.loginText}>SE CONNECTER</Text>
        )}
      </TouchableOpacity>

      <View style={styles.rowChoices}>
        <TouchableOpacity onPress={() => router.push("/MotDePasseOublie")}>
          <Text
            style={{ color: "#012d7d", textAlign: "center", marginTop: 10 }}
          >
            Mot de passe oublié ?
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/PremiereConnexion")}>
          <Text
            style={{ color: "#012d7d", textAlign: "center", marginTop: 10 }}
          >
            Première Connexion ?
          </Text>
        </TouchableOpacity>
      </View>

      <View>
        <Image
          source={{ uri: `${API_URL}/assets/loginPic2.png` }}
          style={styles.loginpic}
        />
      </View>
    </View>
  );
}




const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#fff",
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    marginTop: 30,
  },
  slogan: {
    fontSize: 16,

    textAlign: "center",
    color: "#012d7d",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,

    borderRadius: 8,
  },
  loginButton: {
    backgroundColor: "#012d7d",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: "center",
    marginTop: 30,
  },
  loginText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  logo: {
    width: 400,
    height: 110,
    alignSelf: "center",

    borderRadius: 6,
  },
  loginpic: {
    width: 400,
    height: 200,
    alignSelf: "center",
    marginBottom: 20,
    marginTop: 50,
    borderRadius: 6,

  },
  rowChoices: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 10,
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 10,
  },
inputWithIcon: {
  flex: 1,
  paddingVertical: 12,
  color: "#000",
},

  loginButtonDisabled: {
    opacity: 0.6,
  },
});
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "../config";
import Icon from "react-native-vector-icons/FontAwesome";
import { router } from "expo-router";
import { getPublicationsByProjet } from "../services/publicationService";
import { useUser } from "./context/UserContext";
import NotificationService from "../services/NotificationService";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser, setProjet, setPublications, isInitialized } = useUser();

  const handleLogin = async () => {
  if (!email || !motDePasse) {
    Alert.alert("Erreur", "Veuillez remplir tous les champs");
    return;
  }

  if (!isInitialized) {
    Alert.alert(
      "Erreur",
      "Application en cours d'initialisation, veuillez patienter..."
    );
    return;
  }

  try {
    setLoading(true);

    // ✅ Étape 1 : login classique
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email,
      mot_de_passe: motDePasse,
    });

    const { utilisateur, token } = response.data;

    if (utilisateur && token) {
      // ✅ Étape 2 : stocker user + token
      await AsyncStorage.setItem("userToken", token);
      await AsyncStorage.setItem("userId", utilisateur.id.toString());
      setUser(utilisateur);

      // ✅ Étape 3 : initialiser les notifications après avoir userId/token
      await AsyncStorage.removeItem("expoPushToken");

      await NotificationService.initialize();

      // ✅ Étape 4 : navigation selon le rôle
      if (utilisateur.role === "admin") {
        setProjet(null);
        setPublications([]);
        router.replace("/AdminDashboard");
      } else if (utilisateur.projets && utilisateur.projets.length > 0) {
        const projetAssocie = utilisateur.projets[0];
        setProjet(projetAssocie);

        try {
          const publications = await getPublicationsByProjet(projetAssocie.id);
          setPublications(publications);
        } catch {
          setPublications([]);
        }

        router.replace({
          pathname: "/AccueilClient",
          params: {
            userData: JSON.stringify(utilisateur),
            projetData: JSON.stringify(projetAssocie),
          },
        });
      } else {
        Alert.alert("Info", "Aucun projet associé à cet utilisateur.");
      }
    } else {
      Alert.alert("Erreur", "Identifiants incorrects");
    }
  } catch (error: any) {
    console.error("Erreur lors de la requête :", error.message);
    if (error.response && error.response.status === 401) {
      Alert.alert("Erreur", "Identifiants incorrects");
    } else {
      Alert.alert(
        "Erreur",
        "Une erreur est survenue. Veuillez réessayer."
      );
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Image
            source={{ uri: `${API_URL}/assets/Logo12.png` }}
            style={styles.logo}
          />
          <Text style={styles.slogan}>
            L'Application qui donne vie à votre projet immobilier
          </Text>
          <Text style={styles.title}>Connexion</Text>

          <View style={styles.inputContainer}>
            <Icon name="envelope" size={20} color="#777" style={styles.icon} />
            <TextInput
              style={styles.inputWithIcon}
              placeholder="Email"
              onChangeText={setEmail}
              value={email}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="lock" size={22} color="#777" style={styles.icon} />
            <TextInput
              style={styles.inputWithIcon}
              placeholder="Mot de passe"
              onChangeText={setMotDePasse}
              value={motDePasse}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.loginText}>SE CONNECTER</Text>
            )}
          </TouchableOpacity>

          <View style={styles.rowChoices}>
            <TouchableOpacity onPress={() => router.push("/MotDePasseOublie")}>
              <Text style={styles.link}>Mot de passe oublié ?</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/PremiereConnexion")}>
              <Text style={styles.link}>Première Connexion ?</Text>
            </TouchableOpacity>
          </View>

          <Image
            source={{ uri: `${API_URL}/assets/loginPic2.png` }}
            style={styles.loginpic}
          />
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#fff",
    flexGrow: 1,
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    marginTop: 30,
  },
  slogan: {
    fontSize: 16,
    textAlign: "center",
    color: "#012d7d",
  },
  loginButton: {
    backgroundColor: "#012d7d",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: "center",
    marginTop: 30,
  },
  loginText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  logo: {
    width: 400,
    height: 110,
    alignSelf: "center",
    borderRadius: 6,
  },
  loginpic: {
    width: 400,
    height: 200,
    alignSelf: "center",
    marginBottom: 20,
    marginTop: 50,
    borderRadius: 6,
  },
  rowChoices: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 10,
    width: "100%",
  },
  link: {
    color: "#012d7d",
    textAlign: "center",
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 10,
  },
  inputWithIcon: {
    flex: 1,
    paddingVertical: 12,
    color: "#000",
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
});
