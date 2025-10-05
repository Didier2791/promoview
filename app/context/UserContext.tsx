



import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../config";
import NotificationService from "../../services/NotificationService";

interface User {
  id: number;
  nom: string;
  email: string;
  role: string;
  projets?: any[];
}

interface Projet {
  id: number;
  nom: string;
}

interface Publication {
  id: number;
  titre: string;
  texte: string;
  date: string;
  images: string[];
  projetId: number;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  projet: Projet | null;
  setProjet: (projet: Projet | null) => void;
  publications: Publication[];
  setPublications: (pubs: Publication[]) => void;
  logout: () => void;
  isInitialized: boolean;
}

const UserContext = createContext<UserContextType | null>(null);

interface Props {
  children: ReactNode;
}

export const UserProvider = ({ children }: Props) => {
  const [user, setUserState] = useState<User | null>(null);
  const [projet, setProjetState] = useState<Projet | null>(null);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const setUser = (newUser: User | null) => {
    console.log("setUser appelé avec:", newUser?.nom || "null");
    setUserState(newUser);
  };

  const setProjet = (newProjet: Projet | null) => {
    console.log("setProjet appelé avec:", newProjet?.nom || "null");
    setProjetState(newProjet);

    // Rafraîchissement initial pour le projet défini
    if (newProjet) {
      refreshPublications(newProjet.id);
    }
  };

  // Initialisation du contexte
  useEffect(() => {
    initializeContext();
  }, []);

  // 🔔 S'abonner aux notifications dès que le projet est défini
  useEffect(() => {
    if (!projet) return;

    const unsubscribe = NotificationService.subscribe((notification) => {
      console.log("📩 Notification reçue dans UserContext:", notification);

      if (
        notification.type === "new_publication" &&
        Number(notification.projetId) === projet.id
      ) {
        refreshPublications(projet.id);
      }
    });

    return () => unsubscribe();
  }, [projet]); // 🔑 dépendance sur projet

  const initializeContext = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem("userId");
      const storedToken = await AsyncStorage.getItem("userToken");

      if (storedUserId && storedToken) {
        console.log("Utilisateur précédent trouvé:", storedUserId);
        // Optionnel : recharger l'utilisateur depuis l'API
      }
    } catch (error) {
      console.error("Erreur lors de l'initialisation du contexte:", error);
    } finally {
      setIsInitialized(true);
    }
  };

  // 🔄 Fonction pour rafraîchir les publications
  const refreshPublications = async (projetId: number) => {
    try {
      console.log("🔄 Rafraîchissement des publications pour projet:", projetId);
      const token = await AsyncStorage.getItem("userToken");

      if (!token) return;

const res = await fetch(`${API_URL}/api/publications/projet/${projetId}`, {
  headers: { Authorization: `Bearer ${token}` },
});



      if (!res.ok) {
          const text = await res.text();
          throw new Error(`Erreur API ${res.status} - ${text}`);
      }

      const data = await res.json();
      console.log("✅ Publications mises à jour:", data.length);
      setPublications(data);
    } catch (err) {
      console.error("Erreur lors du refresh des publications:", err);
    }
  };

  const logout = async () => {
    console.log("Logout appelé");
    setUser(null);
    setProjet(null);
    setPublications([]);

    try {
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userId");
    } catch (error) {
      console.error("Erreur lors du logout:", error);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        projet,
        setProjet,
        publications,
        setPublications,
        logout,
        isInitialized,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};

export default UserProvider;



