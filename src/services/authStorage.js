import { hasOfflineSupport } from '../utils/platform';

class AuthStorageService {
  constructor() {
    // Sur iOS, utiliser localStorage pour la persistance
    // Sur web, utiliser sessionStorage pour la sécurité
    this.storage = hasOfflineSupport() ? localStorage : sessionStorage;
    this.tokenKey = 'auth_token';
    this.userProfileKey = 'user_profile';
  }

  // Gestion du token
  setToken(token) {
    if (token) {
      this.storage.setItem(this.tokenKey, token);
    } else {
      this.removeToken();
    }
  }

  getToken() {
    return this.storage.getItem(this.tokenKey);
  }

  removeToken() {
    this.storage.removeItem(this.tokenKey);
    this.removeUserProfile();
  }

  hasValidToken() {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Vérifier si le token n'est pas expiré
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      
      if (isExpired) {
        this.removeToken();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Invalid token format:', error);
      this.removeToken();
      return false;
    }
  }

  // Gestion du profil utilisateur
  setUserProfile(profile) {
    if (profile) {
      this.storage.setItem(this.userProfileKey, JSON.stringify(profile));
    } else {
      this.removeUserProfile();
    }
  }

  getUserProfile() {
    try {
      const profile = this.storage.getItem(this.userProfileKey);
      return profile ? JSON.parse(profile) : null;
    } catch (error) {
      console.error('Error parsing user profile:', error);
      this.removeUserProfile();
      return null;
    }
  }

  removeUserProfile() {
    this.storage.removeItem(this.userProfileKey);
  }

  // Nettoyer toutes les données d'authentification
  clearAuth() {
    this.removeToken();
    this.removeUserProfile();
  }

  // Migrer depuis sessionStorage vers localStorage (pour iOS)
  migrateFromSessionStorage() {
    if (hasOfflineSupport() && sessionStorage.getItem(this.tokenKey)) {
      const token = sessionStorage.getItem(this.tokenKey);
      const profile = sessionStorage.getItem(this.userProfileKey);
      
      if (token) {
        this.setToken(token);
        sessionStorage.removeItem(this.tokenKey);
      }
      
      if (profile) {
        try {
          this.setUserProfile(JSON.parse(profile));
          sessionStorage.removeItem(this.userProfileKey);
        } catch (error) {
          console.error('Error migrating user profile:', error);
        }
      }
    }
  }
}

export default new AuthStorageService();
