import React from "react";
import { Navigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";

export default function PrivateRoute({ children }) {
  const token = sessionStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);

    // exp est en secondes depuis epoch
    if (decoded.exp * 1000 < Date.now()) {
      // Token expiré → supprimer et rediriger
      sessionStorage.removeItem("token");
      return <Navigate to="/login" replace />;
    }
  } catch (err) {
    // Token invalide
    sessionStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }

  return children;
}
