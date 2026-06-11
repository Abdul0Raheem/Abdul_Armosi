/// <reference types="@capacitor-firebase/authentication" />

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.armosi.app',
  appName: 'Armosi',
  webDir: 'out',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    FirebaseAuthentication: {
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      skipNativeAuth: true,
      providers: ['google.com'],
    },
  },
};

export default config;
