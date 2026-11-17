import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaGlobe,
  FaCheck,
} from "react-icons/fa";

import "../../styles/Language.css";
import { useLanguage } from "../../context/LanguageContext";

function Language() {
  const navigate = useNavigate();

  const {
    language,
    changeLanguage,
    t,
  } = useLanguage();

  const handleSave = () => {
    navigate("/settings");
  };

  return (
    <div className="language-page">

      <div className="language-header">

        <button
          type="button"
          className="language-back-btn"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft />
        </button>

        <h1>{t.language}</h1>

      </div>

      <div className="language-icon">
        <FaGlobe />
      </div>

      <h2 className="language-title">
        {language === "ar"
          ? "اختر لغة التطبيق"
          : "Choose App Language"}
      </h2>

      <p className="language-description">
        {language === "ar"
          ? "اختر اللغة التي تريد استخدامها في تطبيق Baytak."
          : "Choose the language you want to use in Baytak."}
      </p>

      <div className="language-options">

        <button
          type="button"
          className={`language-option ${
            language === "ar"
              ? "selected"
              : ""
          }`}
          onClick={() =>
            changeLanguage("ar")
          }
        >
          <div className="language-option-info">

            <span className="language-name">
              العربية
            </span>

            <span className="language-native">
              العربية
            </span>

          </div>

          {language === "ar" && (
            <div className="language-check">
              <FaCheck />
            </div>
          )}

        </button>

        <button
          type="button"
          className={`language-option ${
            language === "en"
              ? "selected"
              : ""
          }`}
          onClick={() =>
            changeLanguage("en")
          }
        >
          <div className="language-option-info">

            <span className="language-name">
              English
            </span>

            <span className="language-native">
              English
            </span>

          </div>

          {language === "en" && (
            <div className="language-check">
              <FaCheck />
            </div>
          )}

        </button>

      </div>

      <button
        type="button"
        className="save-language-btn"
        onClick={handleSave}
      >
        {t.save}
      </button>

      <button
        type="button"
        className="cancel-language-btn"
        onClick={() => navigate(-1)}
      >
        {t.cancel}
      </button>

    </div>
  );
}

export default Language;