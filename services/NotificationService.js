

/*console.log('Notif service Activée!');

import notifee, { AndroidImportance } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, PermissionsAndroid } from 'react-native';
import { API_URL } from '../config';


class NotificationService {
  listeners = [];

  // Abonnement d’un composant aux notifications
  subscribe(listener) {
    console.log('📝 Nouveau listener abonné, total:', this.listeners.length + 1);
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
      console.log('📝 Listener désabonné, total:', this.listeners.length);
    };
  }

  // Prévenir tous les abonnés
  notifyListeners(data) {
    console.log('🔔 Notification des listeners, nombre:', this.listeners.length, 'data:', data);
    this.listeners.forEach((listener, index) => {
      try {
        listener(data);
        console.log(`✅ Listener ${index} notifié avec succès`);
      } catch (error) {
        console.error(`❌ Erreur listener ${index}:`, error);
      }
    });
  }

  async requestPermission() {
    if (Platform.OS === 'web') return false;
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      console.log(enabled ? '✅ Permission accordée' : '❌ Permission refusée');
      return enabled;
    } catch (error) {
      console.error('Erreur demande permission:', error);
      return false;
    }
  }

  async getToken() {
    if (Platform.OS === 'web') return null;
    try {
      await messaging().registerDeviceForRemoteMessages();
      const token = await messaging().getToken();
      console.log('🔑 FCM Token:', token);
      await AsyncStorage.setItem('fcmToken', token);
      return token;
    } catch (error) {
      console.error('Erreur récupération token:', error);
      return null;
    }
  }

  setupMessageListeners() {
    // Foreground
    messaging().onMessage(async remoteMessage => {
      try {
        console.log("📱 Message foreground:", remoteMessage);
        const { title, body } = remoteMessage.notification || {};
        const type = remoteMessage.data?.type;

        await notifee.displayNotification({
          title: title || "Notification",
          body: body || "",
          android: { channelId: "default", importance: AndroidImportance.HIGH },
        });

        if (type === "new_publication" || type === "publication") {
          console.log('🔔 Type de publication détecté, notification des listeners');
          this.notifyListeners(remoteMessage.data);
        } else {
          console.log('⚠️ Type de notification non reconnu:', type);
        }
      } catch (err) {
        console.error("Erreur affichage notification:", err);
      }
    });

    // Background
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log("📱 Message background:", remoteMessage);
      const type = remoteMessage.data?.type;
      if (type === "new_publication" || type === "publication") {
        this.notifyListeners(remoteMessage.data);
      }
    });

    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log("📱 Notification tap:", remoteMessage);
    });

    messaging().getInitialNotification().then(remoteMessage => {
      if (remoteMessage) {
        console.log("📱 Notification cold start:", remoteMessage);
      }
    });
  }

  async sendTokenToServer(token, userId) {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken || !userId) return;

      const response = await fetch(`${API_URL}/api/admin/utilisateurs/${userId}/push-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ pushToken: token }),
      });

      if (!response.ok) {
        console.error('Erreur serveur envoi pushToken:', response.status, await response.text());
      } else {
        console.log('✅ pushToken envoyé au serveur');
      }
    } catch (error) {
      console.error('Erreur envoi pushToken:', error);
    }
  }

  async initialize() {
    console.log('Initialize activée');

    // Permissions Android 13+
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      console.log('Permission notification Android:', granted);
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
    }

    // Créer canal notification Android
    if (Platform.OS === 'android') {
      await notifee.createChannel({
        id: 'default',
        name: 'Notifications',
        importance: AndroidImportance.HIGH,
      });
    }

    // Permission FCM
    const hasPermission = await this.requestPermission();
    if (hasPermission) {
      const token = await this.getToken();
      const userId = await AsyncStorage.getItem('userId');
      if (token && userId) {
        await this.sendTokenToServer(token, userId);
      }
    }

    // Listeners notifications
    this.setupMessageListeners();
  }
}

module.exports = new NotificationService();*/



