import "./LoadingState.css";

function LoadingState({
  title = "جاري التحميل...",
  description = "من فضلك انتظر قليلًا",
}) {
  return (
    <div className="baytak-loading">
      <div className="baytak-spinner"></div>

      <h2 className="baytak-loading-title">
        {title}
      </h2>

      <p className="baytak-loading-description">
        {description}
      </p>
    </div>
  );
}

export default LoadingState;