import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { apiPost } from './api';

let messaging: Messaging | null = null;

export function initFirebase(): void {
  if (typeof window === 'undefined') return;
  if (messaging) return;

  const envConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  };

  const fallbackConfig = {
    apiKey: 'AIzaSyA3pUCjV4LNIqqVgZfGdS_uchmh-HQdlLY',
    authDomain: 'app1-db850.firebaseapp.com',
    projectId: 'app1-db850',
    messagingSenderId: '528949615273',
    appId: '1:528949615273:web:41c13c2c1398e1f7d1e7b8'
  };

  const firebaseConfig = (
    envConfig.apiKey && envConfig.appId && envConfig.messagingSenderId && envConfig.projectId
  ) ? envConfig : fallbackConfig;
  const app = initializeApp(firebaseConfig);
  messaging = getMessaging(app);
}

export async function enableFcm(userId: string): Promise<string | null> {
  if (!messaging) initFirebase();
  if (!messaging) return null;
  try {
    // Проверяем поддержку уведомлений
    if (typeof Notification === 'undefined') {
      alert('Этот браузер не поддерживает уведомления');
      return null;
    }

    // Запрашиваем разрешение на уведомления
    if (Notification.permission === 'denied') {
      alert('Уведомления заблокированы. Разрешите уведомления в настройках браузера и обновите страницу.');
      return null;
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('Уведомления не разрешены. Разрешите уведомления и попробуйте снова.');
        return null;
      }
    }

    // Регистрируем Service Worker (с fallback для Edge)
    let registration;
    try {
      registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service Worker registered:', registration);
    } catch (swError) {
      console.warn('Service Worker registration failed, trying without SW:', swError);
      // Для Edge пробуем без Service Worker
      registration = null;
    }

    // Получаем FCM токен
    const token = await getToken(messaging, { 
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY, 
      serviceWorkerRegistration: registration || undefined
    });
    
    if (token) {
      console.log('FCM token', token);
      await apiPost(`/users/${userId}/fcm`, { token });
      alert('Уведомления включены!');
    } else {
      alert('Не удалось получить токен уведомлений');
      return null;
    }

    // Настраиваем обработку сообщений
    onMessage(messaging, (payload) => {
      alert((payload.notification?.title || 'FCM') + '\n' + (payload.notification?.body || ''));
    });
    
    return token;
  } catch (e) {
    console.error('enableFcm error', e);
    alert('Ошибка настройки уведомлений: ' + (e instanceof Error ? e.message : String(e)));
    return null;
  }
}


