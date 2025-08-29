import { useState, useEffect } from 'react';
import { hasOfflineSupport } from '../utils/platform';
import authStorage from '../services/authStorage';

export const useOfflineMode = () => {
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Charger le mode offline depuis le localStorage
    const savedOfflineMode = localStorage.getItem('forceOfflineMode');
    if (savedOfflineMode === 'true' && hasOfflineSupport()) {
      setIsOfflineMode(true);
    }

    // Écouter les changements de statut réseau
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const enableOfflineMode = () => {
    if (hasOfflineSupport()) {
      setIsOfflineMode(true);
      localStorage.setItem('forceOfflineMode', 'true');
      // Supprimer les données d'authentification pour éviter les tentatives de reconnexion
      authStorage.clearAuth();
      // Déclencher un événement pour mettre à jour l'app
      window.dispatchEvent(new CustomEvent('offline-mode-changed', { detail: true }));
    }
  };

  const disableOfflineMode = () => {
    setIsOfflineMode(false);
    localStorage.removeItem('forceOfflineMode');
    window.dispatchEvent(new CustomEvent('offline-mode-changed', { detail: false }));
  };

  // Mode offline forcé OU pas de connexion réseau
  const shouldUseOfflineMode = isOfflineMode || !isOnline;

  return {
    isOfflineMode,
    isOnline,
    shouldUseOfflineMode,
    enableOfflineMode,
    disableOfflineMode,
    canGoOffline: hasOfflineSupport()
  };
};
