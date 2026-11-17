import { useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaFileAlt,
  FaShieldAlt,
} from "react-icons/fa";

import { useLanguage } from "../../context/LanguageContext.jsx";
import "../../styles/PrivacyPolicy.css";

function PrivacyPolicy() {
  const { t } = useLanguage();

  const navigate = useNavigate();

  return (
    <div className="privacy-page">

      {/* Header */}
      <div className="privacy-header">

        <button
          className="privacy-back-btn"
          onClick={() => navigate(-1)}
        >
          <FaArrowRight />
        </button>

        <h1>{t.privacyPolicy}</h1>

        <FaFileAlt className="privacy-header-icon" />

      </div>

      {/* Intro */}
      <div className="privacy-intro">

        <div className="privacy-main-icon">
          <FaShieldAlt />
        </div>

        <h2>{t.privacyIntroTitle}</h2>

        <p>
          {t.privacyIntroDescription}
        </p>

      </div>

      {/* Content */}
      <div className="privacy-content">

        <section className="privacy-card">
          <h2>{t.privacySection1}</h2>

          <p>
            {t.privacyInfoCollectedDescription}
          </p>
        </section>

        <section className="privacy-card">
          <h2>{t.privacySection2}</h2>

          <p>
            {t.privacyInfoUsageDescription}
          </p>
        </section>

        <section className="privacy-card">
          <h2>{t.privacySection3}</h2>

          <p>
            {t.privacyDataProtectionDescription}
          </p>
        </section>

        <section className="privacy-card">
          <h2>{t.privacySection4}</h2>

          <p>
            {t.privacyLoginDataDescription}
          </p>
        </section>

        <section className="privacy-card">
          <h2>{t.privacySection5}</h2>

          <p>
            {t.privacyPolicyUpdatesDescription}
          </p>
        </section>

        <section className="privacy-card">
          <h2>{t.privacySection6}</h2>

          <p>
            {t.privacyContactDescription}
          </p>
        </section>

      </div>

      <div className="privacy-footer">
        {t.lastUpdated}
      </div>

    </div>
  );
}

export default PrivacyPolicy;