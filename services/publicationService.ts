import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config"; // import depuis config.ts

export const getPublicationsByProjet = async (projetId: number) => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) throw new Error("Token non trouvé");

    const response = await axios.get(
      `${API_URL}/api/publications/projet/${projetId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json; charset=utf-8",

        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des publications :", error);
    throw error;
  }
};


// services/publicationService.ts
/*import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../config";

export const getPublicationsByProjet = async (projetId: number) => {
  try {
    const token = await AsyncStorage.getItem("userToken");

    if (!token) {
      throw new Error("Token non trouvé");
    }

    const response = await axios.get(`${API_URL}/api/publications/projet/${projetId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Erreur lors de la récupération des publications :", error.message);
    throw error;
  }
};*/
