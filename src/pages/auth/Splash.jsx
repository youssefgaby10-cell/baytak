import { useLanguage } from "../../context/LanguageContext.jsx";
import "../../styles/Splash.css";

function Splash() {
  const { language, t } = useLanguage();

  return (
    <div className="splash">

      <img
        src="/images/logo.png"
        alt="Baytak Logo"
        className="logo"
      />

      <h1>Baytak</h1>

      <h2>{language === "ar" ? "بيتك" : "Baytak"}</h2>

      <p>{t.findDreamHome}</p>

      <div className="dots">
        <span className="active"></span>
        <span></span>
        <span></span>
      </div>

    </div>
  );
}

export default Splash;