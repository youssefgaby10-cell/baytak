import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaSearch, FaSlidersH } from "react-icons/fa";

import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useProperties } from "../../context/PropertyContext";
import { parseSearchWithAI } from "../../services/geminiService";
import { EGYPT_LOCATIONS } from "../../data/egyptLocations";
import { PROPERTY_TYPES, searchProperties } from "../../utils/propertySearch.js";
import { useSeo } from "../../utils/useSeo.js";

import EmptyState from "../../components/common/EmptyState";
import PropertyCard from "../../components/property/PropertyCard";

import "../../styles/Search.css";

const FILTER_KEYS = ["listing", "type", "gov", "min", "max", "rooms"];

// لوحة الفلاتر (تُعاد تهيئتها عند تغيّر الرابط عن طريق key)
function FilterPanel({ initial, isArabic, onApply, onClear }) {
  const [draft, setDraft] = useState(initial);

  const update = (key, value) =>
    setDraft((previous) => ({ ...previous, [key]: value }));

  const governorates = Object.keys(EGYPT_LOCATIONS);

  const listingOptions = [
    { value: "", label: isArabic ? "الكل" : "All" },
    { value: "rent", label: isArabic ? "إيجار" : "Rent" },
    { value: "sale", label: isArabic ? "بيع" : "Sale" },
  ];

  const roomOptions = ["", "1", "2", "3", "4+"];

  return (
    <div className="search-filters">
      <div className="filter-group">
        <span className="filter-label">{isArabic ? "نوع العرض" : "Listing"}</span>
        <div className="filter-chips">
          {listingOptions.map((option) => (
            <button
              key={option.value || "all"}
              type="button"
              className={draft.listing === option.value ? "chip active" : "chip"}
              onClick={() => update("listing", option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label className="filter-label" htmlFor="filter-type">
          {isArabic ? "نوع العقار" : "Property type"}
        </label>
        <select
          id="filter-type"
          value={draft.type}
          onChange={(event) => update("type", event.target.value)}
        >
          <option value="">{isArabic ? "الكل" : "All"}</option>
          {PROPERTY_TYPES.map((item) => (
            <option key={item.value} value={item.value}>
              {isArabic ? item.ar : item.en}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label" htmlFor="filter-gov">
          {isArabic ? "المحافظة" : "Governorate"}
        </label>
        <select
          id="filter-gov"
          value={draft.gov}
          onChange={(event) => update("gov", event.target.value)}
        >
          <option value="">{isArabic ? "كل المحافظات" : "All governorates"}</option>
          {governorates.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <span className="filter-label">{isArabic ? "السعر (جنيه)" : "Price (EGP)"}</span>
        <div className="filter-price">
          <input
            type="number"
            inputMode="numeric"
            min="0"
            placeholder={isArabic ? "من" : "Min"}
            value={draft.min}
            onChange={(event) => update("min", event.target.value)}
          />
          <input
            type="number"
            inputMode="numeric"
            min="0"
            placeholder={isArabic ? "إلى" : "Max"}
            value={draft.max}
            onChange={(event) => update("max", event.target.value)}
          />
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-label">{isArabic ? "عدد الغرف" : "Rooms"}</span>
        <div className="filter-chips">
          {roomOptions.map((option) => (
            <button
              key={option || "any"}
              type="button"
              className={draft.rooms === option ? "chip active" : "chip"}
              onClick={() => update("rooms", option)}
            >
              {option || (isArabic ? "أي عدد" : "Any")}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-actions">
        <button type="button" className="filter-apply" onClick={() => onApply(draft)}>
          {isArabic ? "تطبيق الفلاتر" : "Apply filters"}
        </button>
        <button type="button" className="filter-clear" onClick={onClear}>
          {isArabic ? "مسح الفلاتر" : "Clear"}
        </button>
      </div>
    </div>
  );
}

function Search() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const { darkMode } = useTheme();
  const { language } = useLanguage();
  const isArabic = language === "ar";

  const { properties = [] } = useProperties() || {};

  const q = params.get("q") || "";
  const shownTerm = params.get("s") || q;
  const sort = params.get("sort") || "";

  const filters = {
    listing: params.get("listing") || "",
    type: params.get("type") || "",
    gov: params.get("gov") || "",
    min: params.get("min") || "",
    max: params.get("max") || "",
    rooms: params.get("rooms") || "",
  };

  const activeFiltersCount = FILTER_KEYS.filter((key) => filters[key]).length;
  const hasAnyParam = Boolean(q || sort || activeFiltersCount);

  const [showFilters, setShowFilters] = useState(false);
  const [searchText, setSearchText] = useState(shownTerm);
  const [searching, setSearching] = useState(false);

  // صفحات البحث بنتائج مخصصة لا تُفهرس في جوجل (حتى لا تتكرر صفحات رفيعة)
  useSeo({
    title: shownTerm
      ? `${isArabic ? "نتائج البحث عن" : "Search results for"} "${shownTerm}" | Baytak`
      : isArabic
        ? "البحث عن عقارات | Baytak"
        : "Search properties | Baytak",
    description: isArabic
      ? "ابحث عن شقق وفيلات ومحلات وأراضي للبيع والإيجار في مصر وفلتر النتائج حسب السعر وعدد الغرف والمحافظة."
      : "Search apartments, villas, shops and land for sale or rent in Egypt and filter by price, rooms and governorate.",
    noindex: hasAnyParam,
  });

  const results = useMemo(
    () =>
      searchProperties(properties, {
        q,
        listing: filters.listing,
        type: filters.type,
        governorate: filters.gov,
        min: filters.min,
        max: filters.max,
        rooms: filters.rooms,
        sort,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [properties, q, sort, params.toString()]
  );

  const goBack = () => {
    if (window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate("/home");
    }
  };

  const updateParams = (changes) => {
    const next = new URLSearchParams(params);

    Object.entries(changes).forEach(([key, value]) => {
      if (value === "" || value == null) next.delete(key);
      else next.set(key, value);
    });

    setParams(next, { replace: true });
  };

  const handleSearchSubmit = async (event) => {
    event.preventDefault();

    const text = searchText.trim();

    if (!text) {
      updateParams({ q: "", s: "" });
      return;
    }

    setSearching(true);

    try {
      // البحث الذكي للمسجلين، وللزائر بحث عادي (الدالة ترجع الجملة الأصلية)
      const refined = await parseSearchWithAI(text);
      updateParams({ q: refined || text, s: text });
    } finally {
      setSearching(false);
    }
  };

  const applyFilters = (draft) => {
    updateParams({
      listing: draft.listing,
      type: draft.type,
      gov: draft.gov,
      min: draft.min,
      max: draft.max,
      rooms: draft.rooms,
    });
    setShowFilters(false);
  };

  const clearFilters = () => {
    updateParams({ listing: "", type: "", gov: "", min: "", max: "", rooms: "" });
    setShowFilters(false);
  };

  return (
    <div
      className={`search-page ${darkMode ? "dark-mode" : ""}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <header className="search-page-header">
        <button type="button" onClick={goBack}>
          {isArabic ? "→ رجوع" : "← Back"}
        </button>

        <h2>{isArabic ? "نتائج البحث" : "Search Results"}</h2>
      </header>

      <form className="search-page-form" onSubmit={handleSearchSubmit}>
        <input
          type="search"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder={
            isArabic
              ? "ابحث: شقة في مدينة نصر 3 غرف..."
              : "Search: apartment in Nasr City 3 rooms..."
          }
          aria-label={isArabic ? "بحث" : "Search"}
        />

        <button type="submit" disabled={searching} aria-label={isArabic ? "بحث" : "Search"}>
          <FaSearch />
          {searching ? (isArabic ? "جارٍ البحث..." : "Searching...") : isArabic ? "بحث" : "Search"}
        </button>
      </form>

      <div className="search-toolbar">
        <button
          type="button"
          className={showFilters ? "toolbar-btn active" : "toolbar-btn"}
          onClick={() => setShowFilters((value) => !value)}
        >
          <FaSlidersH />
          {isArabic ? "الفلاتر" : "Filters"}
          {activeFiltersCount > 0 && (
            <span className="filters-count">{activeFiltersCount}</span>
          )}
        </button>

        <select
          value={sort}
          onChange={(event) => updateParams({ sort: event.target.value })}
          aria-label={isArabic ? "الترتيب" : "Sort"}
        >
          <option value="">{isArabic ? "الترتيب: الأنسب" : "Sort: best match"}</option>
          <option value="newest">{isArabic ? "الأحدث" : "Newest"}</option>
          <option value="price_asc">{isArabic ? "السعر: الأقل" : "Price: low to high"}</option>
          <option value="price_desc">{isArabic ? "السعر: الأعلى" : "Price: high to low"}</option>
        </select>
      </div>

      {showFilters && (
        <FilterPanel
          key={JSON.stringify(filters)}
          initial={filters}
          isArabic={isArabic}
          onApply={applyFilters}
          onClear={clearFilters}
        />
      )}

      <div className="search-page-info">
        <p>
          {shownTerm
            ? isArabic
              ? "نتائج البحث عن:"
              : "Search for:"
            : isArabic
              ? "كل العقارات"
              : "All properties"}
          {shownTerm && <strong> {shownTerm}</strong>}
        </p>

        <span>
          {results.length} {isArabic ? "عقار" : "properties"}
        </span>
      </div>

      {results.length === 0 ? (
        <EmptyState
          type="search"
          title={isArabic ? "لم يتم العثور على عقارات" : "No Properties Found"}
          description={
            isArabic
              ? "جرب البحث بكلمات مختلفة أو خفّف الفلاتر."
              : "Try different keywords or relax the filters."
          }
          buttonText={isArabic ? "العودة للرئيسية" : "Back Home"}
          onAction={() => navigate("/home")}
        />
      ) : (
        <div className="search-page-grid">
          {results.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              showManagementActions={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Search;
