import {
  FaSearch,
  FaHeart,
  FaBell,
  FaFileAlt,
  FaHome,
  FaWifi,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";

import "./EmptyState.css";

const icons = {
  search: FaSearch,
  favorites: FaHeart,
  notifications: FaBell,
  requests: FaFileAlt,
  properties: FaHome,
  internet: FaWifi,
  error: FaExclamationTriangle,
  success: FaCheckCircle,
};

function EmptyState({
  type = "search",
  title,
  description,
  buttonText,
  onAction,
}) {
  const Icon = icons[type] || FaSearch;

  return (
    <div className="baytak-state">
      <div className={`baytak-state-icon ${type}`}>
        <Icon />
      </div>

      <h2 className="baytak-state-title">
        {title}
      </h2>

      <p className="baytak-state-description">
        {description}
      </p>

      {buttonText && onAction && (
        <button
          type="button"
          className="baytak-state-button"
          onClick={onAction}
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}

export default EmptyState;