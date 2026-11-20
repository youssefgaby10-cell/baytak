import { useProperties } from "../../context/PropertyContext";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPlus } from "react-icons/fa";
import PropertyCard from "../../components/property/PropertyCard.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import "../../styles/MyProperties.css";

function MyProperties() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { properties, deleteProperty } = useProperties();

  // الحصول على المستخدم الحالي لتصفية عقاراته فقط
  let currentUser = null;
  try {
    currentUser = JSON.parse(localStorage.getItem("baytakUser") || "null");
  } catch {
    currentUser = null;
  }

  const currentUserId = currentUser?.uid || currentUser?.id || "";

  // فلترة العقارات لتظهر عقارات المستخدم الحالي فقط (حسب ownerId)
  const myProperties = properties.filter(
    (property) =>
      currentUserId && String(property.ownerId) === String(currentUserId)
  );

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(t.deletePropertyConfirm);
    if (!confirmDelete) return;
    deleteProperty(id);
  };

  return (
    <div className="my-properties-page">
      <div className="my-properties-header">
        <button
          className="circle-btn"
          onClick={() => navigate("/home")}
        >
          <FaArrowLeft />
        </button>
        <h1>{t.myProperties}</h1>
        <button
          className="circle-btn"
          onClick={() => navigate("/add-property")}
        >
          <FaPlus />
        </button>
      </div>

      <div className="properties-info">
        {t.youHave}
        <span>{myProperties.length}</span>
        {t.properties}
      </div>

      {myProperties.length === 0 ? (
        <div className="empty-state">
          <h2>{t.noProperties}</h2>
          <p>{t.addFirstProperty}</p>
          <button
            className="add-property-btn"
            onClick={() => navigate("/add-property")}
          >
            {t.addProperty}
          </button>
        </div>
      ) : (
        <div className="properties-list">
          {myProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onDelete={() => handleDelete(property.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MyProperties;