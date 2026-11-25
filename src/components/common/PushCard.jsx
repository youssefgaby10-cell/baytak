import { useEffect, useState } from "react";
import { FaBell } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext.jsx";

// بطاقة تفعيل/إيقاف إشعارات الموبايل على هذا الجهاز (داخل صفحة الإشعارات)
export default function PushCard({ isArabic }) {
  const { user } = useAuth();
  const [state, setState] = useState("checking");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    import("../../services/pushService.js")
      .then(({ getPushState }) => getPushState())
      .then((value) => {
        if (!cancelled) setState(value);
      })
      .catch(() => {
        if (!cancelled) setState("unsupported");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleEnable = async () => {
    if (!user?.uid) return;

    setBusy(true);
    setMessage("");

    try {
      const { enablePush } = await import("../../services/pushService.js");
      const result = await enablePush(user.uid);

      if (result.ok) {
        setState("enabled");
      } else if (result.reason === "denied") {
        setState("denied");
      } else {
        setMessage(
          isArabic
            ? "لم يتم تفعيل الإشعارات. حاول مرة أخرى."
            : "Notifications were not enabled. Please try again."
        );
      }
    } catch (error) {
      console.error("Enable push failed:", error);
      setMessage(
        isArabic
          ? "حدث خطأ أثناء تفعيل الإشعارات."
          : "Something went wrong enabling notifications."
      );
    } finally {
      setBusy(false);
    }
  };

  const handleDisable = async () => {
    setBusy(true);

    try {
      const { disablePush } = await import("../../services/pushService.js");
      await disablePush();
      setState("available");
    } finally {
      setBusy(false);
    }
  };

  // لا نعرض شيئاً لو الجهاز لا يدعم الإشعارات أو لم يتم إعداد الخدمة
  if (state === "checking" || state === "unsupported" || state === "no-config") {
    return null;
  }

  return (
    <div className="push-card">
      <span className="push-card-icon" aria-hidden="true">
        <FaBell />
      </span>

      <div className="push-card-body">
        <strong>
          {isArabic ? "إشعارات الموبايل" : "Mobile notifications"}
        </strong>

        <span>
          {state === "enabled" &&
            (isArabic
              ? "مفعّلة على هذا الجهاز. هتوصلك إشعارات الطلبات حتى والموقع مقفول."
              : "Enabled on this device. You will get request alerts even when the site is closed.")}

          {state === "available" &&
            (isArabic
              ? "فعّلها لتوصلك إشعارات طلبات المعاينة والردود حتى والموقع مقفول."
              : "Turn on to receive viewing request alerts even when the site is closed.")}

          {state === "denied" &&
            (isArabic
              ? "الإشعارات محظورة من إعدادات المتصفح. فعّلها من إعدادات الموقع (علامة القفل بجانب الرابط) ثم حدّث الصفحة."
              : "Notifications are blocked in your browser. Allow them in the site settings (lock icon next to the URL) and refresh.")}

          {message && ` ${message}`}
        </span>
      </div>

      {state === "available" && (
        <button type="button" onClick={handleEnable} disabled={busy}>
          {busy ? "..." : isArabic ? "تفعيل" : "Enable"}
        </button>
      )}

      {state === "enabled" && (
        <button type="button" className="secondary" onClick={handleDisable} disabled={busy}>
          {busy ? "..." : isArabic ? "إيقاف" : "Turn off"}
        </button>
      )}
    </div>
  );
}
