import React from "react";
import { Navigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import { hasOfflineSupport } from "../utils/platform";
import authStorage from "../services/authStorage";

export default function PrivateRoute({ children }) {
  const isOfflineMode = localStorage.getItem('forceOfflineMode') === 'true';

  // En mode offline sur iOS, pas besoin de token
  if (hasOfflineSupport() && isOfflineMode) {
    return children;
  }

  // Utiliser le service d'authentification
  if (!authStorage.hasValidToken()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
