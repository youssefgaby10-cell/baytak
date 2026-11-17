import { useState } from "react";

import { useLanguage } from "../context/LanguageContext.jsx";

export default function LocationPicker({
  latitude,
  longitude,
  onLocationSelect,
}) {
  const { t } = useLanguage();

  const [mapLink, setMapLink] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // دالة ذكية لاستخراج الإحداثيات من رابط جوجل مابس بمختلف أشكاله
  const handleConfirmLocation = (event) => {
    event.preventDefault();
    setError("");
    setSuccess(false);

    const link = mapLink.trim();

    if (!link) {
      setError(t.pleasePasteMapLink);
      return;
    }

    try {
      let lat = null;
      let lon = null;

      // الشكل الأول للروابط: يحتوي على @latitude,longitude
      if (link.includes("@")) {
        const afterAt = link.split("@")[1];
        const coordinates = afterAt.split(",");
        if (coordinates.length >= 2) {
          lat = parseFloat(coordinates[0]);
          lon = parseFloat(coordinates[1]);
        }
      } 
      // الشكل الثاني للروابط: يحتوي على q=latitude,longitude
      else if (link.includes("q=")) {
        const queryParams = new URLSearchParams(link.split("?")[1]);
        const q = queryParams.get("q");
        if (q && q.includes(",")) {
          const coordinates = q.split(",");
          lat = parseFloat(coordinates[0]);
          lon = parseFloat(coordinates[1]);
        }
      }

      // التأكد من أننا استخرجنا أرقام إحداثيات صحيحة
      if (lat && lon && !isNaN(lat) && !isNaN(lon)) {
        // إرسال الإحداثيات المستخرجة فوراً إلى ملف AddProperty
        onLocationSelect({
          latitude: lat,
          longitude: lon,
        });
        setSuccess(true);
      } else {
        setError(
          "الرابط غير صحيح أو لا يحتوي على إحداثيات مباشرة. من فضلك انسخ الرابط كاملاً من شريط العناوين في جوجل مابس بعد اختيار المكان."
        );
      }
    } catch (err) {
      console.error(err);
      setError(t.invalidMapLink);
    }
  };

  const hasLocation = latitude && longitude;

  return (
    <div 
      className="google-maps-picker-wrapper" 
      style={{
        fontFamily: "sans-serif",
        direction: "rtl",
        padding: "20px",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        backgroundColor: "#f9fafb",
        maxWidth: "500px",
        margin: "0 auto"
      }}
    >
      <h3 style={{ fontSize: "16px", color: "#1f2937", marginBottom: "10px", fontWeight: "bold" }}>
        {t.locationPickerTitle}
      </h3>
      
      <p style={{ fontSize: "13px", color: "#4b5563", lineHeight: "1.6", marginBottom: "20px" }}>
        {t.locationPickerInstructions}
      </p>

      {/* خطوة 1: زر الانتقال لجوجل مابس */}
      <div style={{ marginBottom: "20px" }}>
        <a
          href="https://www.google.com/maps"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            width: "100%",
            padding: "12px",
            backgroundColor: "#ea4335",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            textAlign: "center",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            fontSize: "14px"
          }}
        >
          {t.openGoogleMapsStep}
        </a>
      </div>

      {/* خطوة 2: لصق الرابط والتأكيد */}
      <form onSubmit={handleConfirmLocation}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "15px" }}>
          <label style={{ fontSize: "14px", fontWeight: "bold", color: "#374151" }}>
            {t.pasteMapLinkStep}
          </label>
          <input
            type="text"
            value={mapLink}
            onChange={(e) => setMapLink(e.target.value)}
            placeholder={t.pasteLinkPlaceholder}
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
              direction: "ltr",
              textAlign: "left"
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#2563eb",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "14px",
            transition: "background-color 0.2s"
          }}
        >
          {t.confirmSaveLocation}
        </button>
      </form>

      {/* رسائل الخطأ والنجاح للتغذية الراجعة */}
      {error && (
        <div style={{ color: "#b91c1c", backgroundColor: "#fef2f2", padding: "12px", borderRadius: "8px", marginTop: "15px", fontSize: "13px", border: "1px solid #fca5a5" }}>
          ⚠️ {error}
        </div>
      )}

      {(success || hasLocation) && (
        <div style={{ color: "#15803d", backgroundColor: "#f0fdf4", padding: "12px", borderRadius: "8px", marginTop: "15px", fontSize: "13px", border: "1px solid #bbf7d0" }}>
          🎉 <strong>{t.locationSavedSuccess}</strong>
          <br />
          <span style={{ fontSize: "11px", color: "#166534" }}>
            ({t.locationCoordinatesLabel} {latitude}, {longitude})
          </span>
        </div>
      )}
    </div>
  );
}