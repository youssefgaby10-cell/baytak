import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  FaArrowLeft,
  FaBuilding,
  FaCamera,
  FaCheck,
  FaMapMarkerAlt,
  FaPlus,
  FaSave,
  FaTimes,
  FaTrash,
} from "react-icons/fa";

import { useProperties } from "../../context/PropertyContext";
import { useLanguage } from "../../context/LanguageContext";
import { EGYPT_LOCATIONS } from "../../data/egyptLocations";
import "../../styles/AddProperty.css";

const MAX_IMAGES = 10;
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const FORM_STORAGE_KEY = "baytak_add_property_draft";

const PROPERTY_TYPES = [
  { value: "apartment", ar: "شقة", en: "Apartment" },
  { value: "villa", ar: "فيلا", en: "Villa" },
  { value: "chalet", ar: "شاليه", en: "Chalet" },
  { value: "office", ar: "مكتب", en: "Office" },
  { value: "shop", ar: "محل", en: "Shop" },
  { value: "land", ar: "أرض", en: "Land" },
  { value: "duplex", ar: "دوبلكس", en: "Duplex" },
  { value: "penthouse", ar: "بنتهاوس", en: "Penthouse" },
  { value: "townhouse", ar: "تاون هاوس", en: "Townhouse" },
  { value: "factory", ar: "مصنع", en: "Factory" },
  { value: "warehouse", ar: "مخزن", en: "Warehouse" },
  { value: "clinic", ar: "عيادة", en: "Clinic" },
];

const AMENITIES = [
  { value: "parking", ar: "جراج", en: "Parking" },
  { value: "security", ar: "أمن وحراسة", en: "Security" },
  { value: "elevator", ar: "مصعد", en: "Elevator" },
  { value: "garden", ar: "حديقة", en: "Garden" },
  { value: "pool", ar: "حمام سباحة", en: "Swimming pool" },
  { value: "airConditioning", ar: "تكييف", en: "Air conditioning" },
  { value: "furnished", ar: "مفروش", en: "Furnished" },
  { value: "internet", ar: "إنترنت", en: "Internet" },
  { value: "gym", ar: "جيم", en: "Gym" },
];

const INITIAL_FORM = {
  title: "",
  price: "",
  governorate: "",
  city: "",
  location: "",
  area: "",
  rooms: 1,
  bathrooms: 1,
  type: "apartment",
  description: "",
  listingType: "sale",
  images: [],
  latitude: null,
  longitude: null,
  amenities: [],
};

