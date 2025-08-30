import { hasOfflineSupport } from '../utils/platform';

class AuthStorageService {
  constructor() {
    // Sur iOS, utiliser localStorage pour la persistance
    // Sur web, utiliser sessionStorage pour la sécurité
    this.storage = hasOfflineSupport() ? localStorage : sessionStorage;
    this.tokenKey = 'auth_token';
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

  
  // Migrer depuis sessionStorage vers localStorage (pour iOS)
  migrateFromSessionStorage() {
    if (hasOfflineSupport() && sessionStorage.getItem(this.tokenKey)) {
      const token = sessionStorage.getItem(this.tokenKey);
      
      if (token) {
        this.setToken(token);
        sessionStorage.removeItem(this.tokenKey);
      }
      
      
    }
  }
}

export default new AuthStorageService();
