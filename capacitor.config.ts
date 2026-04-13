import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'dev.lastminprep.app',
  appName: 'LastMinPrep',
  webDir: 'dist/lastminprep/browser',
  server: {
    androidScheme: 'https',
    allowNavigation: ['lastminprep.dev'],
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#5b4ff5',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DEFAULT',
      backgroundColor: '#5b4ff5',
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
  },
  android: {
    buildOptions: {
      keystorePath: 'lastminprep.keystore',
      keystoreAlias: 'lastminprep',
    },
  },
};

export default config;
