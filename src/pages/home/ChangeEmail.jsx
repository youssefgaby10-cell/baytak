import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaEnvelope,
  FaShieldAlt,
} from "react-icons/fa";

import { useLanguage } from "../../context/LanguageContext.jsx";
import "../../styles/ChangeEmail.css";

function ChangeEmail() {
  const { t } = useLanguage();

  const navigate = useNavigate();

  const [currentEmail, setCurrentEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("baytakUser");

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);

        setCurrentEmail(user.email || "");
      } catch (error) {
        console.error(
          "Error loading user data:",
          error
        );
      }
    }
  }, []);

  const handleSave = () => {
    setError("");

    const oldEmail = currentEmail.trim().toLowerCase();
    const cleanNewEmail = newEmail.trim().toLowerCase();

    if (!cleanNewEmail) {
      setError(
        "لازم تدخل البريد الإلكتروني الجديد."
      );
      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanNewEmail)) {
      setError(
        "من فضلك أدخل بريدًا إلكترونيًا صحيحًا."
      );
      return;
    }

    if (
      oldEmail &&
      oldEmail === cleanNewEmail
    ) {
      setError(
        "البريد الإلكتروني الجديد هو نفس البريد الحالي."
      );
      return;
    }

    const savedUser =
      localStorage.getItem("baytakUser");

    let user = {};

    if (savedUser) {
      try {
        user = JSON.parse(savedUser);
      } catch (error) {
        console.error(
          "Error reading user data:",
          error
        );
      }
    }

    const updatedUser = {
      ...user,
      email: cleanNewEmail,
    };

    localStorage.setItem(
      "baytakUser",
      JSON.stringify(updatedUser)
    );

    // للتوافق مع أي كود قديم يستخدم هذا المفتاح
    localStorage.setItem(
      "baytakEmail",
      cleanNewEmail
    );

    navigate("/settings");
  };

  return (
    <div className="change-email-page">

      {/* Header */}

      <div className="change-email-header">

        <button
          type="button"
          className="change-email-back-btn"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft />
        </button>

        <h1>
          {t.changeEmail}
        </h1>

      </div>

      {/* Icon */}

      <div className="change-email-icon">
        <FaEnvelope />
      </div>

      {/* Title */}

      <h2 className="change-email-title">
        {t.updateEmail}
      </h2>

      {/* Description */}

      <p className="change-email-description">
        {t.enterNewEmailDescription}
      </p>

      {/* Current Email */}

      <div className="email-form-group">

        <label htmlFor="currentEmail">
          {t.currentEmail}
        </label>

        <div className="email-input-wrapper">

          <input
            id="currentEmail"
            type="email"
            value={currentEmail}
            readOnly
            placeholder="example@mail.com"
          />

          <FaEnvelope />

        </div>

      </div>

      {/* New Email */}

      <div className="email-form-group">

        <label htmlFor="newEmail">
          {t.newEmail}
        </label>

        <div className="email-input-wrapper">

          <input
            id="newEmail"
            type="email"
            value={newEmail}
            onChange={(e) => {
              setNewEmail(e.target.value);

              if (error) {
                setError("");
              }
            }}
            placeholder="new-email@mail.com"
          />

          <FaEnvelope />

        </div>

        {error && (
          <div className="change-email-error">
            {error}
          </div>
        )}

      </div>

      {/* Buttons */}

      <div className="change-email-actions">

        <button
          type="button"
          className="save-email-btn"
          onClick={handleSave}
        >
          {t.save}
        </button>

        <button
          type="button"
          className="cancel-email-btn"
          onClick={() => navigate(-1)}
        >
          {t.cancel}
        </button>

      </div>

      {/* Privacy */}

      <div className="email-privacy">

        <FaShieldAlt />

        <span>
          {t.privacyProtection}
        </span>

      </div>

    </div>
  );
}

export default ChangeEmail;