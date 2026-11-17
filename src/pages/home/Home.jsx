
import "../../styles/Home.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../../components/home/Header";
import SearchBar from "../../components/home/SearchBar";
import FilterChips from "../../components/home/FilterChips";
import FeaturedCard from "../../components/home/FeaturedCard";
import CategoryGrid from "../../components/home/CategoryGrid";
import RecommendationList from "../../components/home/RecommendationList";
import BottomNavigation from "../../components/home/BottomNavigation";
import SearchResults from "../../components/home/SearchResults";
import { useProperties } from "../../context/PropertyContext";

function Home() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [activeFilter, setActiveFilter] = useState("sale");
  const [activeCategory, setActiveCategory] = useState(null);

  // حالات البحث
  const [isLoading] = useState(false);
  const [searchError] = useState(null);
  const clearSearch = () => {
  setSearchTerm("");
  setSearchResults([]);
  setActiveCategory(null);
  setActiveFilter("sale");
};

  const { properties = [] } = useProperties() || {};

  return (
    <div className="home-page">
      <Header />

      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeFilter={activeFilter}
        activeCategory={activeCategory}
        properties={properties}
        setSearchResults={setSearchResults}
      />

      <SearchResults
  searchTerm={searchTerm}
  properties={properties}
  searchResults={searchResults}
  isLoading={isLoading}
  error={searchError}
  onClearSearch={clearSearch}
/>

      <FilterChips
        activeFilter={activeFilter}
        setActiveFilter={(filter) => {
          setActiveFilter(filter);
          setSearchResults([]);
        }}
      />

      <CategoryGrid
        activeCategory={activeCategory}
        onCategoryChange={(cat) => {
          setActiveCategory(activeCategory === cat ? null : cat);
          setSearchResults([]);
        }}
        onClearCategory={() => {
          setActiveCategory(null);
          setSearchResults([]);
        }}
      />

      <div
        className="section-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "18px",
        }}
      >
        <h2>عقار مميز</h2>

        <button
          className="see-all-btn"
          onClick={() => navigate("/my-properties")}
        >
          عرض الكل
        </button>
      </div>

      <FeaturedCard
        properties={properties}
        activeFilter={activeFilter}
        activeCategory={activeCategory}
      />

      <RecommendationList
        searchTerm={searchTerm}
        activeFilter={activeFilter}
        activeCategory={activeCategory}
        properties={properties}
      />

      <BottomNavigation />
    </div>
  );
}

export default Home;
