import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaEnvelope } from "react-icons/fa";

import { useLanguage } from "../../context/LanguageContext.jsx";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase/firebase.js";
import "../../styles/ForgotPassword.css";

function ForgotPassword() {
  const { t } = useLanguage();

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError(t.pleaseEnterEmail);
      return;
    }

    setLoading(true);

    try {
      await sendPasswordResetEmail(
        auth,
        email.trim().toLowerCase()
      );

      // Firebase لا يكشف إن كان البريد مسجلاً أم لا (حماية من تخمين الحسابات)
      setSuccess(
        "لو كان هذا البريد مسجلاً لدينا، فقد أرسلنا إليه رابط إعادة تعيين كلمة المرور. راجع صندوق الوارد (وأيضاً Spam)."
      );
    } catch (err) {
      console.error("Password reset error:", err);

      if (err?.code === "auth/invalid-email") {
        setError("البريد الإلكتروني غير صالح.");
      } else if (err?.code === "auth/too-many-requests") {
        setError("محاولات كثيرة. حاول مرة أخرى بعد قليل.");
      } else if (err?.code === "auth/network-request-failed") {
        setError("تعذر الاتصال بالإنترنت. حاول مرة أخرى.");
      } else {
        setError(t.somethingWentWrongTryAgain);
      }
    } finally {
      setLoading(false);
    }
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

        {success && (
          <div
            className="forgot-error"
            style={{ color: "#16a34a" }}
            role="status"
          >
            {success}
          </div>
        )}

        {/* Send Code */}

        <button
          className="forgot-send-btn"
          onClick={handleSendCode}
          disabled={loading}
        >
          {loading
            ? "جاري الإرسال..."
            : "إرسال رابط إعادة التعيين"}
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