import { useLanguage } from "../../context/LanguageContext.jsx";
import "../../styles/PropertyCard.css";

import {
  FaBed,
  FaBath,
  FaRulerCombined,
  FaMapMarkerAlt,
  FaEye,
  FaEdit,
  FaTrash,
  FaHeart,
  FaRegHeart,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import { useProperties } from "../../context/PropertyContext.jsx";

function PropertyCard({
  property,
  onDelete,
  showManagementActions = true,
}) {
  const { t } = useLanguage();

  const navigate = useNavigate();
  const { toggleFavorite } = useProperties();

  return (
    <div className="property-card">
      {/* الصورة */}
      <div className="property-image">
        <img
          src={property.image}
          alt={property.title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/images/default-property.jpg"; // صورة بديلة لو مسار الصورة الأصلية غير متوفر
          }}
        />

        <button
          className="favorite-btn"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(property.id);
          }}
        >
          {property.isFavorite ? (
            <FaHeart />
          ) : (
            <FaRegHeart />
          )}
        </button>
      </div>

      {/* المحتوى */}
      <div className="property-content">
        <div className="property-price">
          {property.price} {t.currencyEGP}
        </div>

        <div className="property-title">
          {property.title}
        </div>

        <div className="property-location">
          <FaMapMarkerAlt />
          <span>{property.location}</span>
        </div>

        {/* التفاصيل */}
        <div className="property-details">
          <div className="detail">
            <FaBed />
            <span>{property.rooms} {t.roomsUnit}</span>
          </div>

          <div className="detail">
            <FaBath />
            <span>{property.bathrooms} {t.bathroomsUnit}</span>
          </div>

          <div className="detail">
            <FaRulerCombined />
            <span>{property.area} {t.squareMeterUnit}</span>
          </div>
        </div>

        {/* الأزرار */}
        <div className="property-actions">
  <button
    className="view-btn"
    onClick={() =>
      navigate(`/property/${property.id}`, {
        state: property,
      })
    }
  >
    <FaEye />
    <span>{t.show}</span>
  </button>

  {showManagementActions && (
    <>
      <button
        className="edit-btn"
        onClick={() =>
          navigate("/edit-property", {
            state: property,
          })
        }
      >
        <FaEdit />
      </button>

      <button
        className="delete-btn"
        onClick={() => onDelete?.(property.id)}
      >
        <FaTrash />
      </button>
    </>
  )}
</div>
      </div>
    </div>
  );
}

export default PropertyCard;