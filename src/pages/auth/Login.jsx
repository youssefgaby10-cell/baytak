import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getAuthErrorMessage } from "../../utils/authErrors.js";
import "../../styles/Login.css";
import ReCAPTCHA from "react-google-recaptcha";
import { useSeo } from "../../utils/useSeo.js";

function Login() {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { login, loginWithGoogle, resendVerificationEmail } = useAuth();

  useSeo({
    title: "تسجيل الدخول | Baytak",
    description:
      "سجّل الدخول إلى Baytak للبحث عن شقق وعقارات للبيع والإيجار أو لنشر عقاراتك وإدارتها.",
  });

  const isArabic = language === "ar";

  const [selectedRole, setSelectedRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [staySignedIn, setStaySignedIn] = useState(false);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resending, setResending] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const clearError = (field) => {
    setErrors((previous) => {
      const updated = { ...previous };
      delete updated[field];
      return updated;
    });
  };

  const accountTypeFromRole = (role) =>
    role === "owner" ? "مالك" : "مستأجر";

  // رسالة خطأ نوع الحساب
  const roleMismatchMessage = (actualType) =>
    isArabic
      ? `هذا الحساب مسجل بصفة ${actualType || ""}`
      : `This account is registered as ${actualType || "another account type"}.`;

  const handleAuthError = (error) => {
    if (error?.code === "baytak/email-not-verified") {
      setNeedsVerification(true);
      setErrors({
        general: isArabic
          ? "لازم تأكد بريدك الإلكتروني أولاً. افتح رابط التأكيد اللي وصلك (وراجع Spam)."
          : "Please confirm your email first. Open the confirmation link we sent you (check Spam too).",
      });
      return;
    }

    if (error?.code === "baytak/role-mismatch") {
      setErrors({ role: roleMismatchMessage(error.actualType) });
      return;
    }

    if (
      error?.code === "auth/invalid-credential" ||
      error?.code === "auth/user-not-found" ||
      error?.code === "auth/wrong-password"
    ) {
      setErrors({ general: t.incorrectCredentials });
      return;
    }

    console.error("Login error:", error);
    setErrors({ general: getAuthErrorMessage(error, isArabic) });
  };

  // إعادة إرسال رابط تأكيد البريد
  const handleResendVerification = async () => {
    if (!email.trim() || !password) {
      setErrors({
        general: isArabic
          ? "اكتب البريد وكلمة المرور أولاً ثم اضغط إعادة الإرسال."
          : "Enter your email and password first, then resend.",
      });
      return;
    }

    setResending(true);
    setErrors({});
    setInfoMessage("");

    try {
      const result = await resendVerificationEmail({ email, password });

      setInfoMessage(
        result.alreadyVerified
          ? isArabic
            ? "بريدك مؤكد بالفعل، سجّل الدخول الآن."
            : "Your email is already confirmed. You can log in now."
          : isArabic
            ? "أرسلنا رابط تأكيد جديد إلى بريدك. اضغط عليه ثم سجّل الدخول."
            : "We sent a new confirmation link to your email. Click it, then log in."
      );

      if (result.alreadyVerified) setNeedsVerification(false);
    } catch (error) {
      handleAuthError(error);
    } finally {
      setResending(false);
    }
  };

  // تسجيل الدخول بالبريد وكلمة المرور (Firebase Auth)
  const handleLogin = async (event) => {
    event.preventDefault();

    const newErrors = {};
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      newErrors.email = t.emailRequired;
    }

    if (!password) {
      newErrors.password = t.passwordRequired;
    }

    if (!selectedRole) {
      newErrors.role = t.chooseAccountType;
    }

    if (!captchaVerified) {
      newErrors.captcha = isArabic
        ? "يرجى تأكيد أنك لست روبوتاً."
        : "Please verify that you are not a robot.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    setInfoMessage("");
    setNeedsVerification(false);

    try {
      await login({
        email: normalizedEmail,
        password,
        accountType: accountTypeFromRole(selectedRole),
        staySignedIn,
      });

      navigate("/home");
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  // تسجيل الدخول بحساب Google
  const handleGoogleLogin = async () => {
    if (!selectedRole) {
      setErrors({ role: t.chooseAccountType });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await loginWithGoogle({
        accountType: accountTypeFromRole(selectedRole),
        staySignedIn,
      });

      navigate("/home");
    } catch (error) {
      if (
        error?.code === "auth/popup-closed-by-user" ||
        error?.code === "auth/cancelled-popup-request"
      ) {
        return;
      }

      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" dir={isArabic ? "rtl" : "ltr"}>
      <div className="logo-section">
        <img
          src="/images/logo.png"
          alt="Baytak"
          className="logo"
        />

        <h1>Baytak</h1>

        <h2>{t.login}</h2>

        <p className="login-subtitle">{t.welcomeBack}</p>

        <p className="premium-text">{t.premiumRealEstate}</p>
      </div>

        <form className="login-card" onSubmit={handleLogin}>
          {errors.general && (
            <div className="error-text" role="alert">
              {errors.general}
            </div>
          )}

          {needsVerification && (
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resending}
              style={{
                margin: "6px 0 14px",
                padding: "10px 14px",
                borderRadius: "10px",
                border: "1px solid #2563eb",
                background: "transparent",
                color: "#2563eb",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {resending
                ? isArabic
                  ? "جارٍ الإرسال..."
                  : "Sending..."
                : isArabic
                  ? "إعادة إرسال رابط التأكيد"
                  : "Resend confirmation link"}
            </button>
          )}

          {infoMessage && (
            <div
              role="status"
              style={{ color: "#16a34a", fontSize: "14px", margin: "6px 0 14px" }}
            >
              {infoMessage}
            </div>
          )}

          <div className="input-group">
            <label htmlFor="login-email">{t.email}</label>

            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                clearError("email");
                clearError("general");
              }}
            />

            {errors.email && (
              <span className="error-text" role="alert">
                {errors.email}
              </span>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="login-password">{t.password}</label>

            <div className="password-wrapper">
              <input
                id="login-password"
                className="password-input"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  clearError("password");
                  clearError("general");
                }}
              />

              <button
                type="button"
                className="eye-btn"
                aria-label={
                  showPassword
                    ? isArabic
                      ? "إخفاء كلمة المرور"
                      : "Hide password"
                    : isArabic
                      ? "إظهار كلمة المرور"
                      : "Show password"
                }
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {errors.password && (
              <span className="error-text" role="alert">
                {errors.password}
              </span>
            )}
          </div>

          <div className="login-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={staySignedIn}
                onChange={(event) =>
                  setStaySignedIn(event.target.checked)
                }
              />

              <span>{t.staySignedIn}</span>
            </label>

            <Link to="/forgot-password" className="forgot-link">
              {t.forgotPassword}
            </Link>
          </div>

          {/* reCAPTCHA */}
          <div style={{ margin: "15px 0", display: "flex", justifyContent: "center" }}>
            <ReCAPTCHA
              sitekey="6LdDHCIuAAAAAKESaC0_FH_twfDhlOaXIwaiZ7S2"
              theme="light"
              onChange={(value) => {
                if (value) setCaptchaVerified(true);
              }}
              onExpired={() => setCaptchaVerified(false)}
            />
          </div>
          {errors.captcha && <span className="error-text" role="alert" style={{ textAlign: "center", display: "block", marginBottom: "10px" }}>{errors.captcha}</span>}

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading
              ? isArabic
                ? "جارٍ تسجيل الدخول..."
                : "Signing in..."
              : t.loginArrow ||
                (isArabic
                  ? "تسجيل الدخول ←"
                  : "Login →")}
          </button>

          <div className="divider">
            <span>{t.orContinueWith}</span>
          </div>

          <button
            type="button"
            className="google-btn"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <img
              src="/images/google.png"
              alt=""
              className="google-icon"
            />

            <span>
              {loading
                ? isArabic
                  ? "جارٍ تسجيل الدخول..."
                  : "Signing in..."
                : "Google"}
            </span>
          </button>

          <div className="account-type">
            <h3>{t.chooseAccount}</h3>

            <div className="account-cards">
              <button
                type="button"
                className={`account-card ${
                  selectedRole === "tenant" ? "active" : ""
                }`}
                aria-pressed={selectedRole === "tenant"}
                onClick={() => {
                  setSelectedRole("tenant");
                  clearError("role");
                  clearError("general");
                }}
              >
                <div className="account-icon">🏠</div>
                <h4>{t.tenant}</h4>
                <p>{t.tenantDescription}</p>
              </button>

              <button
                type="button"
                className={`account-card ${
                  selectedRole === "owner" ? "active" : ""
                }`}
                aria-pressed={selectedRole === "owner"}
                onClick={() => {
                  setSelectedRole("owner");
                  clearError("role");
                  clearError("general");
                }}
              >
                <div className="account-icon">🏢</div>
                <h4>{t.owner}</h4>
                <p>{t.ownerDescription}</p>
              </button>
            </div>

            {errors.role && (
              <span className="error-text" role="alert">
                {errors.role}
              </span>
            )}
          </div>

          <p className="register-text">
            {t.noAccount}{" "}
            <Link to="/register">{t.signUp}</Link>
          </p>
        </form>
    </div>
  );
}

export default Login;
