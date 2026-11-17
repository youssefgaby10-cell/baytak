import { useLanguage } from "../../context/LanguageContext.jsx";
import "../../styles/Onboarding2.css";
import { useNavigate } from "react-router-dom";

function Onboarding2() {
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
        <img src="/images/villa2.jpg" alt="Villa" />
      </div>

      <div className="content">
        <h1>{t?.onboardingTitle2 || "تواصل مع أفضل الوكلاء العقاريين"}</h1>

        <p>
          {t?.onboardingDesc2 || "احصل على استشارات عقارية احترافية وموثوقة."}
          <br />
          {t?.onboardingDesc2b || "نحن هنا لمساعدتك في كل خطوة حتى امتلاك عقارك."}
        </p>

        <div className="bottom-section">
          <div className="dots">
            <span></span>
            <span className="active"></span>
            <span></span>
          </div>

          <button
            type="button"
            className="next-btn"
            onClick={() => navigate("/onboarding3")}
          >
            {t?.nextArrow || "التالي"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Onboarding2;