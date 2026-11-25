import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaBell } from "react-icons/fa";
import { useLanguage } from "../../context/LanguageContext";
import { useProperties } from "../../context/PropertyContext";
import PushCard from "../../components/common/PushCard";
import "../../styles/Notifications.css";

// صفحة الطلبات التي يفتحها كل نوع إشعار
const NOTIFICATION_TARGETS = {
  viewing_request: "/owner-viewing-requests",
  viewing_cancelled: "/owner-viewing-requests",
  viewing_accepted: "/my-requests",
  viewing_rejected: "/my-requests",
};

function Notifications() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isArabic = language === "ar" || language === "العربية";

  const {
    notifications,
    unreadNotificationsCount,
    markNotificationRead,
    markAllNotificationsRead,
  } = useProperties();

  const formatDate = (value) => {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleString(isArabic ? "ar-EG" : "en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getContent = (notification) => {
    const title = notification.propertyTitle || (isArabic ? "عقار" : "a property");
    const actor =
      notification.actorName || (isArabic ? "مستخدم" : "A user");
    const appointment = formatDate(notification.appointment);

    switch (notification.type) {
      case "viewing_request":
        return {
          heading: isArabic ? "طلب معاينة جديد" : "New viewing request",
          text: isArabic
            ? `${actor} طلب معاينة "${title}"${appointment ? ` في ${appointment}` : ""}.`
            : `${actor} requested a viewing of "${title}"${appointment ? ` on ${appointment}` : ""}.`,
        };

      case "viewing_accepted":
        return {
          heading: isArabic ? "تم قبول طلب المعاينة" : "Viewing request accepted",
          text: isArabic
            ? `وافق المالك على طلب معاينة "${title}"${appointment ? ` في ${appointment}` : ""}.`
            : `The owner accepted your viewing request for "${title}"${appointment ? ` on ${appointment}` : ""}.`,
        };

      case "viewing_rejected":
        return {
          heading: isArabic ? "تم رفض طلب المعاينة" : "Viewing request declined",
          text: isArabic
            ? `اعتذر المالك عن طلب معاينة "${title}".`
            : `The owner declined your viewing request for "${title}".`,
        };

      case "viewing_cancelled":
        return {
          heading: isArabic ? "تم إلغاء طلب معاينة" : "Viewing request cancelled",
          text: isArabic
            ? `${actor} ألغى طلب معاينة "${title}".`
            : `${actor} cancelled the viewing request for "${title}".`,
        };

      default:
        return {
          heading: isArabic ? "إشعار" : "Notification",
          text: "",
        };
    }
  };

  const handleOpen = async (notification) => {
    if (!notification.read) {
      await markNotificationRead(notification.id);
    }

    const target = NOTIFICATION_TARGETS[notification.type];
    if (target) navigate(target);
  };

  return (
    <main className="notifications-page" dir={isArabic ? "rtl" : "ltr"}>
      <header className="notifications-header">
        <button type="button" onClick={() => navigate(-1)} aria-label={isArabic ? "رجوع" : "Back"}>
          <FaArrowLeft style={{ transform: isArabic ? "none" : "scaleX(-1)" }} />
        </button>
        <h1>
          {t.notificationsTitle || (isArabic ? "الإشعارات" : "Notifications")}
        </h1>

        {unreadNotificationsCount > 0 && (
          <button
            type="button"
            className="notifications-read-all"
            onClick={markAllNotificationsRead}
          >
            {isArabic ? "تحديد الكل كمقروء" : "Mark all as read"}
          </button>
        )}
      </header>

      <PushCard isArabic={isArabic} />

      {notifications.length === 0 ? (
        <section className="notifications-content">
          <FaBell aria-hidden="true" />
          <p>
            {t.noNotifications || (isArabic ? "لا توجد إشعارات حالياً" : "No notifications available")}
          </p>
        </section>
      ) : (
        <ul className="notifications-list">
          {notifications.map((notification) => {
            const { heading, text } = getContent(notification);

            return (
              <li key={notification.id}>
                <button
                  type="button"
                  className={`notification-item ${notification.read ? "" : "unread"}`}
                  onClick={() => handleOpen(notification)}
                >
                  <span className="notification-item-icon" aria-hidden="true">
                    <FaBell />
                  </span>

                  <span className="notification-item-body">
                    <strong>{heading}</strong>
                    {text && <span>{text}</span>}
                    <small>{formatDate(notification.createdAt)}</small>
                  </span>

                  {!notification.read && (
                    <span className="notification-item-dot" aria-label={isArabic ? "غير مقروء" : "Unread"} />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

export default Notifications;
