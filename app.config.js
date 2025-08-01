export default {
  name: 'JobbApp',
  slug: 'jobbapp',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/images/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.jobbapp',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'com.jobbapp',
  },
  web: {
    favicon: './assets/images/favicon.png',
  },
  plugins: ['expo-router'],
  scheme: 'jobbapp',
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: 'your-project-id',
    },
  },
  newArchEnabled: true,
}; 