import { useLanguage } from "../../context/LanguageContext.jsx";
function FilterChips({ activeFilter, setActiveFilter }) {
  const { t } = useLanguage();

  return (
    <div className="property-switch">

      <button
        type="button"
        className={
          activeFilter === "rent"
            ? "switch-btn active"
            : "switch-btn"
        }
        onClick={() => setActiveFilter("rent")}
      >
        {t.forRent}
      </button>

      <button
        type="button"
        className={
          activeFilter === "sale"
            ? "switch-btn active"
            : "switch-btn"
        }
        onClick={() => setActiveFilter("sale")}
      >
        {t.forSale}
      </button>

    </div>
  );
}

export default FilterChips;