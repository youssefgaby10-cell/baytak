import { useLanguage } from "../../context/LanguageContext.jsx";
import "../../styles/Register.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import ReCAPTCHA from "react-google-recaptcha";

function Register() {
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

  const { t } = useLanguage();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false); // 1. حالة الشروط والأحكام
  const [captchaVerified, setCaptchaVerified] = useState(false); // حالة الكابتشا

  const [errors, setErrors] = useState({});

  const handleRegister = () => {
    let newErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Full Name is required.";
    }

    if (!email.trim()) {
      newErrors.email = t.emailRequired || "Email is required.";
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone Number is required.";
    }

    if (!password) {
      newErrors.password = t.passwordRequired || "Password is required.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm Password is required.";
    }

    if (password && confirmPassword && password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (!selectedRole) {
      newErrors.role = t.chooseAccountType || "Please choose an account type.";
    }

    if (!captchaVerified) {
      newErrors.captcha = "Please verify that you are not a robot.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length !== 0) {
      return;
    }

    const accountType = selectedRole === "owner" ? "مالك" : "مستأجر";

    try {
      const registeredUsers = getRegisteredUsers();
      const normalizedEmail = email.trim().toLowerCase();

      const emailExists = registeredUsers.some(
        (user) => user.email?.trim().toLowerCase() === normalizedEmail
      );

      if (emailExists) {
        setErrors({
          email: "This email is already registered.",
        });
        return;
      }

      const newUser = {
        id: crypto.randomUUID(),
        fullName: fullName.trim(),
        name: fullName.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        password,
        accountType,
        profileImage: "",
      };

      const updatedUsers = [...registeredUsers, newUser];

      localStorage.setItem("baytakUsers", JSON.stringify(updatedUsers));
      localStorage.setItem("baytakUser", JSON.stringify(newUser));
      localStorage.removeItem("baytakLoggedIn");

      alert(t.accountCreatedSuccessfully || "Account created successfully!");
      navigate("/login");

    } catch (error) {
      console.error("Error creating account:", error);
      setErrors({
        general: t.somethingWentWrongTryAgain || "Something went wrong, please try again.",
      });
    }
  };

  return (
    <div className="register-page">
      <div className="logo-section">
        <img src="/images/logo.png" alt="Baytak" className="logo" />
        <h1>Baytak</h1>
        <h2>{t.register}</h2>
        <p className="register-subtitle">{t.registerDescription}</p>
      </div>

      <div className="register-card">
        {/* Full Name */}
        <div className="input-group">
          <label>{t.fullName}</label>
          <input
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          {errors.fullName && <span className="error-text">{errors.fullName}</span>}
        </div>

        {/* Email */}
        <div className="input-group">
          <label>{t.email}</label>
          <input
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        {/* Phone */}
        <div className="input-group">
          <label>{t.phoneNumber}</label>
          <input
            type="tel"
            placeholder="+20 1XXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          {errors.phone && <span className="error-text">{errors.phone}</span>}
        </div>

        {/* Password */}
        <div className="input-group">
          <label>{t.password}</label>
          <div className="password-wrapper">
            <input
              className="password-input"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {errors.password && <span className="error-text">{errors.password}</span>}
        </div>

        {/* Confirm Password */}
        <div className="input-group">
          <label>{t.confirmPassword}</label>
          <div className="password-wrapper">
            <input
              className="password-input"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {errors.confirmPassword && (
            <span className="error-text">{errors.confirmPassword}</span>
          )}
        </div>

        {/* Account Type */}
        <div className="account-type">
          <h3>{t.chooseAccount}</h3>
          <div className="account-cards">
            <button
              type="button"
              className={`account-card ${
                selectedRole === "tenant" ? "active" : ""
              }`}
              onClick={() => setSelectedRole("tenant")}
            >
              <div className="account-icon">🏠</div>
              <h4>{t.tenant}</h4>
              <p>Search for apartments, houses and properties.</p>
            </button>

            <button
              type="button"
              className={`account-card ${
                selectedRole === "owner" ? "active" : ""
              }`}
              onClick={() => setSelectedRole("owner")}
            >
              <div className="account-icon">🏢</div>
              <h4>{t.owner}</h4>
              <p>Publish and manage your property listings.</p>
            </button>
          </div>
          {errors.role && <span className="error-text">{errors.role}</span>}
        </div>

        {/* Terms */}
        <label className="terms-check">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
          />
          <span>
            {t.termsAgreement} <a href="#">{t.termsOfService}</a> and{" "}
            <a href="#">{t.privacyPolicy}</a>
          </span>
        </label>

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
        {errors.captcha && <span className="error-text" style={{ textAlign: "center", display: "block", marginBottom: "10px" }}>{errors.captcha}</span>}

        {/* Register Button */}
        <button
          type="button"
          className="register-btn"
          onClick={handleRegister}
        >
          {t.createAccount}
        </button>

        {/* Divider */}
        <div className="divider">
          <span>{t.orContinueWith}</span>
        </div>

        {/* Google */}
        <button type="button" className="google-btn">
          <img src="/images/google.png" alt="Google" className="google-icon" />
          <span>Google</span>
        </button>

        {/* Login */}
        <p className="login-text">
          {t.alreadyHaveAccount}{" "}
          <Link to="/login">{t.login}</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;