import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native'; //
import { API_URL } from '../config';  //

export default function MotDePasseOublie() {
  const [email, setEmail] = useState('');

  const handleResetPassword = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/mot-de-passe-oublie`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Succès', data.message);
      } else {
        Alert.alert('Erreur', data.message);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Entrez votre adresse email :</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
      />
      <Button color="#012d7d"   title="Validez" onPress={handleResetPassword} />
    </View>
  );
}
