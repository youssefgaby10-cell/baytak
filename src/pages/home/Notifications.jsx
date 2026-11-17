import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaBell } from "react-icons/fa";
import { useLanguage } from "../../context/LanguageContext";
import "../../styles/Notifications.css";

function Notifications() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isArabic = language === "ar" || language === "العربية";

  return (
    <main className="notifications-page" dir={isArabic ? "rtl" : "ltr"}>
      <header className="notifications-header">
        <button type="button" onClick={() => navigate(-1)} aria-label={isArabic ? "رجوع" : "Back"}>
          <FaArrowLeft style={{ transform: isArabic ? "none" : "scaleX(-1)" }} />
        </button>
        <h1>
          {t.notificationsTitle || (isArabic ? "الإشعارات" : "Notifications")}
        </h1>
      </header>
      
      <section className="notifications-content">
        <FaBell aria-hidden="true" />
        <p>
          {t.noNotifications || (isArabic ? "لا توجد إشعارات حالياً" : "No notifications available")}
        </p>
      </section>
    </main>
  );
}

export default Notifications;