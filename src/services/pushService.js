import { getApp } from "firebase/app";
import { deleteDoc, doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase.js";

// إشعارات الموبايل/المتصفح (Firebase Cloud Messaging)
// مفتاح VAPID عام ويُضاف كمتغير بيئة: VITE_FIREBASE_VAPID_KEY

const TOKEN_KEY = "baytakPushToken";
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || "";

async function isPushSupported() {
  if (
    typeof window === "undefined" ||
    !("Notification" in window) ||
    !("serviceWorker" in navigator)
  ) {
    return false;
  }

  try {
    const { isSupported } = await import("firebase/messaging");
    return await isSupported();
  } catch {
    return false;
  }
}

// الحالة: unsupported | no-config | denied | enabled | available
export async function getPushState() {
  if (!(await isPushSupported())) return "unsupported";
  if (!VAPID_KEY) return "no-config";
  if (Notification.permission === "denied") return "denied";

  if (Notification.permission === "granted" && localStorage.getItem(TOKEN_KEY)) {
    return "enabled";
  }

  return "available";
}

async function fetchToken() {
  const { getMessaging, getToken } = await import("firebase/messaging");

  const registration = await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js"
  );
  await navigator.serviceWorker.ready;

  return getToken(getMessaging(getApp()), {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: registration,
  });
}

async function saveToken(uid, token) {
  await setDoc(doc(db, "pushTokens", token), {
    uid,
    createdAt: new Date().toISOString(),
    userAgent: navigator.userAgent.slice(0, 200),
  });

  localStorage.setItem(TOKEN_KEY, token);
}

// تفعيل الإشعارات على هذا الجهاز (يطلب إذن المتصفح)
export async function enablePush(uid) {
  if (!(await isPushSupported())) return { ok: false, reason: "unsupported" };
  if (!VAPID_KEY) return { ok: false, reason: "no-config" };

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    return { ok: false, reason: permission === "denied" ? "denied" : "dismissed" };
  }

  const token = await fetchToken();

  if (!token) return { ok: false, reason: "no-token" };

  await saveToken(uid, token);

  return { ok: true };
}

// مزامنة صامتة: لو الإذن ممنوح من قبل نربط هذا الجهاز بالمستخدم الحالي
export async function syncPushToken(uid) {
  if (!(await isPushSupported()) || !VAPID_KEY) return;
  if (Notification.permission !== "granted") return;

  const token = await fetchToken();

  if (token) await saveToken(uid, token);
}

// إيقاف الإشعارات على هذا الجهاز
export async function disablePush() {
  const token = localStorage.getItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);

  if (token) {
    try {
      await deleteDoc(doc(db, "pushTokens", token));
    } catch (error) {
      console.warn("تعذر حذف رمز الإشعارات:", error?.code || error);
    }
  }

  try {
    const { getMessaging, deleteToken } = await import("firebase/messaging");
    await deleteToken(getMessaging(getApp()));
  } catch {
    // لا شيء
  }
}

// عند تسجيل الخروج: نفصل هذا الجهاز عن الحساب (يجب استدعاؤها قبل signOut)
export async function unregisterPushToken() {
  const token = localStorage.getItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);

  if (!token) return;

  try {
    await deleteDoc(doc(db, "pushTokens", token));
  } catch {
    // لا شيء
  }
}
