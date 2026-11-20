
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext.jsx";
import EmptyState from "../../components/common/EmptyState";



function SearchResults({
  searchTerm,
  properties = [],
  searchResults = [],
  isLoading = false,
  error = null,
  onClearSearch = () => {},
}) {


  const navigate = useNavigate();
  const { t, language } = useLanguage();

  // لا تعرض أي شيء قبل كتابة كلمة بحث
  if (!searchTerm.trim()) {
    return null;
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="search-results">
        <div className="search-loading">
          <div className="loading-spinner"></div>
          <p>
            {language === "ar"
              ? "جاري البحث عن العقارات..."
              : "Searching for properties..."}
          </p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <EmptyState
        type="error"
        title={
          language === "ar"
            ? "حدث خطأ أثناء البحث"
            : "Search Error"
        }
        description={
          typeof error === "string"
            ? error
            : language === "ar"
              ? "حصلت مشكلة أثناء البحث. حاول مرة أخرى."
              : "Something went wrong. Please try again."
        }
        buttonText={language === "ar" ? "إعادة المحاولة" : "Try Again"}
        onAction={() => window.location.reload()}
      />
    );
  }

  // Empty State
  if (searchResults.length === 0) {
    return (
      <EmptyState
        type="search"
        title={
          language === "ar"
            ? "لم يتم العثور على عقارات"
            : "No Properties Found"
        }
        description={
          language === "ar"
            ? "جرب البحث بكلمات مختلفة أو تغيير الفلاتر."
            : "Try different keywords or change the filters."
        }
        buttonText={language === "ar" ? "مسح البحث" : "Clear Search"}
        onAction={onClearSearch}
      />
    );
  }

  const topResults = searchResults.slice(0, 5);

  return (
    <div className="search-results">
      <h3>
        ✅{" "}
        {language === "ar"
          ? `تم العثور على ${searchResults.length} عقار مطابق`
          : `Found ${searchResults.length} matching properties`}
      </h3>

      <div className="recommend-list">
        {topResults.map((property) => (
          <div
            key={property.id}
            className="recommend-card search-card"
            onClick={() =>
              navigate(`/property/${property.id}`, { state: property })
            }
          >
            <img
              src={property.image || "/images/house1.jpg"}
              alt={property.title || t.property}
            />

            <div className="recommend-info">
              <h3>{property.title || t.property}</h3>
              <p>EGP {property.price}</p>
              <p>📍 {property.location}</p>

              {property.smartScore !== undefined && (
                <div className={`match-badge ${property.matchLevel || ""}`}>
                  <span>{property.matchLabel}</span>
                  <strong>{property.smartScore}%</strong>
                </div>
              )}

              {property.matchReasons?.length > 0 && (
                <div className="match-reasons">
                  {property.matchReasons.slice(0, 8).map((reason, index) => (
                    <span
                      className="match-reason"
                      key={`${property.id}-${index}`}
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SearchResults;
