import React from "react";
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

/**
 * ProtectedRoute
 * - children: element to render when allowed
 * - roles: array of allowed roles (optional)
 * If not authenticated -> redirect to login (default role patient)
 * If authenticated but role not allowed -> redirect to their dashboard
 */
const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, token } = useContext(AuthContext);

  // Not logged in
  if (!token || !user) {
    return <Navigate to="/login?role=patient" replace />;
  }

  // If roles are provided, check that user's role is allowed
  if (roles.length > 0 && !roles.includes(user.role)) {
    // Redirect to the correct dashboard for logged-in user
    return <Navigate to={`/${user.role}`} replace />;
  }

  // authorized
  return children;
};

export default ProtectedRoute;
