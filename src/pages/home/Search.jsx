
import { useLocation, useNavigate } from "react-router-dom";

import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useProperties } from "../../context/PropertyContext";

import EmptyState from "../../components/common/EmptyState";
import PropertyCard from "../../components/property/PropertyCard";

import "../../styles/Search.css";

function Search() {
  const location = useLocation();
  const navigate = useNavigate();

  const { darkMode } = useTheme();
  const { language } = useLanguage();

  const { properties = [] } = useProperties() || {};

  const searchTerm = location.state?.searchTerm || "";
  const searchResults = location.state?.searchResults || [];

  return (
    <div
      className={`search-page ${darkMode ? "dark-mode" : ""}`}
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <header className="search-page-header">
        <button type="button" onClick={() => navigate("/home")}>
          {language === "ar" ? "→ رجوع" : "← Back"}
        </button>

        <h2>
          {language === "ar" ? "نتائج البحث" : "Search Results"}
        </h2>
      </header>

      <div className="search-page-info">
        <p>
          {language === "ar" ? "نتائج البحث عن:" : "Search for:"}
          <strong> {searchTerm}</strong>
        </p>

        <span>
          {searchResults.length}{" "}
          {language === "ar" ? "عقار" : "properties"}
        </span>
      </div>

      {searchResults.length === 0 ? (
        <EmptyState
          type="search"
          title={
            language === "ar"
              ? "لم يتم العثور على عقارات"
              : "No Properties Found"
          }
          description={
            language === "ar"
              ? "جرب البحث بكلمات مختلفة."
              : "Try searching with different keywords."
          }
          buttonText={
            language === "ar" ? "العودة للرئيسية" : "Back Home"
          }
          onAction={() => navigate("/home")}
        />
      ) : (
        <div className="search-page-grid">
          {searchResults.map((property) => (
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

export default Search;
