import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useLanguage } from "../../context/LanguageContext.jsx";
import "../../styles/Login.css";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebase/firebase.js";
import ReCAPTCHA from "react-google-recaptcha";

const OTP_API =
  "https://baytak-otp.youssefgaby10.workers.dev";

const getRegisteredUsers = () => {
  try {
    const users = JSON.parse(
      localStorage.getItem("baytakUsers") || "[]"
    );

    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
};

function Login() {
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  const isArabic = language === "ar";

  const [selectedRole, setSelectedRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [staySignedIn, setStaySignedIn] = useState(false);

  const [errors, setErrors] = useState({});

  // OTP states
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [pendingUser, setPendingUser] = useState(null);

  const [loading, setLoading] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false); // حالة الكابتشا

  const clearError = (field) => {
    setErrors((previous) => {
      const updated = { ...previous };
      delete updated[field];
      return updated;
    });
  };

  // إرسال OTP
  const sendOTP = async (userEmail) => {
    const response = await fetch(`${OTP_API}/send-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: userEmail,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message ||
          (isArabic
            ? "فشل إرسال كود التحقق."
            : "Failed to send verification code.")
      );
    }

    return data;
  };

  // المرحلة الأولى: التحقق من بيانات الحساب
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
      newErrors.captcha = isArabic ? "يرجى تأكيد أنك لست روبوتاً." : "Please verify that you are not a robot.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const registeredUsers = getRegisteredUsers();

    const registeredUser = registeredUsers.find(
      (user) =>
        user.email?.trim().toLowerCase() === normalizedEmail &&
        user.password === password
    );

    if (!registeredUser) {
      setErrors({
        general: t.incorrectCredentials,
      });
      return;
    }

    const selectedAccountType =
      selectedRole === "owner" ? "مالك" : "مستأجر";

    if (registeredUser.accountType !== selectedAccountType) {
      setErrors({
        role: isArabic
          ? `هذا الحساب مسجل بصفة ${
              registeredUser.accountType || ""
            }`
          : `This account is registered as ${
              registeredUser.accountType || "another account type"
            }.`,
      });
      return;
    }

    const userWithId = {
      ...registeredUser,
      id: registeredUser.id || crypto.randomUUID(),
      name: registeredUser.name || registeredUser.fullName || "",
    };

    setLoading(true);
    setErrors({});

    try {
      await sendOTP(normalizedEmail);

      // حفظ الحساب مؤقتًا داخل React فقط
      setPendingUser(userWithId);

      // الانتقال لمرحلة OTP
      setOtpStep(true);
      setOtp("");
      setCaptchaVerified(false);
    } catch (error) {
      setErrors({
        general: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // المرحلة الثانية: التحقق من OTP
  const handleVerifyOTP = async (event) => {
    event.preventDefault();

    if (!otp || otp.length !== 6) {
      setErrors({
        otp: isArabic
          ? "أدخل كود التحقق المكوّن من 6 أرقام."
          : "Enter the 6-digit verification code.",
      });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${OTP_API}/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: pendingUser.email.trim().toLowerCase(),
          code: otp,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.verified) {
        throw new Error(
          data.message ||
            (isArabic
              ? "كود التحقق غير صحيح."
              : "Invalid verification code.")
        );
      }

      // نجاح OTP: تسجيل الدخول
      const registeredUsers = getRegisteredUsers();

      const updatedUsers = registeredUsers.map((user) =>
        user.email?.trim().toLowerCase() ===
        pendingUser.email.trim().toLowerCase()
          ? pendingUser
          : user
      );

      localStorage.setItem(
        "baytakUsers",
        JSON.stringify(updatedUsers)
      );

      localStorage.setItem(
        "baytakUser",
        JSON.stringify(pendingUser)
      );

      localStorage.setItem("baytakLoggedIn", "true");

      localStorage.setItem(
        "baytakStaySignedIn",
        String(staySignedIn)
      );

      setErrors({});
      navigate("/home");
    } catch (error) {
      setErrors({
        otp: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // إعادة إرسال الكود
  const handleResendOTP = async () => {
    setLoading(true);
    setErrors({});

    try {
      await sendOTP(pendingUser.email);
      setOtp("");

      setErrors({
        otpSuccess: isArabic
          ? "تم إرسال كود جديد إلى بريدك الإلكتروني."
          : "A new code has been sent to your email.",
      });
    } catch (error) {
      setErrors({
        otp: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Google Login
  const handleGoogleLogin = async () => {
    if (!selectedRole) {
      setErrors({
        role: t.chooseAccountType,
      });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const result = await signInWithPopup(
        auth,
        googleProvider
      );

      const googleUser = result.user;
      const normalizedEmail = googleUser.email
        ?.trim()
        .toLowerCase();

      if (!normalizedEmail) {
        throw new Error(
          isArabic
            ? "لم يتم الحصول على البريد الإلكتروني."
            : "Google did not provide an email."
        );
      }

      const selectedAccountType =
        selectedRole === "owner" ? "مالك" : "مستأجر";

      const registeredUsers = getRegisteredUsers();

      const existingUser = registeredUsers.find(
        (user) =>
          user.email?.trim().toLowerCase() === normalizedEmail
      );

      // لو الحساب موجود بالفعل بنوع مختلف
      if (
        existingUser &&
        existingUser.accountType !== selectedAccountType
      ) {
        await auth.signOut();

        setErrors({
          role: isArabic
            ? `هذا الحساب مسجل بصفة ${existingUser.accountType}`
            : `This account is registered as ${existingUser.accountType}.`,
        });

        return;
      }

      const baytakUser = {
        ...(existingUser || {}),
        id: existingUser?.id || googleUser.uid,
        uid: googleUser.uid,
        name:
          existingUser?.name ||
          googleUser.displayName ||
          "",
        email: normalizedEmail,
        photoURL: googleUser.photoURL || "",
        accountType: selectedAccountType,
        authProvider: "google",
      };

      const updatedUsers = existingUser
        ? registeredUsers.map((user) =>
            user.email?.trim().toLowerCase() === normalizedEmail
              ? baytakUser
              : user
          )
        : [...registeredUsers, baytakUser];

      localStorage.setItem(
        "baytakUsers",
        JSON.stringify(updatedUsers)
      );

      localStorage.setItem(
        "baytakUser",
        JSON.stringify(baytakUser)
      );

      localStorage.setItem("baytakLoggedIn", "true");

      localStorage.setItem(
        "baytakStaySignedIn",
        String(staySignedIn)
      );

      navigate("/home");
    } catch (error) {
      console.error("Google login error:", error);

      setErrors({
        general: isArabic
          ? "فشل تسجيل الدخول باستخدام Google."
          : "Google sign-in failed.",
      });
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

        <h2>
          {otpStep
            ? isArabic
              ? "التحقق من البريد الإلكتروني"
              : "Email Verification"
            : t.login}
        </h2>

        <p className="login-subtitle">
          {otpStep
            ? isArabic
              ? `أرسلنا كود تحقق إلى ${pendingUser?.email}`
              : `We sent a verification code to ${pendingUser?.email}`
            : t.welcomeBack}
        </p>

        {!otpStep && (
          <p className="premium-text">
            {t.premiumRealEstate}
          </p>
        )}
      </div>

      {/* OTP screen */}
      {otpStep ? (
        <form
          className="login-card"
          onSubmit={handleVerifyOTP}
        >
          {errors.general && (
            <div className="error-text" role="alert">
              {errors.general}
            </div>
          )}

          {errors.otpSuccess && (
            <div className="success-text" role="status">
              {errors.otpSuccess}
            </div>
          )}

          <div className="input-group">
            <label htmlFor="login-otp">
              {isArabic
                ? "كود التحقق"
                : "Verification Code"}
            </label>

            <input
              id="login-otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(event) => {
                const value = event.target.value
                  .replace(/\D/g, "")
                  .slice(0, 6);

                setOtp(value);
                clearError("otp");
                clearError("otpSuccess");
              }}
            />

            {errors.otp && (
              <span className="error-text" role="alert">
                {errors.otp}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading
              ? isArabic
                ? "جارٍ التحقق..."
                : "Verifying..."
              : isArabic
                ? "تأكيد الكود"
                : "Verify Code"}
          </button>

          <button
            type="button"
            className="google-btn"
            onClick={handleResendOTP}
            disabled={loading}
          >
            {isArabic
              ? "إعادة إرسال الكود"
              : "Resend Code"}
          </button>

          <button
            type="button"
            className="google-btn"
            onClick={() => {
              setOtpStep(false);
              setPendingUser(null);
              setOtp("");
              setErrors({});
            }}
          >
            {isArabic
              ? "العودة لتسجيل الدخول"
              : "Back to Login"}
          </button>
        </form>
      ) : (
        // Login screen
        <form className="login-card" onSubmit={handleLogin}>
          {errors.general && (
            <div className="error-text" role="alert">
              {errors.general}
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
              theme="dark"
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
                ? "جارٍ إرسال الكود..."
                : "Sending code..."
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
      )}
    </div>
  );
}

export default Login;