const TEXT = {
  ar: {
    pageTitle: "إضافة عقار جديد",
    basicInfo: "البيانات الأساسية",
    images: "صور العقار",
    propertyDetails: "تفاصيل العقار",
    locationDetails: "موقع العقار",
    amenitiesTitle: "المرافق والخدمات",
    title: "عنوان العقار",
    titlePlaceholder: "مثال: شقة فاخرة في التجمع الخامس",
    price: "السعر بالجنيه المصري",
    pricePlaceholder: "أدخل السعر",
    type: "نوع العقار",
    listingType: "نوع الإعلان",
    sale: "للبيع",
    rent: "للإيجار",
    governorate: "المحافظة",
    governoratePlaceholder: "اختر المحافظة",
    city: "المدينة / المنطقة",
    cityPlaceholder: "اختر المدينة",
    location: "العنوان التفصيلي",
    locationPlaceholder: "اسم الشارع أو المنطقة",
    area: "المساحة بالمتر المربع",
    areaPlaceholder: "المساحة",
    rooms: "عدد الغرف",
    bathrooms: "عدد الحمامات",
    description: "وصف العقار",
    descriptionPlaceholder: "اكتب وصفًا واضحًا للعقار ومميزاته...",
    uploadTitle: "أضف صور العقار",
    uploadHint: "اختر صورًا واضحة، بحد أقصى 10 صور",
    chooseImages: "اختيار الصور",
    addMore: "إضافة صور",
    mainImage: "الصورة الرئيسية",
    removeImage: "حذف الصورة",
    selectLocation: "تحديد الموقع على الخريطة",
    selectLocationHint: "حدد موقع العقار بدقة لتسهيل الوصول إليه.",
    selectedLocation: "الموقع المختار",
    noLocation: "لم يتم تحديد موقع على الخريطة بعد.",
    coordinates: "إحداثيات الموقع",
    save: "حفظ العقار",
    cancel: "إلغاء",
    saving: "جارٍ الحفظ...",
    required: "هذا الحقل مطلوب.",
    invalidPrice: "أدخل سعرًا صحيحًا أكبر من صفر.",
    invalidArea: "أدخل مساحة صحيحة أكبر من صفر.",
    imagesRequired: "أضف صورة واحدة على الأقل للعقار.",
    maxImages: "يمكنك إضافة 10 صور كحد أقصى.",
    imageTooLarge: "حجم الصورة يجب ألا يتجاوز 8 ميجابايت.",
    imageType: "اختر ملفات صور صالحة.",
    saveSuccess: "تم حفظ العقار بنجاح.",
    saveError: "تعذر حفظ العقار. حاول مرة أخرى.",
    locationRequired: "اختر المحافظة والمدينة واكتب العنوان.",
    imageReadError: "تعذر قراءة إحدى الصور.",
  },
  en: {
    pageTitle: "Add a New Property",
    basicInfo: "Basic Information",
    images: "Property Images",
    propertyDetails: "Property Details",
    locationDetails: "Property Location",
    amenitiesTitle: "Amenities & Services",
    title: "Property Title",
    titlePlaceholder: "Example: Luxury apartment in New Cairo",
    price: "Price in EGP",
    pricePlaceholder: "Enter the price",
    type: "Property Type",
    listingType: "Listing Type",
    sale: "For Sale",
    rent: "For Rent",
    governorate: "Governorate",
    governoratePlaceholder: "Select a governorate",
    city: "City / Area",
    cityPlaceholder: "Select a city",
    location: "Detailed Address",
    locationPlaceholder: "Street or area name",
    area: "Area in square meters",
    areaPlaceholder: "Property area",
    rooms: "Number of Rooms",
    bathrooms: "Number of Bathrooms",
    description: "Property Description",
    descriptionPlaceholder: "Describe the property and its features...",
    uploadTitle: "Add Property Images",
    uploadHint: "Choose clear photos, up to 10 images",
    chooseImages: "Choose Images",
    addMore: "Add Images",
    mainImage: "Main Image",
    removeImage: "Remove Image",
    selectLocation: "Choose Location on Map",
    selectLocationHint: "Pinpoint the property location for easier navigation.",
    selectedLocation: "Selected Location",
    noLocation: "No map location has been selected yet.",
    coordinates: "Coordinates",
    save: "Save Property",
    cancel: "Cancel",
    saving: "Saving...",
    required: "This field is required.",
    invalidPrice: "Enter a valid price greater than zero.",
    invalidArea: "Enter a valid area greater than zero.",
    imagesRequired: "Add at least one property image.",
    maxImages: "You can add up to 10 images.",
    imageTooLarge: "Each image must be 8 MB or smaller.",
    imageType: "Please choose valid image files.",
    saveSuccess: "Property saved successfully.",
    saveError: "Could not save the property. Please try again.",
    locationRequired: "Choose a governorate and city, and enter the address.",
    imageReadError: "Could not read one of the images.",
  },
};

function getLanguage(language) {
  return String(language || "ar").toLowerCase().startsWith("en") ? "en" : "ar";
}

function getLocationLabel(item, language) {
  if (typeof item === "string") return item;
  if (!item || typeof item !== "object") return "";
  return (
    (language === "en"
      ? item.nameEn || item.en || item.englishName
      : item.nameAr || item.ar || item.arabicName) ||
    item.name ||
    item.label ||
    item.value ||
    ""
  );
}

function getGovernorates() {
  if (Array.isArray(EGYPT_LOCATIONS)) return EGYPT_LOCATIONS;
  if (EGYPT_LOCATIONS && typeof EGYPT_LOCATIONS === "object") {
    return Object.entries(EGYPT_LOCATIONS).map(([name, value]) => {
      if (Array.isArray(value)) return { name, cities: value };
      return { name, ...(value && typeof value === "object" ? value : {}) };
    });
  }
  return [];
}

function getCities(governorate) {
  if (!governorate || typeof governorate !== "object") return [];
  const cities = governorate.cities || governorate.city || governorate.areas || governorate.regions || [];
  return Array.isArray(cities) ? cities : [];
}

function readImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Invalid image data"));
    };
    reader.onerror = () => reject(new Error("Image could not be read"));
    reader.readAsDataURL(file);
  });
}

function normalizeListingType(value) {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "rent" || normalized === "rental" || normalized === "إيجار" || normalized === "للإيجار") {
    return "rent";
  }
  return "sale";
}

function normalizePropertyType(value) {
  const normalized = String(value || "").toLowerCase();
  const match = PROPERTY_TYPES.find(
    (item) => item.value === normalized || item.ar === value || item.en.toLowerCase() === normalized
  );
  return match?.value || "apartment";
}

export default function AddProperty() {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const { addProperty } = useProperties();
  const languageContext = useLanguage();

  const language = getLanguage(languageContext?.language || languageContext?.currentLanguage);
  const t = TEXT[language];
  const isRTL = language === "ar";

  const fileInputRef = useRef(null);
  const isMountedRef = useRef(true);

  // استرجاع المسودة المحفوظة من sessionStorage إن وجدت لعدم فقدان البيانات
  const [formData, setFormData] = useState(() => {
    try {
      const saved = sessionStorage.getItem(FORM_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return INITIAL_FORM;
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const governorates = getGovernorates();
  const selectedGovernorate = governorates.find((item) => {
    const label = getLocationLabel(item, language);
    const fallbackLabel = typeof item === "object" && item ? item.name || item.label || item.value || "" : item;
    return label === formData.governorate || fallbackLabel === formData.governorate;
  });
  const cities = getCities(selectedGovernorate);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // حفظ البيانات تلقائياً في sessionStorage كلما تغيرت
  useEffect(() => {
    try {
      sessionStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
    } catch {
      // ignore
    }
  }, [formData]);

  // التعامل مع الرجوع من صفحة الخريطة وتحديث الإحداثيات والعنوان
  useEffect(() => {
    const selectedLocation = routerLocation.state?.selectedLocation;
    if (!selectedLocation) return;
    const locationText = selectedLocation.location || selectedLocation.address || selectedLocation.name || "";
    setFormData((previous) => {
      const updated = {
        ...previous,
        location: locationText || previous.location,
        latitude: selectedLocation.latitude != null ? Number(selectedLocation.latitude) : previous.latitude,
        longitude: selectedLocation.longitude != null ? Number(selectedLocation.longitude) : previous.longitude,
      };
      try {
        sessionStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setErrors((previous) => ({ ...previous, location: "" }));
    navigate(routerLocation.pathname, { replace: true, state: {} });
  }, [routerLocation.state, routerLocation.pathname, navigate]);

  function updateField(field, value) {
    setFormData((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: "", form: "" }));
  }

  function handleGovernorateChange(event) {
    const value = event.target.value;
    setFormData((previous) => ({ ...previous, governorate: value, city: "" }));
    setErrors((previous) => ({ ...previous, governorate: "", city: "" }));
  }

  function handleCityChange(event) {
    updateField("city", event.target.value);
  }

  function toggleAmenity(value) {
    setFormData((previous) => {
      const exists = previous.amenities.includes(value);
      return {
        ...previous,
        amenities: exists
          ? previous.amenities.filter((item) => item !== value)
          : [...previous.amenities, value],
      };
    });
  }

  async function handleImagesChange(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;

    const availableSlots = MAX_IMAGES - formData.images.length;
    if (availableSlots <= 0) {
      setErrors((previous) => ({ ...previous, images: t.maxImages }));
      return;
    }

    const selectedFiles = files.slice(0, availableSlots);
    const validFiles = [];
    for (const file of selectedFiles) {
      if (!file.type.startsWith("image/")) {
        setErrors((previous) => ({ ...previous, images: t.imageType }));
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        setErrors((previous) => ({ ...previous, images: t.imageTooLarge }));
        continue;
      }
      validFiles.push(file);
    }

    if (!validFiles.length) return;

    try {
      const imageData = await Promise.all(validFiles.map(readImage));
      if (!isMountedRef.current) return;
      setFormData((previous) => {
        const remaining = Math.max(0, MAX_IMAGES - previous.images.length);
        return { ...previous, images: [...previous.images, ...imageData.slice(0, remaining)] };
      });
    } catch {
      setErrors((previous) => ({ ...previous, images: t.imageReadError }));
    }
  }

  function removeImage(index) {
    setFormData((previous) => ({
      ...previous,
      images: previous.images.filter((_, imageIndex) => imageIndex !== index),
    }));
    setErrors((previous) => ({ ...previous, images: "" }));
  }

  function makeMainImage(index) {
    setFormData((previous) => {
      const images = [...previous.images];
      if (index < 0 || index >= images.length) return previous;
      const [selectedImage] = images.splice(index, 1);
      images.unshift(selectedImage);
      return { ...previous, images };
    });
  }

  function handleSelectLocation() {
    navigate("/select-location", {
      state: {
        returnTo: "/add-property",
        currentLocation: {
          location: formData.location,
          latitude: formData.latitude,
          longitude: formData.longitude,
        },
      },
    });
  }

  function validateForm() {
    const nextErrors = {};
    if (!formData.title.trim()) nextErrors.title = t.required;
    const price = Number(formData.price);
    if (formData.price === "" || !Number.isFinite(price) || price <= 0) nextErrors.price = t.invalidPrice;
    const area = Number(formData.area);
    if (formData.area === "" || !Number.isFinite(area) || area <= 0) nextErrors.area = t.invalidArea;
    if (!formData.governorate || !formData.city || !formData.location.trim()) nextErrors.location = t.locationRequired;
    if (formData.images.length === 0) nextErrors.images = t.imagesRequired;
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving) return;
    if (!validateForm()) {
      const firstError = document.querySelector(".add-property-page .error-message");
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (typeof addProperty !== "function") {
      setErrors({ form: t.saveError });
      return;
    }

    let currentUser = null;
    try {
      currentUser = JSON.parse(localStorage.getItem("baytakUser") || "null");
    } catch {
      currentUser = null;
    }

    setSaving(true);
    setErrors({});

    try {
      const now = new Date().toISOString();
      const property = {
        id: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `property-${Date.now()}`,
        userId: currentUser?.id || currentUser?.email || "anonymous",
        ownerEmail: currentUser?.email || "",
        title: formData.title.trim(),
        price: Number(formData.price),
        governorate: formData.governorate,
        city: formData.city,
        location: formData.location.trim(),
        area: Number(formData.area),
        rooms: Math.max(0, Number(formData.rooms) || 0),
        bathrooms: Math.max(0, Number(formData.bathrooms) || 0),
        type: normalizePropertyType(formData.type),
        listingType: normalizeListingType(formData.listingType),
        description: formData.description.trim(),
        images: [...formData.images],
        image: formData.images[0] || "",
        latitude: formData.latitude == null ? null : Number(formData.latitude),
        longitude: formData.longitude == null ? null : Number(formData.longitude),
        amenities: [...formData.amenities],
        createdAt: now,
        updatedAt: now,
      };

      await Promise.resolve(addProperty(property));
      if (!isMountedRef.current) return;
      
      // مسح المسودة بعد الحفظ الناجح
      sessionStorage.removeItem(FORM_STORAGE_KEY);
      
      window.alert(t.saveSuccess);
      navigate("/my-properties");
    } catch (error) {
      console.error("Failed to add property:", error);
      if (isMountedRef.current) setErrors({ form: t.saveError });
    } finally {
      if (isMountedRef.current) setSaving(false);
    }
  }

  function handleCancel() {
    sessionStorage.removeItem(FORM_STORAGE_KEY);
    navigate(-1);
  }

  function renderError(field) {
    if (!errors[field]) return null;
    return <span className="error-message" role="alert">{errors[field]}</span>;
  }

  return (
    <main className="add-property-page" dir={isRTL ? "rtl" : "ltr"} lang={language}>
      <div className="add-property-container">
        <header className="add-property-header">
          <button type="button" className="back-button" onClick={handleCancel} aria-label={t.cancel}>
            <FaArrowLeft aria-hidden="true" />
          </button>
          <div className="header-icon" aria-hidden="true"><FaBuilding /></div>
          <h1 className="header-title">{t.pageTitle}</h1>
        </header>

        <form className="add-property-form" onSubmit={handleSubmit} noValidate>
          {/* Section 1: Basic information */}
          <section className="property-section">
            <h2 className="section-heading"><span className="section-number">1</span>{t.basicInfo}</h2>
            <div className="operation-switch">
              <button type="button" className={formData.listingType === "sale" ? "active" : ""} onClick={() => updateField("listingType", "sale")} aria-pressed={formData.listingType === "sale"}>{t.sale}</button>
              <button type="button" className={formData.listingType === "rent" ? "active" : ""} onClick={() => updateField("listingType", "rent")} aria-pressed={formData.listingType === "rent"}>{t.rent}</button>
            </div>
            <div className="form-grid">
              <div className="form-group full-width">
                <label htmlFor="property-title">{t.title} <span className="required">*</span></label>
                <input id="property-title" type="text" value={formData.title} onChange={(event) => updateField("title", event.target.value)} placeholder={t.titlePlaceholder} autoComplete="off" aria-invalid={Boolean(errors.title)} />
                {renderError("title")}
              </div>
              <div className="form-group">
                <label htmlFor="property-price">{t.price} <span className="required">*</span></label>
                <input id="property-price" type="number" min="1" step="any" inputMode="decimal" value={formData.price} onChange={(event) => updateField("price", event.target.value)} placeholder={t.pricePlaceholder} aria-invalid={Boolean(errors.price)} />
                {renderError("price")}
              </div>
              <div className="form-group">
                <label htmlFor="property-type">{t.type}</label>
                <select id="property-type" value={formData.type} onChange={(event) => updateField("type", event.target.value)}>
                  {PROPERTY_TYPES.map((item) => (<option key={item.value} value={item.value}>{item[language]}</option>))}
                </select>
              </div>
            </div>
          </section>

          {/* Section 2: Images */}
          <section className="property-section">
            <h2 className="section-heading"><span className="section-number">2</span>{t.images}</h2>
            <div className="images-area">
              <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={handleImagesChange} />
              <button type="button" className="upload-main-card" onClick={() => fileInputRef.current?.click()} disabled={formData.images.length >= MAX_IMAGES}>
                <FaCamera aria-hidden="true" />
                <h3>{t.uploadTitle}</h3>
                <p>{t.uploadHint}</p>
                <span className="maps-button"><FaPlus aria-hidden="true" />{t.chooseImages}</span>
              </button>
              {formData.images.length > 0 && (
                <div className="images-grid">
                  {formData.images.map((image, index) => (
                    <div className="image-card" key={`${index}-${image.slice(0, 30)}`}>
                      <img src={image} alt={`${t.images} ${index + 1}`} />
                      {index === 0 && <span className="main-badge">{t.mainImage}</span>}
                      <div className="image-actions">
                        {index !== 0 && (
                          <button type="button" onClick={() => makeMainImage(index)} aria-label={t.mainImage} title={t.mainImage}>
                            <FaCheck aria-hidden="true" />
                          </button>
                        )}
                        <button type="button" onClick={() => removeImage(index)} aria-label={t.removeImage} title={t.removeImage}>
                          <FaTrash aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {formData.images.length < MAX_IMAGES && (
                    <button type="button" className="add-more-image" onClick={() => fileInputRef.current?.click()}>
                      <FaPlus aria-hidden="true" />
                      <span>{t.addMore}</span>
                    </button>
                  )}
                </div>
              )}
              {renderError("images")}
            </div>
          </section>

          {/* Section 3: Location */}
          <section className="property-section">
            <h2 className="section-heading"><span className="section-number">3</span>{t.locationDetails}</h2>
            <div className="location-section">
              <div className="location-highlight">
                <FaMapMarkerAlt aria-hidden="true" />
                <div>
                  <h3>{t.selectLocation}</h3>
                  <p>{t.selectLocationHint}</p>
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="property-governorate">{t.governorate} <span className="required">*</span></label>
                  <select id="property-governorate" value={formData.governorate} onChange={handleGovernorateChange} aria-invalid={Boolean(errors.location)}>
                    <option value="">{t.governoratePlaceholder}</option>
                    {governorates.map((item) => {
                      const label = getLocationLabel(item, language);
                      const value = typeof item === "string" ? item : item.name || item.value || item.label || label;
                      return <option key={String(value)} value={value}>{label}</option>;
                    })}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="property-city">{t.city} <span className="required">*</span></label>
                  <select id="property-city" value={formData.city} onChange={handleCityChange} disabled={!formData.governorate} aria-invalid={Boolean(errors.location)}>
                    <option value="">{t.cityPlaceholder}</option>
                    {cities.map((item) => {
                      const label = getLocationLabel(item, language);
                      const value = typeof item === "string" ? item : item.name || item.value || item.label || label;
                      return <option key={String(value)} value={value}>{label}</option>;
                    })}
                  </select>
                </div>
                <div className="form-group full-width">
                  <label htmlFor="property-location">{t.location} <span className="required">*</span></label>
                  <input id="property-location" type="text" value={formData.location} onChange={(event) => updateField("location", event.target.value)} placeholder={t.locationPlaceholder} aria-invalid={Boolean(errors.location)} />
                </div>
              </div>
              <div className="map-location-section">
                <button type="button" className="maps-button" onClick={handleSelectLocation}>
                  <FaMapMarkerAlt aria-hidden="true" />
                  {t.selectLocation}
                </button>
                <div className="selected-map-location" aria-live="polite">
                  <FaMapMarkerAlt aria-hidden="true" />
                  <div>
                    <strong>{t.selectedLocation}</strong>
                    <p>{formData.latitude != null && formData.longitude != null ? `${Number(formData.latitude).toFixed(6)}, ${Number(formData.longitude).toFixed(6)}` : t.noLocation}</p>
                  </div>
                </div>
              </div>
              {renderError("location")}
            </div>
          </section>

          {/* Section 4: Property details */}
          <section className="property-section">
            <h2 className="section-heading"><span className="section-number">4</span>{t.propertyDetails}</h2>
            <div className="details-grid">
              <div className="form-group">
                <label htmlFor="property-area">{t.area} <span className="required">*</span></label>
                <input id="property-area" type="number" min="1" step="any" inputMode="decimal" value={formData.area} onChange={(event) => updateField("area", event.target.value)} placeholder={t.areaPlaceholder} aria-invalid={Boolean(errors.area)} />
                {renderError("area")}
              </div>
              <div className="counter-box">
                <label>{t.rooms}</label>
                <div className="counter">
                  <button type="button" onClick={() => updateField("rooms", Math.max(0, Number(formData.rooms) - 1))} disabled={Number(formData.rooms) <= 0}><FaTimes aria-hidden="true" /></button>
                  <span>{formData.rooms}</span>
                  <button type="button" onClick={() => updateField("rooms", Number(formData.rooms) + 1)}><FaPlus aria-hidden="true" /></button>
                </div>
              </div>
              <div className="counter-box">
                <label>{t.bathrooms}</label>
                <div className="counter">
                  <button type="button" onClick={() => updateField("bathrooms", Math.max(0, Number(formData.bathrooms) - 1))} disabled={Number(formData.bathrooms) <= 0}><FaTimes aria-hidden="true" /></button>
                  <span>{formData.bathrooms}</span>
                  <button type="button" onClick={() => updateField("bathrooms", Number(formData.bathrooms) + 1)}><FaPlus aria-hidden="true" /></button>
                </div>
              </div>
            </div>

            <div className="form-group full-width" style={{ marginTop: "24px" }}>
              <label style={{ display: "block", marginBottom: "12px" }}>{t.amenitiesTitle || "المرافق والخدمات"}</label>
              <div className="amenities-grid">
                {AMENITIES.map((item) => {
                  const isChecked = formData.amenities.includes(item.value);
                  return (
                    <label key={item.value} className="amenity">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleAmenity(item.value)}
                      />
                      <span>{item[language]}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="form-group full-width" style={{ marginTop: "20px" }}>
              <label htmlFor="property-description">{t.description}</label>
              <textarea id="property-description" rows="4" value={formData.description} onChange={(event) => updateField("description", event.target.value)} placeholder={t.descriptionPlaceholder} />
            </div>
          </section>

          {errors.form && <div className="error-text general-error" role="alert">{errors.form}</div>}

          <div className="submit-area">
            <button type="button" className="cancel-button" onClick={handleCancel} disabled={saving}>{t.cancel}</button>
            <button type="submit" className="save-property-button" disabled={saving}>
              <FaSave aria-hidden="true" />
              <span>{saving ? t.saving : t.save}</span>
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}