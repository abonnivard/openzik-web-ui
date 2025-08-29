class ConfigService {
  constructor() {
    this.storageKey = 'music_app_server_config';
    this.defaultConfig = {
      serverUrl: null,
      configured: false
    };
  }

  // Récupérer la configuration actuelle
  getConfig() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error reading config:', error);
    }
    return this.defaultConfig;
  }

  // Sauvegarder la configuration
  setConfig(config) {
    try {
      const newConfig = { ...this.getConfig(), ...config };
      localStorage.setItem(this.storageKey, JSON.stringify(newConfig));
      return newConfig;
    } catch (error) {
      console.error('Error saving config:', error);
      throw error;
    }
  }

  // Vérifier si l'app est configurée
  isConfigured() {
    const config = this.getConfig();
    return config.configured && config.serverUrl;
  }

  // Obtenir l'URL du serveur (avec fallback sur env)
  getServerUrl() {
    const config = this.getConfig();
    if (config.serverUrl) {
      return config.serverUrl;
    }
    // Fallback sur la variable d'environnement
    return process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";
  }

  // Définir l'URL du serveur
  setServerUrl(url) {
    // Nettoyer l'URL (enlever le trailing slash)
    const cleanUrl = url.replace(/\/$/, '');
    return this.setConfig({
      serverUrl: cleanUrl,
      configured: true
    });
  }

  // Tester la connexion au serveur
  async testConnection(url) {
    try {
      const cleanUrl = url.replace(/\/$/, '');
      
      // Créer une promesse avec timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      );
      
      const fetchPromise = fetch(`${cleanUrl}/health`, {
        method: 'GET'
      });
      
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      if (response.ok) {
        return { success: true, message: 'Connection successful' };
      } else {
        return { success: false, message: `Server responded with ${response.status}` };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Connection failed' 
      };
    }
  }

  // Reset de la configuration
  resetConfig() {
    localStorage.removeItem(this.storageKey);
  }
}

export default new ConfigService();
