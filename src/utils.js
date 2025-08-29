// Utility functions for the frontend
import configService from './services/configService';

// Generate file URL from file path
export const getFileUrl = (filePath) => {
  if (!filePath) return "";
  return `${configService.getServerUrl()}/${filePath.split(/[\\/]/).map(encodeURIComponent).join("/")}`;
};

// Get API base URL
export const getApiBaseUrl = () => configService.getServerUrl();

// Format duration from seconds to MM:SS format
export const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return "0:00";
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
