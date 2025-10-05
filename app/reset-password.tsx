

import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { View, TextInput, Button, Alert, Text } from "react-native";
import { API_URL } from '../config';

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { email, token } = useLocalSearchParams<{ email: string; token: string }>();


  const handleSubmitNewPassword = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          token,
          nouveauMotDePasse: password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert("Succès", data.message);
        router.replace("/LoginScreen"); // ou /index si c’est ta page de login
      } else {
        Alert.alert("Erreur", data.message);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Impossible de réinitialiser le mot de passe");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Entrez votre nouveau mot de passe :</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Nouveau mot de passe"
        secureTextEntry
        style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
      />
      <Button  color="#012d7d" title="Valider" onPress={handleSubmitNewPassword} />
    </View>
  );
}

