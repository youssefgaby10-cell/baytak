import { Link } from "react-router-dom";
import { useSeo } from "../../utils/useSeo.js";

function NotFound() {
  useSeo({
    title: "الصفحة غير موجودة | Baytak",
    description: "الصفحة التي تبحث عنها غير موجودة.",
    noindex: true,
  });

  return (
    <div
      dir="rtl"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        fontFamily: "Cairo, sans-serif",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <h1 style={{ fontSize: "56px", margin: 0, color: "#2563eb" }}>404</h1>
      <p style={{ color: "#666", margin: 0 }}>الصفحة التي تبحث عنها غير موجودة.</p>
      <Link
        to="/"
        style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none" }}
      >
        العودة للرئيسية
      </Link>
    </div>
  );
}

export default NotFound;
