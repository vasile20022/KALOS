
/**
 * Configurazione di Capacitor
 * 
 * Questo file definisce le impostazioni per compilare l'applicazione web
 * come un'app nativa utilizzando Capacitor. Include configurazioni per
 * iOS e Android e altre impostazioni del server.
 */

import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.kalos.mobile',
  appName: 'KALOS',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  ios: {
    contentInset: 'always',
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
