import {
  FaHeart,
  FaRegHeart,
  FaMapMarkerAlt,
  FaBed,
  FaBath,
  FaRulerCombined,
  FaStar,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import { useProperties } from "../../context/PropertyContext";

import { useLanguage } from "../../context/LanguageContext.jsx";

function FeaturedCard({
  properties,
  onSeeAll,
}) {
  const { t } = useLanguage();

  const navigate = useNavigate();

  const { toggleFavorite } =
    useProperties();

  if (!properties || properties.length === 0) {
    return null;
  }

  const property = properties[0];

  const isForSale =
    property.listingType === "sale";

  return (
    <section className="featured-section">

      <div className="section-header">
        <h2>{t.featuredProperty}</h2>
      </div>

      <div className="featured-card">

        <div className="featured-image">

          <img
            src={property.image}
            alt={property.title}
          />

          <span className="sale-badge">
            {isForSale
              ? t.forSale
              : t.forRent}
          </span>

          <button
            type="button"
            className="favorite-btn"
            onClick={(event) => {
              event.stopPropagation();

              toggleFavorite(property.id);
            }}
          >
            {property.isFavorite ? (
              <FaHeart color="red" />
            ) : (
              <FaRegHeart />
            )}
          </button>

        </div>

        <div className="featured-content">

          <h3>
            {property.title}
          </h3>

          <p className="featured-price">
            EGP {property.price}
          </p>

          <div className="featured-location">
            <FaMapMarkerAlt />

            <span>
              {property.location}
            </span>
          </div>

          <div className="featured-rating">
            <FaStar />

            <span>4.9</span>
          </div>

          <div className="featured-details">

            <div>
              <FaBed />
              <span>
                {property.rooms} {t.beds}
              </span>
            </div>

            <div>
              <FaBath />
              <span>
                {property.bathrooms} {t.baths}
              </span>
            </div>

            <div>
              <FaRulerCombined />
              <span>
                {property.area} {t.squareMeterUnit}
              </span>
            </div>

          </div>

          <button
            type="button"
            className="details-btn"
            onClick={() =>
              navigate(
                `/property/${property.id}`,
                {
                  state: property,
                }
              )
            }
          >
            {t.viewDetails}
          </button>

        </div>
      </div>
    </section>
  );
}

export default FeaturedCard;