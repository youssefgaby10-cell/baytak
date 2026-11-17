import { useLanguage } from "../../context/LanguageContext.jsx";
import {
  FaHome,
  FaBuilding,
  FaStore,
  FaIndustry,
  FaTree,
  FaMapMarkedAlt,
} from "react-icons/fa";

function CategoryGrid({
  activeCategory,
  onCategoryChange,
  onClearCategory,
}) {
  const { t } = useLanguage();

  const categories = [
    {
      title: t.residential,
      search: "Residential",
      icon: <FaHome />,
    },
    {
      title: t.commercial,
      search: "Commercial",
      icon: <FaBuilding />,
    },
    {
      title: t.retail,
      search: "Retail",
      icon: <FaStore />,
    },
    {
      title: t.industrial,
      search: "Industrial",
      icon: <FaIndustry />,
    },
    {
      title: t.vacation,
      search: "Vacation",
      icon: <FaTree />,
    },
    {
      title: t.land,
      search: "Land",
      icon: <FaMapMarkedAlt />,
    },
  ];

  return (
    <section className="category-section">

      {/* العنوان */}
      <div className="section-header">
        <h2>{t.categories}</h2>

        <button
          type="button"
          className="see-all-btn"
          onClick={onClearCategory}
        >
          {t.seeAll}
        </button>
      </div>

      {/* Categories */}
      <div className="category-grid">
        {categories.map((item) => {
          const isActive =
            activeCategory === item.search;

          return (
            <div
              className={`category-item ${
                isActive ? "active" : ""
              }`}
              key={item.search}
              onClick={() =>
                onCategoryChange(item.search)
              }
            >
              <div className="category-circle">
                {item.icon}
              </div>

              <span>{item.title}</span>
            </div>
          );
        })}
      </div>

    </section>
  );
}

export default CategoryGrid;