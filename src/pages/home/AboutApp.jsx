import { useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaInfoCircle,
  FaCode,
  FaGlobe,
  FaEnvelope,
  FaShareAlt,
  FaHome,
} from "react-icons/fa";

import { useLanguage } from "../../context/LanguageContext.jsx";
import "../../styles/AboutApp.css";

function AboutApp() {
  const { t } = useLanguage();

  const navigate = useNavigate();

  const openWebsite = () => {
    window.open("https://www.baytak.com", "_blank");
  };

  const openEmail = () => {
    window.location.href = "mailto:support@baytak.com";
  };

  const shareApp = async () => {
    const shareData = {
      title: t.aboutAppBrand,
      text: t.appShareText,
      url: window.location.origin,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          window.location.origin
        );

        alert(t.shareLinkCopied);
      }
    } catch (error) {
      console.log("Share cancelled.");
    }
  };

  return (
    <div className="about-app-page">

      {/* Header */}
      <div className="about-app-header">

        <button
          type="button"
          className="about-app-back-btn"
          onClick={() => navigate(-1)}
        >
          <FaArrowRight />
        </button>

        <h1>{t.aboutApp}</h1>

        <div className="about-app-header-space"></div>

      </div>

      {/* App Logo */}
      <div className="about-app-top">

        <div className="about-app-logo">
          <FaHome />
        </div>

        <h2>
          {t.aboutAppBrand}
        </h2>

        <p className="about-app-version-title">
          {t.appVersion} <strong>1.0.0</strong>
        </p>

      </div>

      {/* About */}
      <div className="about-app-card">

        <div className="about-app-card-title">

          <h3>{t.aboutWebsite}</h3>

          <FaInfoCircle />

        </div>

        <p>{t.aboutWebsiteDescription}</p>

      </div>

      {/* Developer */}
      <div className="about-app-card">

        <div className="about-app-card-title">

          <h3>{t.developerInformation}</h3>

          <FaCode />

        </div>

        <p>{t.developerInformationDescription}</p>

      </div>

      {/* Links */}
      <div className="about-app-links">

        <button
          type="button"
          className="about-app-link"
          onClick={openWebsite}
        >

          <div className="about-app-link-icon">
            <FaGlobe />
          </div>

          <span>{t.officialWebsite}</span>

          <span className="about-app-arrow">
            ‹
          </span>

        </button>

        <button
          type="button"
          className="about-app-link"
          onClick={openEmail}
        >

          <div className="about-app-link-icon">
            <FaEnvelope />
          </div>

          <span>{t.email}</span>

          <span className="about-app-arrow">
            ‹
          </span>

        </button>

        <button
          type="button"
          className="about-app-link"
          onClick={shareApp}
        >

          <div className="about-app-link-icon">
            <FaShareAlt />
          </div>

          <span>{t.followUsSocial}</span>

          <span className="about-app-arrow">
            ‹
          </span>

        </button>

      </div>

      {/* Footer */}
      <div className="about-app-footer">

        <p>
          <strong>© 2026</strong>{" "}
          {t.appCopyright}
        </p>

        <span>
          {t.appVersion}
        </span>

      </div>

    </div>
  );
}

export default AboutApp;