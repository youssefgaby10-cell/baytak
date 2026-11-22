
import { Suspense, lazy, useEffect, useRef, useState } from "react";
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
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaMapMarkedAlt,
} from "react-icons/fa";

import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getPropertyTypeLabel } from "../../utils/propertySearch.js";
import { isValidPhone, toWhatsappNumber } from "../../utils/phone.js";
import "../../styles/PropertyDetails.css";
import { useProperties } from "../../context/PropertyContext";
import { useSeo } from "../../utils/useSeo.js";

// الخريطة تُحمَّل عند الحاجة فقط (تخفف تحميل بقية الموقع)
const PropertyMap = lazy(() => import("../../components/property/PropertyMap"));

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
    recordPropertyView,
  } = useProperties();

  const [appointment, setAppointment] = useState("");
  const [viewingNote, setViewingNote] = useState("");
  const [viewingPhone, setViewingPhone] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("baytakUser"))?.phone || "";
    } catch {
      return "";
    }
  });
  const [requestMessage, setRequestMessage] = useState("");
  const [requestSuccess, setRequestSuccess] = useState(false);

  const { user: authUser } = useAuth();
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [contactPhone, setContactPhone] = useState("");
  const touchStartX = useRef(null);

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

  const currentId = currentProperty?.id ? String(currentProperty.id) : "";
  const isRealProperty = Boolean(
    currentId && properties?.some((item) => String(item.id) === currentId)
  );
  const isOwnProperty =
    Boolean(authUser?.uid) &&
    String(currentProperty?.ownerId || "") === authUser.uid;

  // تسجيل مشاهدة (مرة لكل جلسة، ولا تُحسب لصاحب العقار)
  useEffect(() => {
    if (isRealProperty && !isOwnProperty) {
      recordPropertyView(currentId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRealProperty, isOwnProperty, currentId]);

  // رقم التواصل يظهر للمسجلين فقط
  useEffect(() => {
    let cancelled = false;

    if (!authUser || !currentId || !isRealProperty) {
      setContactPhone("");
      return undefined;
    }

    getDoc(doc(db, "propertyContacts", currentId))
      .then((snapshot) => {
        if (!cancelled) {
          setContactPhone(snapshot.exists() ? snapshot.data().phone || "" : "");
        }
      })
      .catch(() => {
        if (!cancelled) setContactPhone("");
      });

    return () => {
      cancelled = true;
    };
  }, [authUser, currentId, isRealProperty]);

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

    if (!isValidPhone(viewingPhone)) {
      setRequestMessage("من فضلك اكتب رقم هاتف صحيح ليتصل بك المالك.");
      return;
    }

    sendingRequestRef.current = true;

    try {
      const result = await addViewingRequest(
        currentProperty.id,
        appointment,
        viewingNote,
        viewingPhone
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

  // ===== معرض الصور =====
  const gallery = (
    Array.isArray(currentProperty.images) && currentProperty.images.length > 0
      ? currentProperty.images
      : [currentProperty.image]
  ).filter(Boolean);

  const imageIndex = Math.min(activeImage, Math.max(gallery.length - 1, 0));
  const currentImage = gallery[imageIndex] || currentProperty.image;

  const showPrevious = () =>
    setActiveImage((imageIndex - 1 + gallery.length) % gallery.length);

  const showNext = () => setActiveImage((imageIndex + 1) % gallery.length);

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null || gallery.length < 2) return;

    const distance = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(distance) < 40) return;

    // سحب لليسار = التالي، سحب لليمين = السابق
    if (distance < 0) showNext();
    else showPrevious();
  };

  // ===== بيانات العرض =====
  const priceNumber = Number(currentProperty.price);
  const priceText = Number.isFinite(priceNumber)
    ? priceNumber.toLocaleString("en-US")
    : currentProperty.price;

  const listingLabel =
    currentProperty.listingType === "rent" ? "للإيجار" : "للبيع";
  const typeLabel = getPropertyTypeLabel(currentProperty, true);

  const latitude = Number(currentProperty.latitude);
  const longitude = Number(currentProperty.longitude);
  const hasCoordinates =
    currentProperty.latitude != null &&
    currentProperty.longitude != null &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude);

  // رقم واتساب بالصيغة الدولية (مصر)
  const whatsappNumber = toWhatsappNumber(contactPhone);

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
          src={currentImage}
          alt={currentProperty.title}
          onClick={() => setLightboxOpen(true)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{ cursor: "zoom-in" }}
        />

        {gallery.length > 1 && (
          <>
            <button
              type="button"
              className="gallery-nav gallery-prev"
              onClick={showPrevious}
              aria-label="الصورة السابقة"
            >
              <FaChevronLeft />
            </button>

            <button
              type="button"
              className="gallery-nav gallery-next"
              onClick={showNext}
              aria-label="الصورة التالية"
            >
              <FaChevronRight />
            </button>

            <span className="gallery-counter">
              {imageIndex + 1} / {gallery.length}
            </span>
          </>
        )}

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

      {gallery.length > 1 && (
        <div className="details-thumbs">
          {gallery.map((source, index) => (
            <button
              key={`${index}-${source.slice(-12)}`}
              type="button"
              className={index === imageIndex ? "active" : ""}
              onClick={() => setActiveImage(index)}
              aria-label={`صورة ${index + 1}`}
            >
              <img src={source} alt="" />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div
          className="details-lightbox"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            className="lightbox-close"
            onClick={() => setLightboxOpen(false)}
            aria-label="إغلاق"
          >
            <FaTimes />
          </button>

          {gallery.length > 1 && (
            <button
              type="button"
              className="gallery-nav gallery-prev"
              onClick={(event) => {
                event.stopPropagation();
                showPrevious();
              }}
              aria-label="الصورة السابقة"
            >
              <FaChevronLeft />
            </button>
          )}

          <img
            src={currentImage}
            alt={currentProperty.title}
            onClick={(event) => event.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          />

          {gallery.length > 1 && (
            <button
              type="button"
              className="gallery-nav gallery-next"
              onClick={(event) => {
                event.stopPropagation();
                showNext();
              }}
              aria-label="الصورة التالية"
            >
              <FaChevronRight />
            </button>
          )}
        </div>
      )}

      <div className="details-content">
        <div className="details-badges">
          <span className="badge badge-listing">{listingLabel}</span>
          {typeLabel && <span className="badge">{typeLabel}</span>}
        </div>

        <h1>{currentProperty.title}</h1>

        <h2 className="details-price">
          EGP {priceText}
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

        {hasCoordinates && (
          <section className="details-map-section">
            <h3>
              <FaMapMarkedAlt /> الموقع على الخريطة
            </h3>

            <Suspense
              fallback={<div className="details-map-loading">جارٍ تحميل الخريطة...</div>}
            >
              <PropertyMap latitude={latitude} longitude={longitude} />
            </Suspense>

            <a
              className="details-map-link"
              href={`https://www.google.com/maps?q=${latitude},${longitude}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              فتح في خرائط جوجل
            </a>
          </section>
        )}

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

            <label htmlFor="viewing-phone">
              رقم هاتفك للتواصل (يظهر للمالك فقط)
            </label>

            <input
              id="viewing-phone"
              type="tel"
              inputMode="tel"
              dir="ltr"
              value={viewingPhone}
              onChange={(event) => setViewingPhone(event.target.value)}
              placeholder="01XXXXXXXXX"
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
          {!authUser && (
            <button
              className="call-btn"
              onClick={() => navigate("/login")}
            >
              <FaPhone />
              سجّل الدخول للتواصل مع المالك
            </button>
          )}

          {authUser && !isOwnProperty && !contactPhone && (
            <p className="details-contact-note">
              رقم المالك المباشر غير متاح لهذا العقار. اطلب معاينة من الأعلى
              وسيتواصل معك المالك على رقمك.
            </p>
          )}

          {authUser && !isOwnProperty && contactPhone && (
            <>
              <button
                className="call-btn"
                onClick={() => {
                  window.location.href = `tel:${contactPhone}`;
                }}
              >
                <FaPhone />
                {t.call}
              </button>

              <button
                className="chat-btn"
                onClick={() => {
                  window.open(
                    `https://wa.me/${whatsappNumber}`,
                    "_blank",
                    "noopener,noreferrer"
                  );
                }}
              >
                <FaCommentDots />
                {t.chat}
              </button>
            </>
          )}

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
