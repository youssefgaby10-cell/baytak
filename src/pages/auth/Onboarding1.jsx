import { useLanguage } from "../../context/LanguageContext.jsx";
import "../../styles/Onboarding1.css";
import { useNavigate } from "react-router-dom";

function Onboarding1() {
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
        <img src="/images/villa1.jpg" alt="Villa" />
      </div>

      <div className="content">
        <h1>{t?.onboardingTitle1 || "اكتشف منزل أحلامك بسهولة"}</h1>

        <p>
          {t?.onboardingDesc1 || "تصفح آلاف العقارات المتاحة للبيع والشراء."}
          <br />
          {t?.onboardingDesc1b || "ابحث عن ما يناسب ذوقك وميزانيتك بكل مرونة."}
        </p>

        <div className="bottom-section">
          <div className="dots">
            <span className="active"></span>
            <span></span>
            <span></span>
          </div>

          <button
            type="button"
            className="next-btn"
            onClick={() => navigate("/onboarding2")}
          >
            {t?.nextArrow || "التالي"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Onboarding1;