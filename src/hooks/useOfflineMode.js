import { useState, useEffect } from 'react';
import { hasOfflineSupport } from '../utils/platform';
import authStorage from '../services/authStorage';
import configService from '../services/configService';

export const useOfflineMode = () => {
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isServerReachable, setIsServerReachable] = useState(true);
  const [lastServerCheck, setLastServerCheck] = useState(null);

  // Fonction pour tester la connectivité au serveur
  const checkServerConnectivity = async () => {
    try {
      const serverUrl = configService.getServerUrl();
      const result = await configService.testConnection(serverUrl);
      const reachable = result.success;
      
      setIsServerReachable(reachable);
      setLastServerCheck(new Date());
      
      console.log('Server connectivity check:', {
        serverUrl,
        reachable,
        message: result.message
      });
      
      return reachable;
    } catch (error) {
      console.error('Error checking server connectivity:', error);
      setIsServerReachable(false);
      setLastServerCheck(new Date());
      return false;
    }
  };

  useEffect(() => {
    // Charger le mode offline depuis le localStorage
    const savedOfflineMode = localStorage.getItem('forceOfflineMode');
    if (savedOfflineMode === 'true' && hasOfflineSupport()) {
      setIsOfflineMode(true);
    }

    // Vérifier la connectivité du serveur au démarrage
    if (!isOfflineMode) {
      checkServerConnectivity();
    }

    // Vérifier périodiquement la connectivité du serveur (toutes les 30 secondes)
    const interval = setInterval(() => {
      if (!isOfflineMode) {
        checkServerConnectivity();
      }
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [isOfflineMode]);

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
    // Vérifier immédiatement la connectivité du serveur
    checkServerConnectivity();
    window.dispatchEvent(new CustomEvent('offline-mode-changed', { detail: false }));
  };

  // Mode offline forcé OU serveur inaccessible (mais permettre le changement de serveur)
  const shouldUseOfflineMode = isOfflineMode || !isServerReachable;

  return {
    isOfflineMode,
    isServerReachable,
    lastServerCheck,
    shouldUseOfflineMode,
    enableOfflineMode,
    disableOfflineMode,
    checkServerConnectivity,
    canGoOffline: hasOfflineSupport(),
    // Compatibilité avec l'ancien code qui utilise isOnline
    isOnline: isServerReachable
  };
};
