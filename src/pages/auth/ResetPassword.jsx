import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaEye,
  FaEyeSlash,
  FaLock,
} from "react-icons/fa";

import { useLanguage } from "../../context/LanguageContext.jsx";
import "../../styles/ResetPassword.css";

function ResetPassword() {
  const { t } = useLanguage();

  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [errors, setErrors] = useState({});

  const [requirements, setRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  // =========================
  // Check OTP Verification
  // =========================

  useEffect(() => {
    const verified = sessionStorage.getItem(
      "baytakOTPVerified"
    );

    const resetEmail = sessionStorage.getItem(
      "baytakResetEmail"
    );

    if (verified !== "true" || !resetEmail) {
      navigate("/forgot-password");
    }
  }, [navigate]);

  // =========================
  // Password Requirements
  // =========================

  const checkPassword = (value) => {
    setPassword(value);

    setRequirements({
      length: value.length >= 8,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /[0-9]/.test(value),
      special: /[^A-Za-z0-9]/.test(value),
    });

    if (errors.password) {
      setErrors({
        ...errors,
        password: "",
      });
    }
  };

  // =========================
  // Reset Password
  // =========================

  const handleResetPassword = () => {
    let newErrors = {};

    // New password
    if (!password.trim()) {
      newErrors.password =
        t.passwordRequired;
    }

    // Confirm password
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword =
        "Please confirm your password.";
    }

    // All requirements
    const allRequirements =
      requirements.length &&
      requirements.uppercase &&
      requirements.lowercase &&
      requirements.number &&
      requirements.special;

    if (password && !allRequirements) {
      newErrors.password =
        t.passwordMustMeetRequirements;
    }

    // Password match
    if (
      password &&
      confirmPassword &&
      password !== confirmPassword
    ) {
      newErrors.confirmPassword =
        "Passwords do not match.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // =========================
    // Get Saved User
    // =========================

    const savedUser =
      localStorage.getItem("baytakUser");

    if (!savedUser) {
      setErrors({
        general:
          "Account not found. Please register again.",
      });

      return;
    }

    let user;

    try {
      user = JSON.parse(savedUser);
    } catch (error) {
      console.error(
        "Error reading user:",
        error
      );

      setErrors({
        general:
          t.somethingWentWrongTryAgain,
      });

      return;
    }

    // =========================
    // Save New Password
    // =========================

    const updatedUser = {
      ...user,
      password: password,
    };

    localStorage.setItem(
      "baytakUser",
      JSON.stringify(updatedUser)
    );

    // =========================
    // Clear OTP Data
    // =========================

    sessionStorage.removeItem(
      "baytakResetOTP"
    );

    sessionStorage.removeItem(
      "baytakOTPVerified"
    );

    // =========================
    // Go To Success Screen
    // =========================

    navigate("/password-changed");
  };

  return (
    <div
      className="reset-password-page"
      dir="rtl"
    >
      {/* Back Button */}

      <button
        type="button"
        className="reset-back-btn"
        onClick={() => navigate("/login")}
      >
        <FaArrowLeft />
      </button>

      {/* Header */}

      <div className="reset-header">

        <div className="reset-icon">
          <FaLock />
        </div>

        <h1>
          {t.changePassword}
        </h1>

        <p>
          {t.createNewPassword}
        </p>

      </div>

      {/* Card */}

      <div className="reset-card">

        {/* General Error */}

        {errors.general && (
          <div className="reset-error">
            {errors.general}
          </div>
        )}

        {/* New Password */}

        <div className="reset-input-group">

          <label>
            {t.newPassword}
          </label>

          <div className="reset-password-wrapper">

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="••••••••"
              value={password}
              onChange={(e) =>
                checkPassword(
                  e.target.value
                )
              }
            />

            <button
              type="button"
              className="reset-eye-btn"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
            >
              {showPassword ? (
                <FaEyeSlash />
              ) : (
                <FaEye />
              )}
            </button>

          </div>

          {errors.password && (
            <span className="reset-error-text">
              {errors.password}
            </span>
          )}

        </div>

        {/* Confirm Password */}

        <div className="reset-input-group">

          <label>
            {t.confirmPassword}
          </label>

          <div className="reset-password-wrapper">

            <input
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => {

                setConfirmPassword(
                  e.target.value
                );

                if (
                  errors.confirmPassword
                ) {
                  setErrors({
                    ...errors,
                    confirmPassword: "",
                  });
                }

              }}
            />

            <button
              type="button"
              className="reset-eye-btn"
              onClick={() =>
                setShowConfirmPassword(
                  !showConfirmPassword
                )
              }
            >
              {showConfirmPassword ? (
                <FaEyeSlash />
              ) : (
                <FaEye />
              )}
            </button>

          </div>

          {errors.confirmPassword && (
            <span className="reset-error-text">
              {errors.confirmPassword}
            </span>
          )}

        </div>

        {/* Password Requirements */}

        <div className="password-requirements">

          <h3>
            {t.passwordRequirementsHeading}
          </h3>

          <div
            className={
              requirements.length
                ? "requirement valid"
                : "requirement"
            }
          >
            <span>
              {requirements.length
                ? "✓"
                : "○"}
            </span>

            {t.minimumEightCharacters}
          </div>

          <div
            className={
              requirements.uppercase
                ? "requirement valid"
                : "requirement"
            }
          >
            <span>
              {requirements.uppercase
                ? "✓"
                : "○"}
            </span>

            {t.uppercaseRequirement}
          </div>

          <div
            className={
              requirements.lowercase
                ? "requirement valid"
                : "requirement"
            }
          >
            <span>
              {requirements.lowercase
                ? "✓"
                : "○"}
            </span>

            {t.lowercaseRequirement}
          </div>

          <div
            className={
              requirements.number
                ? "requirement valid"
                : "requirement"
            }
          >
            <span>
              {requirements.number
                ? "✓"
                : "○"}
            </span>

            {t.numberRequirement}
          </div>

          <div
            className={
              requirements.special
                ? "requirement valid"
                : "requirement"
            }
          >
            <span>
              {requirements.special
                ? "✓"
                : "○"}
            </span>

            {t.specialCharacterRequirement}
          </div>

        </div>

        {/* Change Password Button */}

        <button
          type="button"
          className="reset-btn"
          onClick={handleResetPassword}
        >
          {t.changePassword}
        </button>

      </div>
    </div>
  );
}

export default ResetPassword;