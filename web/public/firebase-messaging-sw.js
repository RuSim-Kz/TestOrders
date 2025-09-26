importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

// Полная конфигурация (исключаем ошибки отсутствия projectId)
firebase.initializeApp({
  apiKey: 'AIzaSyA3pUCjV4LNIqqVgZfGdS_uchmh-HQdlLY',
  authDomain: 'app1-db850.firebaseapp.com',
  projectId: 'app1-db850',
  messagingSenderId: '528949615273',
  appId: '1:528949615273:web:41c13c2c1398e1f7d1e7b8'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  const title = payload.notification?.title || 'Сообщение';
  const options = { body: payload.notification?.body || '', data: payload.data || {} };
  self.registration.showNotification(title, options);
});


