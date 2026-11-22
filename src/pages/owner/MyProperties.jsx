import { useProperties } from "../../context/PropertyContext";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaPlus,
  FaEye,
  FaCalendarCheck,
  FaHome,
} from "react-icons/fa";
import PropertyCard from "../../components/property/PropertyCard.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import "../../styles/MyProperties.css";

function MyProperties() {
  const { t, language } = useLanguage();
  const isArabic = language === "ar";
  const navigate = useNavigate();
  const { properties, deleteProperty, getOwnerViewingRequests } =
    useProperties();

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

  // ===== إحصائيات المالك =====
  const ownerRequests = getOwnerViewingRequests();

  const totalViews = myProperties.reduce(
    (sum, property) => sum + (Number(property.views) || 0),
    0
  );

  const pendingRequests = ownerRequests.filter(
    (request) => request.status === "pending"
  ).length;

  const getPropertyStats = (property) => {
    const related = ownerRequests.filter(
      (request) => String(request.propertyId) === String(property.id)
    );

    return {
      views: Number(property.views) || 0,
      requests: related.length,
      pending: related.filter((request) => request.status === "pending").length,
    };
  };

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

      <div className="owner-stats">
        <div className="owner-stat-card">
          <FaHome />
          <strong>{myProperties.length}</strong>
          <span>{isArabic ? "عقاراتي" : "My properties"}</span>
        </div>

        <div className="owner-stat-card">
          <FaEye />
          <strong>{totalViews}</strong>
          <span>{isArabic ? "إجمالي المشاهدات" : "Total views"}</span>
        </div>

        <button
          type="button"
          className="owner-stat-card owner-stat-link"
          onClick={() => navigate("/owner-viewing-requests")}
        >
          <FaCalendarCheck />
          <strong>
            {pendingRequests}
            <small> / {ownerRequests.length}</small>
          </strong>
          <span>
            {isArabic ? "طلبات معاينة جديدة" : "New viewing requests"}
          </span>
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
          {myProperties.map((property) => {
            const stats = getPropertyStats(property);

            return (
              <div key={property.id} className="owner-property-item">
                <PropertyCard
                  property={property}
                  onDelete={() => handleDelete(property.id)}
                />

                <div className="owner-property-stats">
                  <span>
                    <FaEye /> {stats.views} {isArabic ? "مشاهدة" : "views"}
                  </span>
                  <span>
                    <FaCalendarCheck /> {stats.requests}{" "}
                    {isArabic ? "طلب معاينة" : "requests"}
                  </span>
                  {stats.pending > 0 && (
                    <span className="pending">
                      {stats.pending} {isArabic ? "جديد" : "new"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyProperties;