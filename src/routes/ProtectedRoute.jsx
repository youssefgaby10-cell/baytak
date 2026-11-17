import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
  const isLoggedIn =
    localStorage.getItem("baytakLoggedIn") === "true";

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles?.length) {
    let user;

    try {
      user = JSON.parse(
        localStorage.getItem("baytakUser") || "null"
      );
    } catch {
      user = null;
    }

    if (!user) {
      return <Navigate to="/login" replace />;
    }

    const roleMap = {
      owner: "مالك",
      tenant: "مستأجر",
    };

    const allowedAccountTypes = allowedRoles.map(
      (role) => roleMap[role] || role
    );

    if (!allowedAccountTypes.includes(user.accountType)) {
      return <Navigate to="/home" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;