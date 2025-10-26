/* 

import React, { useState } from "react";
import { View, TextInput, Text, Alert, Image, TouchableOpacity, StyleSheet } from "react-native";
import axios from "axios";
import { API_URL } from "../config";
import Menu from "./Menu";
import { useUser } from "./context/UserContext";

const NousContacterScreen = () => {
  const { user } = useUser(); // ✅ on récupère directement le user depuis le contexte
  const [message, setMessage] = useState("");

  const handleSend = async () => {
    if (!message.trim()) {
      return Alert.alert("Erreur", "Veuillez entrer un message.");
    }

    try {


      await axios.post(`${API_URL}/api/contact`, {
        userId: user?.id,
        message,
      });

      Alert.alert("Succès", "Message envoyé avec succès !");
      setMessage("");
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Échec de l'envoi du message.");
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: `${API_URL}/assets/Logo12.png` }} style={styles.logo} />
            <Text style={styles.content}>Une question? Une information manquante? Contactez votre promoteur...</Text>

      <TextInput
        multiline
        placeholder="Votre message..."
        style={styles.textInput}
        value={message}
        onChangeText={setMessage}
      />

      <TouchableOpacity style={styles.loginButton} onPress={handleSend}>
        <Text style={styles.loginText}>ENVOYER</Text>
      </TouchableOpacity>

      
      <View style={styles.floatingMenu}>
        <Menu />
      </View>
    </View>
  );
};

export default NousContacterScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1
  },
  textInput: {
    borderColor: 'gray',
    borderWidth: 1,
    minHeight: 150,
    textAlignVertical: 'top',
    padding: 10,
    marginBottom: 20,
    marginTop:50,
  },

floatingMenu: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,

    borderRadius: 12,
    paddingVertical: 0,




  shadowColor: '#000', // Ombre plus marquée
  shadowOffset: { width: 0, height: 15 }, // Ombre plus basse
  shadowOpacity: 0.35, // Plus opaque
  shadowRadius: 10, // Plus floue



  zIndex: 100,
},


  loginButton: {
    backgroundColor: '#012d7d',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 20,
  },
  loginText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

     logo: {
       width: 400,
       height: 110,
       alignSelf: 'center',

       marginTop:20,
        borderRadius: 6,

     },


  content: {
         fontSize: 24,
         textAlign: 'center',
         marginTop: 30,
         color: '#012d7d'

       },
}); */



import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  Alert,
  Image,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import axios from "axios";
import { API_URL } from "../config";
import Menu from "./Menu";
import { useUser } from "./context/UserContext";

const NousContacterScreen = () => {
  const { user } = useUser();
  const [message, setMessage] = useState("");

  const handleSend = async () => {
    if (!message.trim()) {
      return Alert.alert("Erreur", "Veuillez entrer un message.");
    }

    try {
      await axios.post(`${API_URL}/api/contact`, {
        userId: user?.id,
        message,
      });

      Alert.alert("Succès", "Message envoyé avec succès !");
      setMessage("");
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Échec de l'envoi du message.");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0} // Ajuste la hauteur du décalage
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <Image source={{ uri: `${API_URL}/assets/Logo12.png` }} style={styles.logo} />

            <Text style={styles.content}>
              Une question ? Une information manquante ? Contactez votre promoteur...
            </Text>

            <TextInput
              multiline
              placeholder="Votre message..."
              style={styles.textInput}
              value={message}
              onChangeText={setMessage}
            />

            <TouchableOpacity style={styles.loginButton} onPress={handleSend}>
              <Text style={styles.loginText}>ENVOYER</Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* ✅ Menu fixé en bas, indépendant du contenu qui bouge */}
      <View style={styles.floatingMenu}>
        <Menu />
      </View>
    </View>
  );
};

export default NousContacterScreen;

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 120, // espace sous le contenu pour que rien ne soit caché par le menu
  },
  textInput: {
    borderColor: "gray",
    borderWidth: 1,
    minHeight: 150,
    textAlignVertical: "top",
    padding: 10,
    marginBottom: 20,
    marginTop: 50,
  },
  loginButton: {
    backgroundColor: "#012d7d",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: "center",
    marginTop: 20,
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
    marginTop: 20,
    borderRadius: 6,
  },
  content: {
    fontSize: 24,
    textAlign: "center",
    marginTop: 30,
    color: "#012d7d",
  },
  floatingMenu: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    zIndex: 100,
  },
});
