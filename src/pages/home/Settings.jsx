import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";

import {
  FaArrowRight,
  FaUser,
  FaLock,
  FaPhone,
  FaEnvelope,
  FaGlobe,
  FaBell,
  FaMoon,
  FaQuestionCircle,
  FaFileAlt,
  FaComments,
  FaInfoCircle,
  FaSignOutAlt,
} from "react-icons/fa";

import "../../styles/Settings.css";

function Settings() {
  const navigate = useNavigate();

  const { darkMode, toggleDarkMode } = useTheme();
  const { language, t } = useLanguage();

  /* Notifications */
  const [notificationsEnabled, setNotificationsEnabled] =
    useState(() => {
      const saved = localStorage.getItem(
        "baytakNotifications"
      );

      return saved === null
        ? true
        : saved === "true";
    });

  const toggleNotifications = () => {
    setNotificationsEnabled((current) => {
      const newValue = !current;

      localStorage.setItem(
        "baytakNotifications",
        String(newValue)
      );

      return newValue;
    });
  };

  /* User */
  const [user, setUser] = useState({
    fullName: "أحمد محمد",
    phone: "01012345678",
    email: "ahmed@example.com",
    accountType: "مالك",
  });

  useEffect(() => {
  const loadUser = () => {
    const savedUser = localStorage.getItem("baytakUser");

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error(
          "Error loading user data:",
          error
        );
      }
    }
  };

  loadUser();

  window.addEventListener("storage", loadUser);

  return () => {
    window.removeEventListener("storage", loadUser);
  };
}, []);

  return (
    <div className="settings-page">

      {/* ================= HEADER ================= */}

      <div className="settings-header">

        <button
          type="button"
          className="settings-back-btn"
          onClick={() => navigate("/home")}
        >
          <FaArrowRight />
        </button>

        <h1>{t.settings}</h1>

<div className="settings-profile-image">
  {user.profileImage ? (
    <img
      src={user.profileImage}
      alt={
        language === "ar"
          ? "الملف الشخصي"
          : "Profile"
      }
    />
  ) : (
    <div className="settings-profile-placeholder">
      {user.fullName
        ? user.fullName.charAt(0)
        : "؟"}
    </div>
  )}
</div>

      </div>

      {/* ================= ACCOUNT ================= */}

      <section className="settings-section">

        <h2>{t.account}</h2>

        {/* Edit Profile */}

        <button
          type="button"
          className="settings-item"
          onClick={() =>
            navigate("/edit-profile")
          }
        >
          <span>{t.editProfile}</span>

          <div className="settings-item-left">
            <FaUser />
            <span>‹</span>
          </div>
        </button>

        {/* Change Password */}

        <button
          type="button"
          className="settings-item"
          onClick={() =>
            navigate("/change-password")
          }
        >
          <span>{t.changePassword}</span>

          <div className="settings-item-left">
            <FaLock />
            <span>‹</span>
          </div>
        </button>

        {/* Change Phone */}

        <button
          type="button"
          className="settings-item"
          onClick={() =>
            navigate("/change-phone-number")
          }
        >
          <span>{t.changePhone}</span>

          <div className="settings-item-left">
            <FaPhone />
            <span>‹</span>
          </div>
        </button>

        {/* Change Email */}

        <button
          type="button"
          className="settings-item"
          onClick={() =>
            navigate("/change-email")
          }
        >
          <span>{t.changeEmail}</span>

          <div className="settings-item-left">
            <FaEnvelope />
            <span>‹</span>
          </div>
        </button>

      </section>

      {/* ================= APPLICATION ================= */}

      <section className="settings-section">

        <h2>{t.application}</h2>

        {/* Language */}

        <button
          type="button"
          className="settings-item"
          onClick={() =>
            navigate("/language")
          }
        >
          <span>{t.language}</span>

          <div className="settings-item-left">

            <span className="settings-value">
              {language === "ar"
                ? t.arabic
                : t.english}
            </span>

            <FaGlobe />

          </div>
        </button>

        {/* Notifications */}

        <button
          type="button"
          className="settings-item"
          onClick={toggleNotifications}
        >
          <span>{t.notifications}</span>

          <div className="settings-item-left">

            <div
              className={`settings-switch ${
                notificationsEnabled
                  ? "active"
                  : ""
              }`}
            >
              <span></span>
            </div>

            <FaBell />

          </div>
        </button>

        {/* Dark Mode */}

        <button
          type="button"
          className="settings-item"
          onClick={toggleDarkMode}
        >
          <span>
            {t.darkMode}
          </span>

          <div className="settings-item-left">

            <div
              className={`settings-switch ${
                darkMode
                  ? "active"
                  : ""
              }`}
            >
              <span></span>
            </div>

            <FaMoon />

          </div>
        </button>

      </section>

      {/* ================= HELP ================= */}

      <section className="settings-section">

        {/* Help */}

        <button
          type="button"
          className="settings-item"
          onClick={() =>
            navigate("/help")
          }
        >
          <span>{t.help}</span>

          <div className="settings-item-left">
            <FaQuestionCircle />
            <span>‹</span>
          </div>
        </button>

        {/* Privacy Policy */}

        <button
          type="button"
          className="settings-item"
          onClick={() =>
            navigate("/privacy-policy")
          }
        >
          <span>{t.privacyPolicy}</span>

          <div className="settings-item-left">
            <FaFileAlt />
            <span>‹</span>
          </div>
        </button>

        {/* Contact Us */}

        <button
          type="button"
          className="settings-item"
          onClick={() =>
            navigate("/contact-us")
          }
        >
          <span>{t.contactUs}</span>

          <div className="settings-item-left">
            <FaComments />
            <span>‹</span>
          </div>
        </button>

        {/* About App */}

        <button
          type="button"
          className="settings-item"
          onClick={() =>
            navigate("/about-app")
          }
        >
          <span>{t.aboutApp}</span>

          <div className="settings-item-left">
            <FaInfoCircle />
            <span>‹</span>
          </div>
        </button>

      </section>

      {/* ================= LOGOUT ================= */}

      <button
  type="button"
  className="logout-btn"
  onClick={() => {
    const message =
      language === "ar"
        ? "هل أنت متأكد أنك تريد تسجيل الخروج؟"
        : "Are you sure you want to log out?";

    const confirmLogout =
      window.confirm(message);

    if (confirmLogout) {
      localStorage.removeItem(
        "baytakLoggedIn"
      );

      localStorage.removeItem(
        "baytakStaySignedIn"
      );

      navigate("/login");
    }
  }}
>
  <FaSignOutAlt />
  {t.logout}
</button>

    </div>
  );
}

export default Settings;