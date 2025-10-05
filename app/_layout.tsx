
// /app/_layout.tsx
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack } from "expo-router";
import { UserProvider } from "./context/UserContext";
import NotificationService from "../services/NotificationService";
import '../services/FirebaseConfig';

export default function RootLayout() {
  useEffect(() => {
    NotificationService.initialize();
  }, []);

  return (
    <UserProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }} />
      </GestureHandlerRootView>
    </UserProvider>
  );
}







