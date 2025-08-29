import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.openzik.app',
  appName: 'OpenZik',
  webDir: 'build',
  server: {
    // Pour développement iOS - utilisez l'IP de votre Mac
    // En production, cette section sera ignorée
    hostname: 'localhost',
    // Permet à l'app iOS de faire des requêtes vers le backend local
    androidScheme: 'https',
    iosScheme: 'capacitor'
  },
  ios: {
    scheme: 'OpenZik'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#121212',
      showSpinner: false
    }
  }
};

export default config;
