import { useLanguage } from "../../context/LanguageContext.jsx";
import "../../styles/Onboarding3.css";
import { useNavigate } from "react-router-dom";

function Onboarding3() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="onboarding">
      {/* زر التخطي مثبت في أعلى اليمين */}
      <button
        type="button"
        className="skip-btn"
        onClick={() => navigate("/login")}
      >
        {t?.skip || "تخطي"}
      </button>

      <div className="image">
        <img src="/images/villa3.jpg" alt="Villa" />
      </div>

      <div className="content">
        <h1>{t?.onboardingTitle3 || "ابدأ رحلتك معنا الآن"}</h1>

        <p>
          {t?.onboardingDesc3 || "سجل الدخول واستكشف أفضل العقارات المتاحة."}
          <br />
          {t?.onboardingDesc3b || "نحن بانتظارك لتلبية كافة احتياجاتك العقارية."}
        </p>

        <div className="bottom-section">
          <div className="dots">
            <span></span>
            <span></span>
            <span className="active"></span>
          </div>

          <button
            type="button"
            className="next-btn"
            onClick={() => navigate("/login")}
          >
            {t?.getStarted || "ابدأ الان"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Onboarding3;