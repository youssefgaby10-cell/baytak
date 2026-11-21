
import { useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaBed,
  FaBath,
  FaRulerCombined,
  FaHeart,
  FaRegHeart,
  FaPhone,
  FaCommentDots,
  FaShareAlt,
  FaCalendarAlt,
} from "react-icons/fa";

import { useLanguage } from "../../context/LanguageContext.jsx";
import "../../styles/PropertyDetails.css";
import { useProperties } from "../../context/PropertyContext";
import { useSeo } from "../../utils/useSeo.js";

function PropertyDetails() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const { state: routeState } = useLocation();

  const {
    properties,
    loading,
    toggleFavorite,
    addViewingRequest,
  } = useProperties();

  const [appointment, setAppointment] = useState("");
  const [viewingNote, setViewingNote] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [requestSuccess, setRequestSuccess] = useState(false);

  // الرابط /property/:id هو المصدر الأساسي، وlocation.state احتياطي (الرابط القديم)
  const wantedId = routeId ?? routeState?.id;

  const currentProperty =
    (wantedId !== undefined &&
      properties?.find((item) => String(item.id) === String(wantedId))) ||
    routeState ||
    null;

  const seoDescription = currentProperty
    ? [
        currentProperty.type,
        currentProperty.listingType === "rent" ? "للإيجار" : "للبيع",
        currentProperty.location || currentProperty.city
          ? `في ${currentProperty.location || currentProperty.city}`
          : "",
        currentProperty.area ? `- ${currentProperty.area} م²` : "",
        currentProperty.rooms ? `- ${currentProperty.rooms} غرف` : "",
        currentProperty.price ? `- السعر ${currentProperty.price} جنيه` : "",
      ]
        .filter(Boolean)
        .join(" ")
        .slice(0, 155)
    : "";

  useSeo(
    currentProperty
      ? {
          title: `${currentProperty.title} | Baytak`,
          description:
            seoDescription ||
            currentProperty.description?.slice(0, 155) ||
            "تفاصيل العقار على Baytak",
          image: currentProperty.image,
          type: "article",
        }
      : {
          title: "عقار | Baytak",
          description: "تفاصيل العقار على Baytak",
          noindex: true,
        }
  );

  if (!currentProperty) {
    if (loading) {
      return (
        <div className="property-not-found">
          <h2>...</h2>
        </div>
      );
    }

    return (
      <div className="property-not-found">
        <h2>{t.noPropertyData}</h2>
        <button onClick={() => navigate("/")}>
          {t.backToHome}
        </button>
      </div>
    );
  }

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("baytakUser"));
    } catch {
      return null;
    }
  })();

  const accountType = user?.accountType;
  const isTenant =
    accountType === "مستأجر" || accountType === "tenant";

  const sendingRequestRef = useRef(false);

  const submitViewingRequest = async () => {
    if (sendingRequestRef.current) return;

    setRequestMessage("");
    setRequestSuccess(false);

    if (!user) {
      navigate("/login");
      return;
    }

    if (!isTenant) {
      setRequestMessage(
        "طلب المعاينة متاح لحساب المستأجر فقط."
      );
      return;
    }

    if (!appointment) {
      setRequestMessage("من فضلك اختر موعد المعاينة.");
      return;
    }

    sendingRequestRef.current = true;

    try {
      const result = await addViewingRequest(
        currentProperty.id,
        appointment,
        viewingNote
      );

      setRequestMessage(result.message);
      setRequestSuccess(result.success);

      if (result.success) {
        setAppointment("");
        setViewingNote("");
      }
    } finally {
      sendingRequestRef.current = false;
    }
  };

  return (
    <div className="property-details-page">
      <div className="details-header">
        <button
          className="back-btn"
          onClick={() => navigate(-1)}
          aria-label="رجوع"
        >
          <FaArrowLeft />
        </button>

        <h2>{t.propertyDetails}</h2>
      </div>

      <div className="details-image">
        <img
          src={currentProperty.image}
          alt={currentProperty.title}
        />

        <button
          className="details-favorite-btn"
          onClick={() => toggleFavorite(currentProperty.id)}
          aria-label="إضافة إلى المفضلة"
        >
          {currentProperty.isFavorite ? (
            <FaHeart color="#e53935" />
          ) : (
            <FaRegHeart />
          )}
        </button>
      </div>

      <div className="details-content">
        <h1>{currentProperty.title}</h1>

        <h2 className="details-price">
          EGP {currentProperty.price}
        </h2>

        <div className="details-location">
          <FaMapMarkerAlt />
          <span>{currentProperty.location}</span>
        </div>

        <div className="details-specs">
          <div className="spec-item">
            <FaBed />
            <span>
              {currentProperty.rooms} {t.roomsUnit}
            </span>
          </div>

          <div className="spec-item">
            <FaBath />
            <span>
              {currentProperty.bathrooms} {t.baths}
            </span>
          </div>

          <div className="spec-item">
            <FaRulerCombined />
            <span>
              {currentProperty.area} {t.squareMeterUnit}
            </span>
          </div>
        </div>

        <div className="details-description">
          <h3>{t.description}</h3>
          <p>{currentProperty.description}</p>
        </div>

        {isTenant && (
          <section className="viewing-request-section">
            <h3>
              <FaCalendarAlt /> طلب معاينة العقار
            </h3>

            <label htmlFor="viewing-appointment">
              موعد المعاينة
            </label>

            <input
              id="viewing-appointment"
              type="datetime-local"
              value={appointment}
              min={new Date(Date.now() + 60000)
                .toISOString()
                .slice(0, 16)}
              onChange={(event) =>
                setAppointment(event.target.value)
              }
            />

            <label htmlFor="viewing-note">
              ملاحظات (اختياري)
            </label>

            <textarea
              id="viewing-note"
              value={viewingNote}
              onChange={(event) =>
                setViewingNote(event.target.value)
              }
              placeholder="اكتب أي تفاصيل إضافية للمالك..."
              rows={3}
            />

            <button
              type="button"
              className="viewing-request-btn"
              onClick={submitViewingRequest}
            >
              إرسال طلب المعاينة
            </button>

            {requestMessage && (
              <p
                className={
                  requestSuccess
                    ? "viewing-request-message success"
                    : "viewing-request-message error"
                }
                role="status"
              >
                {requestMessage}
              </p>
            )}
          </section>
        )}

        <div className="details-actions">
          <button
            className="call-btn"
            onClick={() => {
              window.location.href =
                `tel:${currentProperty.phone}`;
            }}
          >
            <FaPhone />
            {t.call}
          </button>

          <button
            className="chat-btn"
            onClick={() => {
              const phone = (
                currentProperty.phone || ""
              ).replace(/^0/, "20");

              window.open(
                `https://wa.me/${phone}`,
                "_blank",
                "noopener,noreferrer"
              );
            }}
          >
            <FaCommentDots />
            {t.chat}
          </button>

          <button
            className="share-btn"
            onClick={async () => {
              const shareData = {
                title: currentProperty.title,
                text: `شاهد هذا العقار: ${currentProperty.title}`,
                url: window.location.href,
              };

              if (navigator.share) {
                try {
                  await navigator.share(shareData);
                } catch (error) {
                  if (error.name !== "AbortError") {
                    console.error("Share failed:", error);
                  }
                }
              } else {
                try {
                  await navigator.clipboard.writeText(
                    window.location.href
                  );
                  alert(t.propertyLinkCopied);
                } catch (error) {
                  console.error(
                    "Could not copy link:",
                    error
                  );
                }
              }
            }}
          >
            <FaShareAlt />
            {t.share}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PropertyDetails;
