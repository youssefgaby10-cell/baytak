import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useProperties } from "../../context/PropertyContext";

import {
  FaArrowRight,
  FaCamera,
  FaTrash,
  FaCheck,
  FaPlus,
  FaMinus,
  FaMapMarkerAlt,
  FaHome,
} from "react-icons/fa";

import { useLanguage } from "../../context/LanguageContext.jsx";
import "../../styles/EditProperty.css";
import { EGYPT_LOCATIONS } from "../../data/egyptLocations";

function EditProperty() {
  const { t } = useLanguage();

  const navigate = useNavigate();
  const routerLocation = useLocation();
  const { updateProperty } = useProperties();

  const fileInputRef = useRef(null);

  const routeState = routerLocation.state;
  const property = routeState?.property || routeState;
  const selectedLocation = routeState?.selectedLocation || null;

  // لو دخل صفحة التعديل من غير اختيار عقار
  if (!property) {
    return (
      <div className="edit-property-page" dir="rtl">
        <div className="edit-property-empty">
          <FaHome />
          <h2>{t.selectPropertyFirst}</h2>
          <p>{t.selectPropertyToEdit}</p>

          <button
            type="button"
            onClick={() => navigate("/my-properties")}
          >
            {t.backToMyProperties}
          </button>
        </div>
      </div>
    );
  }

  const governorates = useMemo(
    () => Object.keys(EGYPT_LOCATIONS || {}),
    []
  );

  const [formData, setFormData] = useState({
    title: property.title || "",
    price: property.price || "",
    governorate: property.governorate || "",
    city: property.city || "",
    location: property.location || "",
    area: property.area || "",
    rooms: Number(property.rooms) || 1,
    bathrooms: Number(property.bathrooms) || 1,
    type: property.type || "شقة",
    listingType: property.listingType || "sale",
    description: property.description || "",
    latitude: property.latitude ?? "",
    longitude: property.longitude ?? "",
  });

  // التعامل مع العودة من صفحة الخريطة في التعديل لتحديث الإحداثيات دون فقدان البيانات
  useEffect(() => {
    if (!selectedLocation) return;
    setFormData((previous) => ({
      ...previous,
      location: selectedLocation.location || selectedLocation.address || previous.location,
      latitude: selectedLocation.latitude != null ? Number(selectedLocation.latitude) : previous.latitude,
      longitude: selectedLocation.longitude != null ? Number(selectedLocation.longitude) : previous.longitude,
    }));
    navigate(routerLocation.pathname, { replace: true, state: { property } });
  }, [selectedLocation, routerLocation.pathname, navigate, property]);

  const [images, setImages] = useState(() => {
    if (Array.isArray(property.images) && property.images.length > 0) {
      return property.images.map((src, index) => ({
        id: `old-${index}-${Date.now()}`,
        src,
        name: `صورة ${index + 1}`,
      }));
    }

    if (property.image) {
      return [
        {
          id: `old-main-${Date.now()}`,
          src: property.image,
          name: "الصورة الرئيسية",
        },
      ];
    }

    return [];
  });

  const [amenities, setAmenities] = useState(() => ({
    elevator: Boolean(
      property.amenities?.elevator ?? property.features?.elevator
    ),
    parking: Boolean(
      property.amenities?.parking ?? property.features?.parking
    ),
    security: Boolean(
      property.amenities?.security ?? property.features?.security
    ),
    balcony: Boolean(
      property.amenities?.balcony ?? property.features?.balcony
    ),
    garden: Boolean(
      property.amenities?.garden ?? property.features?.garden
    ),
    pool: Boolean(
      property.amenities?.pool ?? property.features?.pool
    ),
    airConditioning: Boolean(
      property.amenities?.airConditioning ??
        property.features?.airConditioning
    ),
    furnished: Boolean(
      property.amenities?.furnished ?? property.features?.furnished
    ),
    electricityMeter: Boolean(
      property.amenities?.electricityMeter ??
        property.features?.electricityMeter
    ),
    waterMeter: Boolean(
      property.amenities?.waterMeter ??
        property.features?.waterMeter
    ),
    gasMeter: Boolean(
      property.amenities?.gasMeter ?? property.features?.gasMeter
    ),
    modernFinish: Boolean(
      property.amenities?.modernFinish ??
        property.features?.modernFinish
    ),
    family: Boolean(
      property.amenities?.family ?? property.features?.family
    ),
    quiet: Boolean(
      property.amenities?.quiet ?? property.features?.quiet
    ),
  }));

  const [errors, setErrors] = useState({});

  const cities = useMemo(() => {
    if (!formData.governorate) return [];
    const locData = EGYPT_LOCATIONS?.[formData.governorate];
    if (Array.isArray(locData)) return locData;
    if (locData && typeof locData === "object") {
      return locData.cities || locData.city || [];
    }
    return [];
  }, [formData.governorate]);

  const propertyTypes = [
    "شقة",
    "فيلا",
    "شاليه",
    "دوبلكس",
    "بنتهاوس",
    "تاون هاوس",
    "استوديو",
    "مكتب",
    "محل",
    "عيادة",
    "أرض",
    "مصنع",
    "مخزن",
  ];

  const amenityList = [
    { key: "elevator", label: "مصعد" },
    { key: "parking", label: "جراج" },
    { key: "security", label: "أمن وحراسة" },
    { key: "balcony", label: "بلكونة" },
    { key: "garden", label: "حديقة" },
    { key: "pool", label: "حمام سباحة" },
    { key: "airConditioning", label: "تكييف" },
    { key: "furnished", label: "مفروش" },
    { key: "electricityMeter", label: "عداد كهرباء مستقل" },
    { key: "waterMeter", label: "عداد مياه مستقل" },
    { key: "gasMeter", label: "عداد غاز مستقل" },
    { key: "modernFinish", label: "تشطيب حديث" },
    { key: "family", label: "مناسب للعائلات" },
    { key: "quiet", label: "منطقة هادئة" },
  ];

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const handleGovernorateChange = (event) => {
    const governorate = event.target.value;

    setFormData((previous) => ({
      ...previous,
      governorate,
      city: "",
    }));

    setErrors((previous) => ({
      ...previous,
      governorate: "",
      city: "",
    }));
  };

  const increaseRooms = () => {
    setFormData((previous) => ({
      ...previous,
      rooms: Number(previous.rooms) + 1,
    }));
  };

  const decreaseRooms = () => {
    setFormData((previous) => ({
      ...previous,
      rooms: Math.max(1, Number(previous.rooms) - 1),
    }));
  };

  const increaseBathrooms = () => {
    setFormData((previous) => ({
      ...previous,
      bathrooms: Number(previous.bathrooms) + 1,
    }));
  };

  const decreaseBathrooms = () => {
    setFormData((previous) => ({
      ...previous,
      bathrooms: Math.max(1, Number(previous.bathrooms) - 1),
    }));
  };

  const toggleAmenity = (key) => {
    setAmenities((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

  const handleImages = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (!selectedFiles.length) return;

    const imageFiles = selectedFiles.filter((file) =>
      file.type.startsWith("image/")
    );

    const readers = imageFiles.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();

          reader.onload = () => {
            resolve({
              id: `${file.name}-${file.lastModified}-${Math.random()}`,
              src: reader.result,
              name: file.name,
            });
          };

          reader.onerror = () => resolve(null);

          reader.readAsDataURL(file);
        })
    );

    Promise.all(readers).then((results) => {
      const validImages = results.filter(Boolean);

      setImages((previous) => [
        ...previous,
        ...validImages,
      ]);
    });

    event.target.value = "";
  };

  const removeImage = (id) => {
    setImages((previous) =>
      previous.filter((image) => image.id !== id)
    );
  };

  const makeMainImage = (id) => {
    setImages((previous) => {
      const selected = previous.find(
        (image) => image.id === id
      );

      if (!selected) return previous;

      const rest = previous.filter(
        (image) => image.id !== id
      );

      return [selected, ...rest];
    });
  };

  const openLocationPicker = () => {
    const searchText = [
      formData.location,
      formData.city,
      formData.governorate,
      "مصر",
    ]
      .filter(Boolean)
      .join(", ");

    navigate("/select-location", {
      state: {
        returnTo: routerLocation.pathname,
        property,
        searchText,
      },
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "اكتب عنوان العقار";
    }

    if (!formData.price) {
      newErrors.price = "اكتب السعر";
    }

    if (!formData.governorate) {
      newErrors.governorate = "اختار المحافظة";
    }

    if (!formData.city) {
      newErrors.city = "اختار المدينة أو المنطقة";
    }

    if (!formData.area) {
      newErrors.area = "اكتب المساحة";
    }

    if (images.length === 0) {
      newErrors.images = "أضف صورة واحدة على الأقل";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (event) => {
    event.preventDefault();

    if (!validate()) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    const imageSources = images.map(
      (image) => image.src
    );

    const updatedProperty = {
      ...property,

      title: formData.title.trim(),

      price: Number(
        String(formData.price).replace(/,/g, "")
      ),

      governorate: formData.governorate,

      city: formData.city,

      location: formData.location.trim(),

      area: Number(formData.area),

      rooms: Number(formData.rooms),

      bathrooms: Number(formData.bathrooms),

      type: formData.type,

      listingType: formData.listingType,

      description: formData.description.trim(),

      image: imageSources[0] || "",

      images: imageSources,

      latitude: formData.latitude !== "" && formData.latitude != null
        ? Number(formData.latitude)
        : null,

      longitude: formData.longitude !== "" && formData.longitude != null
        ? Number(formData.longitude)
        : null,

      amenities: {
        ...amenities,
      },

      features: {
        ...amenities,
      },
    };

    updateProperty(updatedProperty);

    alert(t.editPropertySuccess || "تم تعديل العقار بنجاح");

    navigate("/my-properties");
  };

  return (
    <div
      className="edit-property-page"
      dir="rtl"
    >
      <div className="edit-property-container">

        {/* Header */}
        <div className="edit-property-header">
          <button
            type="button"
            className="back-button"
            onClick={() => navigate(-1)}
            aria-label="رجوع"
          >
            <FaArrowRight />
          </button>

          <div className="header-title">
            <div className="header-icon">
              <FaHome />
            </div>

            <div>
              <h1>{t.editPropertyTitle || "تعديل العقار"}</h1>
              <p>
                {t.editPropertySubtitle || "قم بتحديث بيانات العقار الخاصة بك"}
              </p>
            </div>
          </div>
        </div>

        <form
          className="edit-property-form"
          onSubmit={handleSave}
        >

          {/* الصور */}
          <section className="property-section">

            <div className="section-heading">
              <div>
                <h2>{t.propertyImages || "صور العقار"}</h2>
                <p>
                  {t.editImagesHint || "أضف صورًا واضحة ومميزة للعقار"}
                </p>
              </div>

              <span className="section-number">
                01
              </span>
            </div>

            <div className="images-area">

              {images.length === 0 ? (
                <button
                  type="button"
                  className="upload-main-card"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                >
                  <div className="upload-icon">
                    <FaCamera />
                  </div>

                  <strong>
                    {t.addPropertyPhotos || "اختر الصور"}
                  </strong>

                  <span>
                    {t.chooseMultipleImages || "اختر عدة صور"}
                  </span>
                </button>
              ) : (
                <div className="images-grid">

                  {images.map((image, index) => (
                    <div
                      className={`image-card ${
                        index === 0
                          ? "main-image"
                          : ""
                      }`}
                      key={image.id}
                    >
                      <img
                        src={image.src}
                        alt={`العقار ${index + 1}`}
                      />

                      {index === 0 && (
                        <span className="main-badge">
                          <FaCheck />
                          {t.mainImage || "الرئيسية"}
                        </span>
                      )}

                      <div className="image-actions">

                        {index !== 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              makeMainImage(
                                image.id
                              )
                            }
                            title="اجعلها الصورة الرئيسية"
                          >
                            <FaCheck />
                          </button>
                        )}

                        <button
                          type="button"
                          className="delete-image"
                          onClick={() =>
                            removeImage(image.id)
                          }
                          title="حذف الصورة"
                        >
                          <FaTrash />
                        </button>

                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="add-more-image"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                  >
                    <FaPlus />
                    <span>
                      {t.addImage || "إضافة"}
                    </span>
                  </button>

                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handleImages}
              />

            </div>

            {errors.images && (
              <div className="error-message">
                {errors.images}
              </div>
            )}

          </section>

          {/* البيانات الأساسية */}
          <section className="property-section">

            <div className="section-heading">
              <div>
                <h2>{t.propertyData || "البيانات الأساسية"}</h2>
                <p>
                  {t.editBasicInformation || "عنوان العقار ونوعه والسعر"}
                </p>
              </div>

              <span className="section-number">
                02
              </span>
            </div>

            <div className="form-group">
              <label>{t.operationType || "نوع العملية"}</label>

              <div className="operation-switch">

                <button
                  type="button"
                  className={
                    formData.listingType ===
                    "sale"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setFormData((previous) => ({
                      ...previous,
                      listingType: "sale",
                    }))
                  }
                >
                  {t.forSale || "للبيع"}
                </button>

                <button
                  type="button"
                  className={
                    formData.listingType ===
                    "rent"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setFormData((previous) => ({
                      ...previous,
                      listingType: "rent",
                    }))
                  }
                >
                  {t.forRent || "للإيجار"}
                </button>

              </div>
            </div>

            <div className="form-group">
              <label>{t.propertyAddress || "عنوان العقار"}</label>

              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="مثال: شقة فاخرة للبيع في مدينة نصر"
              />

              {errors.title && (
                <span className="field-error">
                  {errors.title}
                </span>
              )}
            </div>

            <div className="form-grid">

              <div className="form-group">
                <label>{t.propertyType || "نوع العقار"}</label>

                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                >
                  {propertyTypes.map(
                    (type) => (
                      <option
                        value={type}
                        key={type}
                      >
                        {type}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="form-group">
                <label>
                  {t.propertyPriceEGP || "السعر (جنيه)"}
                </label>

                <input
                  name="price"
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                />

                {errors.price && (
                  <span className="field-error">
                    {errors.price}
                  </span>
                )}
              </div>

            </div>

          </section>

          {/* الموقع */}
          <section className="property-section">

            <div className="section-heading">
              <div>
                <h2>
                  {t.propertyLocation || "موقع العقار"}
                </h2>

                <p>
                  {t.editPropertyLocationDescription || "المحافظة والمدينة والعنوان على الخريطة"}
                </p>
              </div>

              <span className="section-number">
                03
              </span>
            </div>

            <div className="form-grid">

              <div className="form-group">
                <label>{t.governorate || "المحافظة"}</label>

                <select
                  value={formData.governorate}
                  onChange={
                    handleGovernorateChange
                  }
                >
                  <option value="">
                    {t.chooseGovernorate || "اختر المحافظة"}
                  </option>

                  {governorates.map(
                    (governorate) => (
                      <option
                        value={governorate}
                        key={governorate}
                      >
                        {governorate}
                      </option>
                    )
                  )}
                </select>

                {errors.governorate && (
                  <span className="field-error">
                    {errors.governorate}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label>
                  {t.cityOrArea || "المدينة / المنطقة"}
                </label>

                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={
                    !formData.governorate
                  }
                >
                  <option value="">
                    {t.chooseCityOrArea || "اختر المدينة"}
                  </option>

                  {cities.map((city) => (
                    <option
                      value={city}
                      key={city}
                    >
                      {city}
                    </option>
                  ))}
                </select>

                {errors.city && (
                  <span className="field-error">
                    {errors.city}
                  </span>
                )}
              </div>

            </div>

            <div className="form-group">
              <label>
                {t.detailedAddressShort || "العنوان بالتفصيل"}
              </label>

              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="مثال: شارع عباس العقاد"
              />
            </div>

            <div className="coordinates-card">

              <div className="coordinates-title">
                <div>
                  <strong>
                    {t.selectLocationOnMap || "تحديد الموقع على الخريطة"}
                  </strong>

                  <span>
                    {t.optional || "اختياري"}
                  </span>
                </div>

                <FaMapMarkerAlt />
              </div>

              <div className="form-grid">

                <div className="form-group">
                  <label>
                    {t.latitude || "خط العرض"}
                  </label>

                  <input
                    name="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={handleChange}
                    placeholder="30.0444"
                  />
                </div>

                <div className="form-group">
                  <label>
                    {t.longitude || "خط الطول"}
                  </label>

                  <input
                    name="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={handleChange}
                    placeholder="31.2357"
                  />
                </div>

              </div>

              <button
                type="button"
                className="maps-button"
                onClick={openLocationPicker}
              >
                <FaMapMarkerAlt />
                {t.selectPlaceOnMap || "اختر من الخريطة"}
              </button>

            </div>

          </section>

          {/* التفاصيل */}
          <section className="property-section">

            <div className="section-heading">
              <div>
                <h2>
                  {t.propertyDetails || "تفاصيل العقار"}
                </h2>

                <p>
                  {t.areaRoomsBathrooms || "المساحة وعدد الغرف والحمامات"}
                </p>
              </div>

              <span className="section-number">
                04
              </span>
            </div>

            <div className="details-grid">

              <div className="form-group">
                <label>{t.area || "المساحة"}</label>

                <div className="input-with-unit">
                  <input
                    name="area"
                    type="number"
                    min="1"
                    value={formData.area}
                    onChange={handleChange}
                  />

                  <span>م²</span>
                </div>

                {errors.area && (
                  <span className="field-error">
                    {errors.area}
                  </span>
                )}
              </div>

              <div className="counter-box">
                <label>
                  {t.numberOfRooms || "الغرف"}
                </label>

                <div className="counter">

                  <button
                    type="button"
                    onClick={decreaseRooms}
                  >
                    <FaMinus />
                  </button>

                  <strong>
                    {formData.rooms}
                  </strong>

                  <button
                    type="button"
                    onClick={increaseRooms}
                  >
                    <FaPlus />
                  </button>

                </div>
              </div>

              <div className="counter-box">
                <label>
                  {t.numberOfBathrooms || "الحمامات"}
                </label>

                <div className="counter">

                  <button
                    type="button"
                    onClick={
                      decreaseBathrooms
                    }
                  >
                    <FaMinus />
                  </button>

                  <strong>
                    {formData.bathrooms}
                  </strong>

                  <button
                    type="button"
                    onClick={
                      increaseBathrooms
                    }
                  >
                    <FaPlus />
                  </button>

                </div>
              </div>

            </div>

          </section>

          {/* المميزات */}
          <section className="property-section">

            <div className="section-heading">
              <div>
                <h2>
                  {t.propertyFeatures || "المرافق والخدمات"}
                </h2>

                <p>
                  {t.chooseFeatures || "حدد الخدمات والمميزات المتوفرة"}
                </p>
              </div>

              <span className="section-number">
                05
              </span>
            </div>

            <div className="amenities-grid">

              {amenityList.map(
                (amenity) => (
                  <button
                    type="button"
                    key={amenity.key}
                    className={
                      amenities[
                        amenity.key
                      ]
                        ? "amenity active"
                        : "amenity"
                    }
                    onClick={() =>
                      toggleAmenity(
                        amenity.key
                      )
                    }
                  >
                    <span className="amenity-check">
                      {amenities[
                        amenity.key
                      ] && <FaCheck />}
                    </span>

                    {amenity.label}
                  </button>
                )
              )}

            </div>

          </section>

          {/* الوصف */}
          <section className="property-section">

            <div className="section-heading">
              <div>
                <h2>
                  {t.propertyDescription || "وصف العقار"}
                </h2>

                <p>
                  {t.writeDescription || "اكتب تفاصيل إضافية عن العقار"}
                </p>
              </div>

              <span className="section-number">
                06
              </span>
            </div>

            <div className="form-group">

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="6"
                placeholder="اكتب وصف العقار..."
              />

            </div>

          </section>

          {/* الأزرار */}
          <div className="submit-area">

            <button
              type="submit"
              className="save-property-button"
            >
              <FaCheck />
              {t.savePropertyChanges || "حفظ التعديلات"}
            </button>

            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate(-1)}
            >
              {t.cancel || "إلغاء"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

export default EditProperty;