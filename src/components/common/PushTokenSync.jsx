import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";

// لا يعرض شيئاً: يربط جهاز المستخدم بإشعارات الموبايل لو كان وافق عليها من قبل
export default function PushTokenSync() {
  const { user } = useAuth();
  const uid = user?.uid;

  useEffect(() => {
    if (!uid) return undefined;

    let cancelled = false;

    import("../../services/pushService.js")
      .then(({ syncPushToken }) => (cancelled ? null : syncPushToken(uid)))
      .catch((error) => console.warn("Push sync failed:", error?.code || error));

    return () => {
      cancelled = true;
    };
  }, [uid]);

  return null;
}
