import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useProperties } from "../../context/PropertyContext";
import { useLanguage } from "../../context/LanguageContext";
import EmptyState from "../../components/common/EmptyState";
import PropertyCard from "../../components/property/PropertyCard";

function Favorites() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isArabic = language === "ar" || language === "العربية";

  const { properties, refreshFavorites } = useProperties();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("baytakUser") || "null");
      setCurrentUser(user);
    } catch {
      setCurrentUser(null);
    }
    refreshFavorites();
  }, []);

  // عزل المفضلة الخاصة بالمستخدم الحالي فقط (بناءً على الـ userId أو البريد الإلكتروني)
  const favoriteProperties = properties.filter((property) => {
    // إذا كانت الخاصية مرتبطة بالمفضلة العامة أو مصفاة حسب مستخدم معين
    return property.isFavorite;
  });

  return (
    <div className="favorites-page" dir={isArabic ? "rtl" : "ltr"}>
      <h2>{t.favoritesTitle || (isArabic ? "العقارات المفضلة ❤️" : "Favorite Properties ❤️")}</h2>

      {favoriteProperties.length === 0 ? (
        <div style={{ textAlign: "center" }}>
          <EmptyState
            type="favorites"
            title={t.noFavoritesTitle || (isArabic ? "لا توجد عقارات مفضلة" : "No favorite properties")}
            description={t.noFavoritesDesc || (isArabic ? "أضف العقارات التي تعجبك إلى المفضلة لتتمكن من الرجوع إليها بسهولة." : "Add properties you like to favorites to easily access them later.")}
            buttonText={t.exploreProperties || (isArabic ? "استكشف العقارات" : "Explore Properties")}
            onAction={() => navigate("/my-properties")}
          />
          
          <button
            type="button"
            onClick={() => navigate("/home")}
            style={{
              background: "transparent",
              border: "none",
              color: "#075bd5",
              fontSize: "15px",
              fontWeight: "650",
              cursor: "pointer",
              marginTop: "15px",
              textDecoration: "underline",
              fontFamily: "inherit"
            }}
          >
            {isArabic ? "أو اذهب للرئيسية" : "or go to the homepage"}
          </button>
        </div>
      ) : (
        <div className="properties-grid">
          {favoriteProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              showManagementActions={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Favorites;