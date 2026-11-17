import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext.jsx";

function RecommendationList({ properties = [], searchTerm = "", activeFilter, activeCategory }) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  // تصفية العقارات بناءً على البحث والفلتر والتصنيف
  const filteredProperties = properties.filter((property) => {
    // 1. فلتر البيع والإيجار
    if (activeFilter && property.listingType && property.listingType !== activeFilter) {
      return false;
    }

    // 2. فلتر التصنيف (سكني، تجاري، إلخ)
    if (activeCategory) {
      const propCat = property.category || property.type || "";
      if (propCat.toLowerCase() !== activeCategory.toLowerCase()) {
        return false;
      }
    }

    // 3. البحث الذكي والنصي
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      const matchTitle = property.title?.toLowerCase().includes(query);
      const matchLocation = property.location?.toLowerCase().includes(query);
      const matchDesc = property.description?.toLowerCase().includes(query);

      if (!matchTitle && !matchLocation && !matchDesc) {
        return false;
      }
    }

    return true;
  });

  return (
    <section className="recommend-section">
      <div className="section-header">
        <h2>{searchTerm ? t.searchResults || "نتائج البحث" : t.recommended}</h2>
      </div>

      <div className="recommend-list">
        {filteredProperties.length === 0 ? (
          <p style={{ padding: "20px", textAlign: "center", color: "#888" }}>
            {t.noPropertiesAvailable || "لا توجد عقارات مطابقة لبحثك"}
          </p>
        ) : (
          filteredProperties.map((property) => (
            <div
              key={property.id}
              className="recommend-card"
              onClick={() =>
                navigate("/property-details", {
                  state: property,
                })
              }
            >
              <img
                src={property.image || "/images/house1.jpg"}
                alt={property.title || "Property"}
              />

              <div className="recommend-info">
                <h3>{property.title || "عقار"}</h3>
                <p>📍 {property.location}</p>
                <p className="price-tag">
                  EGP {Number(property.price || 0).toLocaleString("en-US")}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default RecommendationList;