import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaEnvelope,
  FaShieldAlt,
} from "react-icons/fa";

import { useLanguage } from "../../context/LanguageContext.jsx";
import { verifyBeforeUpdateEmail } from "firebase/auth";
import { auth } from "../../firebase/firebase.js";
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

  const handleSave = async () => {
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

    const currentUser = auth.currentUser;

    if (!currentUser) {
      setError("سجّل الدخول مرة أخرى ثم أعد المحاولة.");
      return;
    }

    try {
      // Firebase يرسل رابط تأكيد للبريد الجديد، ولا يتغير البريد إلا بعد الضغط عليه
      await verifyBeforeUpdateEmail(currentUser, cleanNewEmail);

      alert(
        "أرسلنا رابط تأكيد إلى البريد الجديد. اضغط عليه لإتمام التغيير، ثم سجّل الدخول من جديد."
      );

      navigate("/settings");
    } catch (err) {
      console.error("Change email error:", err);

      if (err?.code === "auth/requires-recent-login") {
        setError(
          "لأسباب أمنية، سجّل الخروج ثم سجّل الدخول مرة أخرى وأعد المحاولة."
        );
      } else if (err?.code === "auth/email-already-in-use") {
        setError("هذا البريد مستخدم بالفعل في حساب آخر.");
      } else if (err?.code === "auth/invalid-email") {
        setError("من فضلك أدخل بريدًا إلكترونيًا صحيحًا.");
      } else {
        setError("حدث خطأ. حاول مرة أخرى.");
      }
    }
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