// services/NotificationService.js
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, PermissionsAndroid } from 'react-native';
import { API_URL } from '../config';
import notifee, { AndroidImportance } from '@notifee/react-native';

class NotificationService {
  listeners = [];

  // Abonnement d’un composant aux notifications (évite les doublons)
  subscribe(listener) {
    if (!this.listeners.includes(listener)) {
      this.listeners.push(listener);
      console.log('📝 Nouveau listener abonné, total:', this.listeners.length);
    }
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
      console.log('📝 Listener désabonné, total:', this.listeners.length);
    };
  }

  notifyListeners(data) {
    this.listeners.forEach((listener, index) => {
      try {
        listener(data);
        console.log(`✅ Listener ${index} notifié avec succès`);
      } catch (error) {
        console.error(`❌ Erreur listener ${index}:`, error);
      }
    });
  }

  async requestPermission() {
    if (Platform.OS === 'web') return false;
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      console.log(enabled ? '✅ Permission accordée' : '❌ Permission refusée');
      return enabled;
    } catch (error) {
      console.error('Erreur demande permission:', error);
      return false;
    }
  }

  async getToken() {
    if (Platform.OS === 'web') return null;
    try {
      await messaging().registerDeviceForRemoteMessages();
      const token = await messaging().getToken();
      console.log('🔑 FCM Token récupéré:', token);
      return token;
    } catch (error) {
      console.error('Erreur récupération token:', error);
      return null;
    }
  }

  async sendTokenToServerIfChanged(token, userId) {
    if (!token || !userId) return;

    try {
      const storedToken = await AsyncStorage.getItem('fcmToken');
      if (storedToken === token) {
        console.log('✅ Token inchangé, pas besoin d’envoyer au serveur');
        return;
      }

      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) return;

      const response = await fetch(`${API_URL}/api/admin/utilisateurs/${userId}/push-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({ pushToken: token }),
      });

      if (!response.ok) {
        console.error('❌ Erreur serveur envoi pushToken:', response.status, await response.text());
      } else {
        console.log('📡 Token FCM envoyé au serveur et enregistré localement');
        await AsyncStorage.setItem('fcmToken', token);
      }
    } catch (error) {
      console.error('❌ Erreur envoi pushToken:', error);
    }
  }

  setupMessageListeners() {
    // Foreground
    messaging().onMessage(async remoteMessage => {
      console.log("📱 Message foreground:", remoteMessage);
      const { title, body } = remoteMessage.notification || {};
      const type = remoteMessage.data?.type;

      if (type === 'new_publication' || type === 'publication') {
        this.notifyListeners(remoteMessage.data);
      }

      await notifee.displayNotification({
        title: title || 'Notification',
        body: body || '',
        android: { channelId: 'default', importance: AndroidImportance.HIGH },
      });
    });

    // Background
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      const type = remoteMessage.data?.type;
      if (type === 'new_publication' || type === 'publication') {
        this.notifyListeners(remoteMessage.data);
      }
    });

    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log("📱 Notification tap:", remoteMessage);
    });

    messaging().getInitialNotification().then(remoteMessage => {
      if (remoteMessage) console.log("📱 Notification cold start:", remoteMessage);
    });
  }

async initialize() {
  console.log('🔹 NotificationService initialisation');

  // Permissions Android 13+
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) return null;
  }

  // Créer canal notification Android
  if (Platform.OS === 'android' && notifee.createChannel) {
    await notifee.createChannel({
      id: 'default',
      name: 'Notifications',
      importance: AndroidImportance.HIGH,
    });
  }

  // Permission FCM
  const hasPermission = await this.requestPermission();
  if (!hasPermission) return null;

  // Récupérer nouveau token
  const token = await this.getToken();

  // Stocker localement et sur le serveur (si userId existe déjà)
  const userId = await AsyncStorage.getItem('userId');
  if (token && userId) {
    await this.sendTokenToServerIfChanged(token, userId);
  }

  // Listeners notifications
  this.setupMessageListeners();

  return token; // ✅ renvoie le token au LoginScreen
    }
}

export default new NotificationService();



