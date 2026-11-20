import { useLanguage } from "../../context/LanguageContext.jsx";
import { useState, useRef, useEffect, useMemo } from "react";
import {
  FaSearch,
  FaMicrophone,
  FaMicrophoneSlash,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { parseSearchWithAI } from "../../services/geminiService";

function SearchBar({
  searchTerm,
  setSearchTerm,
  onSearch,
  activeFilter,
  activeCategory,
  properties = [],
  setSearchResults,
}) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [listening, setListening] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const searchRef = useRef(null);
  const lastResultIdsRef = useRef("");

  // =====================================================
  // توحيد الكتابة العربية
  // =====================================================
  const normalizeArabic = (text = "") => {
    return String(text)
      .toLowerCase()
      .replace(/[أإآ]/g, "ا")
      .replace(/[ؤئ]/g, "ء")
      .replace(/ة/g, "ه")
      .replace(/ى/g, "ي")
      .replace(/[ًٌٍَُِّْـ]/g, "")
      .trim();
  };

  // تحديد نوع العرض
  const getListingType = (property) => {
    if (property?.listingType === "sale" || property?.listingType === "rent") {
      return property.listingType;
    }
    const text = normalizeArabic(`${property?.title || ""} ${property?.description || ""}`);
    if (text.includes("للايجار") || text.includes("ايجار")) return "rent";
    if (text.includes("للبيع") || text.includes("بيع")) return "sale";
    return null;
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // البحث الصوتي
  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(t.browserNoVoiceSearch || "المتصفح لا يدعم البحث الصوتي");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "ar-EG";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.start();
    setListening(true);

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setSearchTerm(text);
      setShowSuggestions(false);

      const query = text.trim();

      if (query) {
        executeAISearch(query);
      }
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
  };

  // =====================================================
  // الخوارزمية الذكية المطورة (تتعامل بسلاسة مع الجمل الطويلة)
  // =====================================================
  
  const smartSearch = (property, search) => {
    const query = normalizeArabic(search);

    if (!query) return true;

    const propText = normalizeArabic(`
      ${property.title || ""}
      ${property.location || ""}
      ${property.city || ""}
      ${property.governorate || ""}
      ${property.type || ""}
      ${property.description || ""}
      ${property.category || ""}
    `);

    const stopWords = [
      "في", "من", "و", "ب", "عايز", "عاوز",
      "اريد", "ابحث", "عن", "عقار", "مع", "للسكن", "يكون"
    ];

    // في دالة smartSearch داخل SearchBar.jsx
  const words = query
    .split(/\s+/)
    .filter(word => word.length > 1 && !stopWords.includes(word));

  if (words.length === 0) return false;

  // غير السطر ده من every إلى some عشان لو كلمة واحدة اختلفت (زي تلات/3) باقي العقارات تظهر
  return words.some(word => propText.includes(word));
  };


  const calculateSmartScore = (property, search) => {
    if (!search.trim()) return 100;
    
    const query = normalizeArabic(search);
    let score = 50; // نقطة بداية أساسية

    // فحص مطابقة الموقع
    if (property.location && query.includes(normalizeArabic(property.location))) {
      score += 30;
    }

    // فحص نوع العرض (بيع/إيجار)
    const propListing = getListingType(property);
    if ((query.includes("بيع") && propListing === "sale") || (query.includes("ايجار") && propListing === "rent")) {
      score += 20;
    }

    return Math.min(score, 100);
  };

  // الفلاتر الحالية
  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      if (activeFilter && getListingType(property) && getListingType(property) !== activeFilter) {
        return false;
      }
      if (activeCategory && property.category && property.category !== activeCategory) {
        return false;
      }
      return true;
    });
  }, [properties, activeFilter, activeCategory]);

  const suggestions = useMemo(() => {
    if (searchTerm.trim().length === 0) return [];

    return filteredProperties
      .filter((property) => smartSearch(property, searchTerm))
      .map((property) => {
        const smartScore = calculateSmartScore(property, searchTerm);
        return {
          ...property,
          smartScore,
          matchLevel: smartScore >= 80 ? "high" : "medium",
          matchLabel: smartScore >= 80 ? (t.matchExcellent || "مطابق ممتاز") : (t.matchPartial || "مطابق جيد"),
          matchReasons: [t.listingTypeMatches || "مطابق لبحثك الذكي"],
        };
      })
      .sort((a, b) => b.smartScore - a.smartScore);
  }, [filteredProperties, searchTerm, t]);

  useEffect(() => {
    if (!setSearchResults) return;
    const newIds = suggestions.map((property) => property.id).join(",");
    if (lastResultIdsRef.current === newIds) return;
    lastResultIdsRef.current = newIds;
    setSearchResults(suggestions);
  }, [suggestions, setSearchResults]);

  // =====================================================
  // دالة تنفيذ البحث بالذكاء الاصطناعي الحقيقي (Gemini)
  // =====================================================
  const executeAISearch = async (queryText) => {
    const query = queryText.trim();
    if (!query) return;

    setShowSuggestions(false);
    setAiLoading(true);

    // ناخد الكلمة المحسنة من الذكاء الاصطناعي أو نستخدم البحث الذكي المباشر
    const refinedQuery = await parseSearchWithAI(query);
    setAiLoading(false);

    const searchQuery = refinedQuery || query;

    const finalResults = filteredProperties
      .filter((property) => smartSearch(property, searchQuery))
      .map((property) => ({
        ...property,
        smartScore: calculateSmartScore(property, searchQuery),
        matchLevel: "high",
        matchLabel: t.matchExcellent || "مطابق بالذكاء الاصطناعي ✨",
        matchReasons: [t.listingTypeMatches || "تم التحليل بواسطة Gemini AI"],
      }))
      .sort((a, b) => b.smartScore - a.smartScore);

    if (setSearchResults) {
      setSearchResults(finalResults);
    }

    navigate("/search", {
      state: {
        searchTerm: query,
        searchResults: finalResults,
        activeFilter,
        activeCategory,
      },
    });
  };

  return (
    <div className="search-container" ref={searchRef}>
      <div className="search-box">
        <button
          type="button"
          className="voice-button"
          onClick={startVoiceSearch}
          aria-label={t.voiceSearch || "بحث صوتي"}
        >
          {listening ? <FaMicrophoneSlash /> : <FaMicrophone />}
        </button>

        <input
          type="text"
          value={searchTerm}
          placeholder={t.searchPlaceholder || "ابحث عن عقار بالذكاء الاصطناعي..."}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              executeAISearch(searchTerm);
            }
          }}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowSuggestions(true);
          }}
        />

        <button
          type="button"
          className="search-button"
          disabled={aiLoading}
          onClick={() => executeAISearch(searchTerm)}
          aria-label={t.search || "بحث"}
        >
          {aiLoading ? "⏳" : <FaSearch />}
        </button>
      </div>

      {/* الأزرار المقترحة للبحث الذكي بشكل أفقي وشيك زي الـ Demo بالضبط */}
      <div 
        className="ai-suggestions-chips" 
        style={{ 
          display: "flex", 
          flexDirection: "row", 
          flexWrap: "wrap", 
          gap: "8px", 
          marginTop: "12px", 
          alignItems: "center", 
          justifyContent: "flex-start", 
          direction: "rtl", 
          width: "100%" 
        }}
      >
        <span style={{ fontSize: "12px", color: "#9ca3af", fontWeight: "600", whiteSpace: "nowrap" }}>✨ جرب البحث:</span>
        {[
          "شقة للبيع في مدينة نصر تلات غرف",
          "فيلا للبيع في التجمع الخامس",
          "شقة للإيجار في المعادي",
          "شقة في مدينة نصر بسعر أقل من 3 مليون"
        ].map((sampleText, index) => (
          <button
            key={index}
            type="button"
            className="ai-chip"
            style={{
              background: "rgba(37, 99, 235, 0.12)",
              border: "1px solid rgba(37, 99, 235, 0.3)",
              color: "#93c5fd",
              padding: "6px 14px",
              borderRadius: "20px",
              fontSize: "12px",
              cursor: "pointer",
              whiteSpace: "nowrap"
            }}
            onClick={() => {
              setSearchTerm(sampleText);
              executeAISearch(sampleText);
            }}
          >
            "{sampleText}"
          </button>
        ))}
      </div>

      {showSuggestions && searchTerm.trim().length > 0 && suggestions.length > 0 && (
        <div className="suggestions-box">
          {suggestions.slice(0, 5).map((property) => (
            <div
              key={property.id}
              className="suggestion-item"
              onClick={() => {
                setShowSuggestions(false);
                navigate(`/property/${property.id}`, { state: property });
              }}
            >
              <div className="suggestion-title">
                🏠 {property.title}
              </div>
              <div className="suggestion-location">
                📍 {property.location}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBar;