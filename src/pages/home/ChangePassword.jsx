import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
} from "react-icons/fa";

import { useLanguage } from "../../context/LanguageContext.jsx";
import "../../styles/ChangePassword.css";

function ChangePassword() {
  const { t } = useLanguage();

  const navigate = useNavigate();

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordRules = {
    minLength: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[@#$%^&*!]/.test(newPassword),
  };

  const allRulesPassed =
    passwordRules.minLength &&
    passwordRules.uppercase &&
    passwordRules.number &&
    passwordRules.special;

  const handleSavePassword = () => {
  // 1️⃣ التأكد إن كل الخانات متملية
  if (
    !currentPassword.trim() ||
    !newPassword.trim() ||
    !confirmPassword.trim()
  ) {
    alert(t.fillRequiredFields);
    return;
  }

  // 2️⃣ جلب كلمة المرور الحالية المحفوظة
  const savedPassword = localStorage.getItem("baytakPassword");

  // لو مفيش باسورد محفوظ
  if (!savedPassword) {
    alert(t.currentPasswordNotFound);
    return;
  }

  // 3️⃣ التأكد من أن كلمة المرور الحالية صحيحة
  if (currentPassword !== savedPassword) {
    alert(t.currentPasswordIncorrect);
    return;
  }

  // 4️⃣ التأكد من شروط كلمة المرور الجديدة
  if (!allRulesPassed) {
    alert(
      "كلمة المرور الجديدة لا تستوفي جميع الشروط."
    );
    return;
  }

  // 5️⃣ التأكد من تطابق كلمة المرور الجديدة
  if (newPassword !== confirmPassword) {
    alert(t.passwordConfirmationMismatch);
    return;
  }

  // 6️⃣ حفظ كلمة المرور الجديدة
  localStorage.setItem(
    "baytakPassword",
    newPassword
  );

  // 7️⃣ الانتقال لصفحة النجاح
  navigate("/password-changed", {
    state: {
      from: "settings",
    },
  });
};

  const Rule = ({ passed, children }) => {
    return (
      <p
        className={
          passed
            ? "password-rule passed"
            : "password-rule"
        }
      >
        <FaCheckCircle />
        <span>{children}</span>
      </p>
    );
  };

  return (
    <div className="change-password-page">

      {/* Header */}

      <div className="change-password-header">

        <button
          type="button"
          className="change-password-back-btn"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft />
        </button>

        <h1>
          {t.changePassword}
        </h1>

      </div>

      {/* Description */}

      <p className="change-password-description">
        {t.keepAccountSecure}
      </p>

      <div className="password-form">

        {/* Current Password */}

        <div className="password-form-group">

          <label htmlFor="currentPassword">
            {t.currentPassword}
          </label>

          <div className="password-input-wrapper">

            <input
              id="currentPassword"
              type={
                showCurrent
                  ? "text"
                  : "password"
              }
              value={currentPassword}
              onChange={(e) =>
                setCurrentPassword(e.target.value)
              }
              placeholder="••••••••"
            />

            <button
              type="button"
              className="password-eye-btn"
              onClick={() =>
                setShowCurrent(!showCurrent)
              }
            >
              {showCurrent ? (
                <FaEyeSlash />
              ) : (
                <FaEye />
              )}
            </button>

          </div>

        </div>

        {/* New Password */}

        <div className="password-form-group">

          <label htmlFor="newPassword">
            {t.newPassword}
          </label>

          <div className="password-input-wrapper">

            <input
              id="newPassword"
              type={
                showNew
                  ? "text"
                  : "password"
              }
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
              placeholder="••••••••"
            />

            <button
              type="button"
              className="password-eye-btn"
              onClick={() =>
                setShowNew(!showNew)
              }
            >
              {showNew ? (
                <FaEyeSlash />
              ) : (
                <FaEye />
              )}
            </button>

          </div>

        </div>

        {/* Confirm Password */}

        <div className="password-form-group">

          <label htmlFor="confirmPassword">
            {t.confirmNewPassword}
          </label>

          <div className="password-input-wrapper">

            <input
              id="confirmPassword"
              type={
                showConfirm
                  ? "text"
                  : "password"
              }
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="••••••••"
            />

            <button
              type="button"
              className="password-eye-btn"
              onClick={() =>
                setShowConfirm(!showConfirm)
              }
            >
              {showConfirm ? (
                <FaEyeSlash />
              ) : (
                <FaEye />
              )}
            </button>

          </div>

          {confirmPassword &&
            newPassword !== confirmPassword && (
              <p className="password-match-error">
                {t.passwordsDoNotMatch}
              </p>
            )}

          {confirmPassword &&
            newPassword === confirmPassword && (
              <p className="password-match-success">
                {t.passwordMatchSuccess}
              </p>
            )}

        </div>

        {/* Password Rules */}

        <div className="password-rules">

          <h3>
            {t.passwordRequirementsHeading}
          </h3>

          <Rule
            passed={passwordRules.minLength}
          >
            {t.minimumEightCharacters}
          </Rule>

          <Rule
            passed={passwordRules.uppercase}
          >
            {t.uppercaseShort}
          </Rule>

          <Rule
            passed={passwordRules.number}
          >
            {t.numberRequirement}
          </Rule>

          <Rule
            passed={passwordRules.special}
          >
            {t.specialCharacterShort}
          </Rule>

        </div>

        {/* Save */}

        <button
          type="button"
          className="save-password-btn"
          onClick={handleSavePassword}
        >
          {t.savePassword}
        </button>

        {/* Cancel */}

        <button
          type="button"
          className="cancel-password-btn"
          onClick={() => navigate(-1)}
        >
          {t.cancel}
        </button>

      </div>

    </div>
  );
}

export default ChangePassword;