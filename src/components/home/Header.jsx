import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell, FaUserCircle } from "react-icons/fa";

import { useLanguage } from "../../context/LanguageContext.jsx";

function Header() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [profileImage, setProfileImage] = useState("");
  const [username, setUsername] = useState("Username");
  const [hasNotifications, setHasNotifications] = useState(false); // 1. حالة لتحديد وجود إشعارات

  useEffect(() => {
    const loadUser = () => {
      const savedUser = localStorage.getItem("baytakUser");

      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);

          if (user.fullName) {
            setUsername(user.fullName);
          }

          if (user.profileImage) {
            setProfileImage(user.profileImage);
          } else {
            setProfileImage("");
          }
        } catch (error) {
          console.error("Error loading user data:", error);
        }
      }

      // 2. فحص هل يوجد إشعارات أو رسائل جديدة (مثلاً ممتلئة في localStorage أو كمثال افتراضي)
      const savedNotifications = localStorage.getItem("baytakNotifications");
      if (savedNotifications) {
        try {
          const notifs = JSON.parse(savedNotifications);
          setHasNotifications(Array.isArray(notifs) && notifs.length > 0);
        } catch (e) {
          setHasNotifications(false);
        }
      } else {
        // افتراضيًا تقدر تخليها false أو true للتجربة
        setHasNotifications(true); 
      }
    };

    loadUser();

    window.addEventListener("storage", loadUser);

    return () => {
      window.removeEventListener("storage", loadUser);
    };
  }, []);

  const navigateToProfile = () => {
    window.location.href = "/profile";
  };

  return (
    <header className="home-header">

      <button
        type="button"
        className="notification-btn"
        aria-label={t.notifications}
        onClick={() => navigate("/notifications")}
      >
        <FaBell />
        {/* 3. النقطة الحمراء تظهر فقط إذا كانت hasNotifications تساوي true */}
        {hasNotifications && <span className="notification-dot"></span>}
      </button>

      <div
        className="user-info"
        onClick={navigateToProfile}
        style={{ cursor: "pointer" }}
      >

        {profileImage ? (
          <img
            src={profileImage}
            alt={t.profileAlt}
            className="user-avatar"
          />
        ) : (
          <FaUserCircle className="user-avatar" />
        )}

        <div>
          <p className="good-morning">
            {t.goodMorning}
          </p>

          <h3 className="username">
            {username}
          </h3>
        </div>

      </div>

    </header>
  );
}

export default Header;