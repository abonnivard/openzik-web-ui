import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Hook pour gérer l'expiration automatique des tokens
export const useTokenExpiration = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Écouter les événements personnalisés d'expiration de token
    const handleTokenExpiration = () => {
      // Nettoyer toutes les données de session
      sessionStorage.removeItem("token");

      
      // Rediriger vers la page de connexion
      navigate('/login', { replace: true });
    };

    // Écouter l'événement personnalisé
    window.addEventListener('token-expired', handleTokenExpiration);

    // Nettoyer l'event listener
    return () => {
      window.removeEventListener('token-expired', handleTokenExpiration);
    };
  }, [navigate]);
};

// Fonction utilitaire pour déclencher l'expiration du token
export const triggerTokenExpiration = () => {
  window.dispatchEvent(new CustomEvent('token-expired'));
};
