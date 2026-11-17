import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext.jsx";

import {
  FaHome,
  FaSearch,
  FaHeart,
  FaUser,
} from "react-icons/fa";

function BottomNavigation() {
  const { t } = useLanguage();

  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchClick = () => {
    const searchInput = document.querySelector(
      ".search-box input"
    );

    if (searchInput) {
      searchInput.focus();

      searchInput.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      return;
    }

    // لو البحث مش موجود في الصفحة الحالية
    navigate("/home");
  };

  return (
    <nav className="bottom-nav">
      {/* Home */}
      <button
        type="button"
        className={`nav-item ${
          location.pathname === "/home" ? "active" : ""
        }`}
        onClick={() => navigate("/home")}
      >
        <FaHome />
        <span>{t.home}</span>
      </button>

      {/* Search */}
      <button
        type="button"
        className={`nav-item ${
          location.pathname === "/home" ? "" : ""
        }`}
        onClick={handleSearchClick}
      >
        <FaSearch />
        <span>{t.search}</span>
      </button>

      {/* Favorites */}
      <button
        type="button"
        className={`nav-item ${
          location.pathname === "/favorites" ? "active" : ""
        }`}
        onClick={() => navigate("/favorites")}
      >
        <FaHeart />
        <span>{t.favorites}</span>
      </button>

      {/* Profile */}
      <button
        type="button"
        className={`nav-item ${
          location.pathname === "/profile" ? "active" : ""
        }`}
        onClick={() => navigate("/profile")}
      >
        <FaUser />
        <span>{t.profile}</span>
      </button>
    </nav>
  );
}

export default BottomNavigation;