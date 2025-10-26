import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/auth";

type PrivateRouteProps = {
  children: React.ReactNode;
  requiredRole?: string | string[]; // Can be a single role or an array of roles
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole }) => {
  const { user, isPending } = useAuth();

  if (isPending) {
    return <div>Loading...</div>; // Or a spinner
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    let userHasRequiredRole = false;
    if (user.role) { // Ensure user.role is not null
      userHasRequiredRole = Array.isArray(requiredRole)
        ? requiredRole.includes(user.role)
        : user.role === requiredRole;
    }

    if (!userHasRequiredRole) {
      return <Navigate to="/" replace />; // redirect if user doesn't have required role
    }
  }

  return <>{children}</>;
};

export default PrivateRoute;
