import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaMobileAlt,
  FaPhone,
  FaPhoneAlt,
  FaInfoCircle,
  FaShieldAlt,
} from "react-icons/fa";

import { useLanguage } from "../../context/LanguageContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import "../../styles/ChangePhoneNumber.css";

function ChangePhoneNumber() {
  const { t } = useLanguage();
  const { updateUserProfile } = useAuth();

  const navigate = useNavigate();

  const [currentPhone, setCurrentPhone] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("baytakUser");

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);

        setCurrentPhone(user.phone || "");
      } catch (error) {
        console.error(
          "Error loading user data:",
          error
        );
      }
    }
  }, []);

  const handleSave = async () => {
    setError("");

    const cleanCurrentPhone =
      currentPhone.trim();

    const cleanNewPhone =
      newPhone.trim();

    /* Empty */

    if (!cleanNewPhone) {
      setError(
        "لازم تدخل رقم الهاتف الجديد."
      );
      return;
    }

    /* Egyptian phone validation */

    const egyptianPhoneRegex =
      /^01[0125][0-9]{8}$/;

    if (!egyptianPhoneRegex.test(cleanNewPhone)) {
      setError(
        "من فضلك أدخل رقم هاتف مصري صحيح."
      );
      return;
    }

    /* Same phone */

    if (
      cleanCurrentPhone &&
      cleanNewPhone === cleanCurrentPhone
    ) {
      setError(
        "رقم الهاتف الجديد يجب أن يكون مختلفًا عن الرقم الحالي."
      );
      return;
    }

    try {
      await updateUserProfile({ phone: cleanNewPhone });
      navigate("/settings");
    } catch (err) {
      console.error("Error saving phone number:", err);
      setError("حدث خطأ أثناء حفظ رقم الهاتف. حاول مرة أخرى.");
    }
  };

  return (
    <div className="change-phone-page">

      {/* Header */}

      <div className="change-phone-header">

        <button
          type="button"
          className="change-phone-back-btn"
          onClick={() => navigate(-1)}
        >
          <FaArrowRight />
        </button>

        <h1>
          {t.changePhone}
        </h1>

      </div>

      {/* Icon */}

      <div className="change-phone-icon">
        <FaMobileAlt />
      </div>

      {/* Description */}

      <p className="change-phone-description">
        {t.enterNewPhoneDescription}
      </p>

      {/* Current Phone */}

      <div className="phone-form-group">

        <label htmlFor="currentPhone">
          {t.currentPhone}
        </label>

        <div className="phone-input-wrapper">

          <input
            id="currentPhone"
            type="tel"
            value={currentPhone}
            readOnly
            placeholder="01xxxxxxxxx"
          />

          <FaPhone />

        </div>

      </div>

      {/* New Phone */}

      <div className="phone-form-group">

        <label htmlFor="newPhone">
          {t.newPhone}
        </label>

        <div className="phone-input-wrapper">

          <input
            id="newPhone"
            type="tel"
            value={newPhone}
            onChange={(e) => {
              const value =
                e.target.value.replace(
                  /\D/g,
                  ""
                );

              setNewPhone(value);

              if (error) {
                setError("");
              }
            }}
            placeholder="01xxxxxxxxx"
            maxLength={11}
          />

          <FaPhoneAlt />

        </div>

        <div className="phone-info">
          <FaInfoCircle />

          <span>
            {t.phoneSmsAvailability}
          </span>
        </div>

        {error && (
          <div className="change-phone-error">
            {error}
          </div>
        )}

      </div>

      {/* Buttons */}

      <div className="change-phone-actions">

        <button
          type="button"
          className="save-phone-btn"
          onClick={handleSave}
        >
          {t.save}
        </button>

        <button
          type="button"
          className="cancel-phone-btn"
          onClick={() => navigate(-1)}
        >
          {t.cancel}
        </button>

      </div>

      {/* Privacy */}

      <div className="phone-privacy">

        <div className="privacy-title">

          <FaShieldAlt />

          <span>
            {t.phonePrivacyTitle}
          </span>

        </div>

        <p>{t.phonePrivacyDescription}</p>

      </div>

    </div>
  );
}

export default ChangePhoneNumber;