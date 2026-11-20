import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useSeo } from "../utils/useSeo.js";

const ROLE_MAP = {
  owner: "مالك",
  tenant: "مستأجر",
};

function ProtectedRoute({ children, allowedRoles }) {
  const { loading, user, profile } = useAuth();

  // الصفحات الخاصة (بعد تسجيل الدخول) لا تُفهرس في جوجل
  useSeo({ noindex: true });

  // ننتظر Firebase يرجّع حالة الجلسة قبل أي قرار
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          color: "#666",
        }}
      >
        ...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles?.length) {
    const allowedAccountTypes = allowedRoles.map(
      (role) => ROLE_MAP[role] || role
    );

    if (!allowedAccountTypes.includes(profile?.accountType)) {
      return <Navigate to="/home" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
