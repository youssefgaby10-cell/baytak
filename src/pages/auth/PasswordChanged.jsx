import { useLocation, useNavigate } from "react-router-dom";
import { FaCheck } from "react-icons/fa";
import { useLanguage } from "../../context/LanguageContext";

import "../../styles/PasswordChanged.css";

function PasswordChanged() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from;

  const handleContinue = () => {
    if (from === "settings") {
      navigate("/settings");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="password-changed-page">

      <div className="success-card">

        <div className="success-icon">
          <FaCheck />
        </div>

        <h1>
          {t.passwordChangedSuccessfully}
        </h1>

        <p>{t.passwordUpdatedDescription}</p>

        <button
          className="success-login-btn"
          onClick={handleContinue}
        >
          {from === "settings" ? t.backToSettings : t.login}
        </button>

      </div>

    </div>
  );
}

export default PasswordChanged;