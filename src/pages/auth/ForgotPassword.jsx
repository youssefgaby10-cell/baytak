import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaEnvelope } from "react-icons/fa";

import { useLanguage } from "../../context/LanguageContext.jsx";
import "../../styles/ForgotPassword.css";

function ForgotPassword() {
  const { t } = useLanguage();

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendCode = () => {
    setError("");

    /* =========================
       Validate Email
    ========================= */

    if (!email.trim()) {
      setError(t.pleaseEnterEmail);
      return;
    }

    /* =========================
       Get Registered User
    ========================= */

    const savedUser =
      localStorage.getItem("baytakUser");

    if (!savedUser) {
      setError(
        t.noAccountFound
      );
      return;
    }

    let user;

    try {
      user = JSON.parse(savedUser);
    } catch (error) {
      console.error(
        "Error reading user data:",
        error
      );

      setError(
        t.somethingWentWrongTryAgain
      );

      return;
    }

    /* =========================
       Check Email
    ========================= */

    if (
      user.email.toLowerCase() !==
      email.trim().toLowerCase()
    ) {
      setError(
        "This email is not registered."
      );

      return;
    }

    /* =========================
       Generate OTP
       
       IMPORTANT:
       This is a temporary frontend
       OTP until we connect a real
       email service/backend.
    ========================= */

    const otp =
      Math.floor(
        100000 + Math.random() * 900000
      ).toString();

    sessionStorage.setItem(
      "baytakResetEmail",
      email.trim().toLowerCase()
    );

    sessionStorage.setItem(
      "baytakResetOTP",
      otp
    );

    setLoading(true);

    /*
      Temporary development behavior.

      In the real version, this OTP will be
      sent to the user's email through the backend.
    */

    setTimeout(() => {
      setLoading(false);

      console.log(
        "Baytak Reset OTP:",
        otp
      );

      navigate("/verify-otp");
    }, 800);
  };

  return (
    <div
      className="forgot-password-page"
      dir="rtl"
    >

      {/* =========================
          Back
      ========================= */}

      <button
        className="forgot-back-btn"
        onClick={() => navigate("/login")}
      >
        <FaArrowLeft />
      </button>

      {/* =========================
          Header
      ========================= */}

      <div className="forgot-header">

        <div className="forgot-icon">
          <FaEnvelope />
        </div>

        <h1>{t.forgotPassword}</h1>

        <p>
          {t.enterEmailForVerification}
        </p>

      </div>

      {/* =========================
          Card
      ========================= */}

      <div className="forgot-card">

        <div className="forgot-input-group">

          <label>
            {t.email}
          </label>

          <input
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);

              if (error) {
                setError("");
              }
            }}
          />

        </div>

        {/* Error */}

        {error && (
          <div className="forgot-error">
            {error}
          </div>
        )}

        {/* Send Code */}

        <button
          className="forgot-send-btn"
          onClick={handleSendCode}
          disabled={loading}
        >
          {loading
            ? "جاري التحقق..."
            : "إرسال رمز التحقق"}
        </button>

        {/* Back Login */}

        <Link
          to="/login"
          className="forgot-login-link"
        >
          {t.backToLogin}
        </Link>

      </div>

    </div>
  );
}

export default ForgotPassword;