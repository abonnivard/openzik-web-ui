// Utility functions for the frontend

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";

// Generate file URL from file path
export const getFileUrl = (filePath) => {
  if (!filePath) return "";
  return `${API_BASE_URL}/${filePath.split(/[\\/]/).map(encodeURIComponent).join("/")}`;
};

// Get API base URL
export const getApiBaseUrl = () => API_BASE_URL;
