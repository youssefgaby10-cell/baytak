// Service Worker للإشعارات (Firebase Cloud Messaging)
// الإعدادات هنا عامة بطبيعتها (نفس إعدادات الموقع في src/firebase/firebase.js).

importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCvO2b_elpWibINBvk8So8QbWpurKHe5II",
  authDomain: "baytak-6bf35.firebaseapp.com",
  projectId: "baytak-6bf35",
  storageBucket: "baytak-6bf35.firebasestorage.app",
  messagingSenderId: "1093185507535",
  appId: "1:1093185507535:web:545f44a47f84d963b527ba",
});

const messaging = firebase.messaging();

// السيرفر يرسل رسائل بيانات فقط (data)، فنعرض الإشعار بأنفسنا (بدون تكرار)
messaging.onBackgroundMessage((payload) => {
  const data = payload.data || {};

  self.registration.showNotification(data.title || "Baytak", {
    body: data.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/badge-96.png",
    dir: "rtl",
    lang: "ar",
    tag: data.tag || undefined,
    data: { url: data.url || "/notifications" },
  });
});

// الضغط على الإشعار يفتح الصفحة المناسبة
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const target = new URL(
    (event.notification.data && event.notification.data.url) || "/notifications",
    self.location.origin
  ).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windows) => {
        for (const client of windows) {
          if (client.url.startsWith(self.location.origin) && "focus" in client) {
            if ("navigate" in client) client.navigate(target);
            return client.focus();
          }
        }

        return self.clients.openWindow(target);
      })
  );
});
