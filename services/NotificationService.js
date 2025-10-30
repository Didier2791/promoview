/* 


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
 */


/* import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { API_URL } from '../config';

// Configuration du comportement des notifications en foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  listeners = [];
  notificationListener = null;
  responseListener = null;

  // Abonnement d'un composant aux notifications (évite les doublons)
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
    if (Platform.OS === 'web' || !Device.isDevice) {
      console.log('⚠️ Notifications non supportées sur web/simulateur');
      return false;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      const enabled = finalStatus === 'granted';
      console.log(enabled ? '✅ Permission accordée' : '❌ Permission refusée');
      return enabled;
    } catch (error) {
      console.error('Erreur demande permission:', error);
      return false;
    }
  }

  async getToken() {
    if (Platform.OS === 'web' || !Device.isDevice) return null;

    try {
      const token = (await Notifications.getExpoPushTokenAsync({
        projectId: '28455f1e-7e2a-4d97-9456-29a396d2d9a5', // Votre projectId depuis app.json
      })).data;

      console.log('🔑 Expo Push Token récupéré:', token);
      return token;
    } catch (error) {
      console.error('Erreur récupération token:', error);
      return null;
    }
  }

  async sendTokenToServerIfChanged(token, userId) {
    if (!token || !userId) return;

    try {
      const storedToken = await AsyncStorage.getItem('expoPushToken');
      if (storedToken === token) {
        console.log('✅ Token inchangé, pas besoin d\'envoyer au serveur');
        return;
      }

      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) return;

      const response = await fetch(`${API_URL}/api/push-tokens`, {

        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
      body: JSON.stringify({ pushToken: token, platform: Platform.OS }),

      });

      if (!response.ok) {
        console.error('❌ Erreur serveur envoi pushToken:', response.status, await response.text());
      } else {
        console.log('📡 Token Expo envoyé au serveur et enregistré localement');
        await AsyncStorage.setItem('expoPushToken', token);
      }
    } catch (error) {
      console.error('❌ Erreur envoi pushToken:', error);
    }
  }

  setupMessageListeners() {
    // Notifications reçues en foreground
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('📱 Notification reçue (foreground):', notification);
      
      const data = notification.request.content.data;
      const type = data?.type;

      if (type === 'new_publication' || type === 'publication') {
        this.notifyListeners(data);
      }
    });

    // Notifications tapées par l'utilisateur
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('📱 Notification tapée:', response);
      
      const data = response.notification.request.content.data;
      const type = data?.type;

      if (type === 'new_publication' || type === 'publication') {
        this.notifyListeners(data);
      }
    });

    // Notification qui a lancé l'app (cold start)
    Notifications.getLastNotificationResponseAsync().then(response => {
      if (response) {
        console.log('📱 Notification cold start:', response);
        const data = response.notification.request.content.data;
        if (data?.type === 'new_publication' || data?.type === 'publication') {
          this.notifyListeners(data);
        }
      }
    });
  }

  async initialize() {
    console.log('🔹 NotificationService initialisation (Expo)');

    if (Platform.OS === 'web' || !Device.isDevice) {
      console.log('⚠️ Pas d\'initialisation sur web/simulateur');
      return null;
    }

    // Configuration du canal Android (obligatoire pour Android 8+)
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Notifications',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    // Permission
    const hasPermission = await this.requestPermission();
    if (!hasPermission) return null;

    // Récupérer token
    const token = await this.getToken();

    // Stocker et envoyer au serveur
    const userId = await AsyncStorage.getItem('userId');
    if (token && userId) {
      await this.sendTokenToServerIfChanged(token, userId);
    }

    // Listeners notifications
    this.setupMessageListeners();

    return token;
  }

  // Nettoyage des listeners (à appeler lors du démontage)
  cleanup() {
    if (this.notificationListener) {
      this.notificationListener.remove();
    }
    if (this.responseListener) {
      this.responseListener.remove();
    }
  }
}

export default new NotificationService(); */



// services/NotificationService.js (version iOS adaptée à ton backend)
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { API_URL } from '../config';

// Configuration du comportement des notifications en foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  listeners = [];
  notificationListener = null;
  responseListener = null;

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
    if (Platform.OS === 'web' || !Device.isDevice) {
      console.log('⚠️ Notifications non supportées sur web/simulateur');
      return false;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      const enabled = finalStatus === 'granted';
      console.log(enabled ? '✅ Permission accordée' : '❌ Permission refusée');
      return enabled;
    } catch (error) {
      console.error('Erreur demande permission:', error);
      return false;
    }
  }

  async getToken() {
    if (!Device.isDevice) {
      console.log('⚠️ Pas de token sur simulateur');
      return null;
    }

    try {
      const { data: token } = await Notifications.getExpoPushTokenAsync({
        projectId: '28455f1e-7e2a-4d97-9456-29a396d2d9a5', // ton projectId Expo
      });
      console.log('🔑 Expo Push Token récupéré:', token);
      return token;
    } catch (error) {
      console.error('❌ Erreur récupération token:', error);
      return null;
    }
  }

  async sendTokenToServerIfChanged(token, userId) {
    if (!token || !userId) return;

    try {
      const storedToken = await AsyncStorage.getItem('expoPushToken');
      if (storedToken === token) {
        console.log('✅ Token inchangé, pas besoin d’envoyer au serveur');
        return;
      }

      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        console.log('⚠️ Aucun userToken disponible, arrêt');
        return;
      }

      // ✅ Même endpoint que pour Android
      const response = await fetch(
        `${API_URL}/api/admin/utilisateurs/${userId}/push-token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({ pushToken: token }),
        }
      );

      if (!response.ok) {
        console.error(
          '❌ Erreur serveur envoi pushToken:',
          response.status,
          await response.text()
        );
      } else {
        console.log('📡 Token Expo envoyé au serveur et enregistré localement');
        await AsyncStorage.setItem('expoPushToken', token);
      }
    } catch (error) {
      console.error('❌ Erreur envoi pushToken:', error);
    }
  }

  setupMessageListeners() {
    // Foreground
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('📱 Notification reçue (foreground):', notification);
      const data = notification.request.content.data;
      const type = data?.type;
      if (type === 'new_publication' || type === 'publication') {
        this.notifyListeners(data);
      }
    });

    // Notification tapée
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('📱 Notification tapée:', response);
      const data = response.notification.request.content.data;
      const type = data?.type;
      if (type === 'new_publication' || type === 'publication') {
        this.notifyListeners(data);
      }
    });

    // Cold start
    Notifications.getLastNotificationResponseAsync().then(response => {
      if (response) {
        console.log('📱 Notification cold start:', response);
        const data = response.notification.request.content.data;
        if (data?.type === 'new_publication' || data?.type === 'publication') {
          this.notifyListeners(data);
        }
      }
    });
  }

  async initialize() {
    console.log('🔹 NotificationService initialisation iOS');

    if (!Device.isDevice) {
      console.log('⚠️ Pas d’initialisation sur simulateur');
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Notifications',
        importance: Notifications.AndroidImportance.HIGH,
      });
    }

    const hasPermission = await this.requestPermission();
    if (!hasPermission) return null;

    const token = await this.getToken();
    const userId = await AsyncStorage.getItem('userId');

    if (token && userId) {
      await this.sendTokenToServerIfChanged(token, userId);
    }

    this.setupMessageListeners();

    return token;
  }

  cleanup() {
    if (this.notificationListener) this.notificationListener.remove();
    if (this.responseListener) this.responseListener.remove();
  }
}

export default new NotificationService();
