import React from "react";
import { View, Text, StyleSheet, Image, Button, TouchableOpacity, } from "react-native";
import { API_URL } from '../config';
import { useNavigation } from '@react-navigation/native'; // ✅ import ici

export default function PremiereConnexion() {
  const navigation = useNavigation(); // ✅ hook dispo partout

  return (
    <View style={styles.container}>
      <Image
          source={{ uri: `${API_URL}/assets/Logo12.png` }}
          style={styles.logo}
        />
      <Text style={styles.content}>Première Connexion</Text>
      <Text style={styles.content2}>
    PromoView permet à un promoteur immobilier de montrer à ses clients l'évolution du chantier de leur résidence.{'\n'}{'\n'} Le promoteur peut ainsi  créer des publications, enrichies de photos, de vidéos, et d'informations diverses. {'\n'}{'\n'} Si vous avez acquis un logement neuf, demandez à votre promoteur s'il dispose d'un accès à PromoView.{'\n'}{'\n'} Si c'est le cas, il vous donnera un identifiant et un mot de passe pour que vous aussi, puissiez disposer de toutes les informations.
      </Text>

  <View>
    <TouchableOpacity
      style={styles.retourLogin}
      onPress={() => navigation.navigate("LoginScreen")} // ✅ corrige ici
    >
      <Text style={styles.retourText}>Retour</Text>
    </TouchableOpacity>
  </View>

    </View>
  );
}


const styles = StyleSheet.create({
      container: {
        flex: 1,
        position: 'relative',
      },
      content: {
        fontSize: 24,
        textAlign: 'center',
        marginTop: 30,
        color: '#012d7d'

      },


      content2: {
          fontSize: 18,
          textAlign: 'left',
          marginTop: 40,
          marginLeft:10,
          marginRight:10,
      },

  retourLogin: {
      backgroundColor: '#012d7d',
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignSelf: 'center',
      marginTop:40,

  },

  retourText: {

        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',



  },



  logo: {
    width: 400,
    height: 110,
    alignSelf: "center",

    borderRadius: 6,
  },
});
