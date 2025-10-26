
import { initializeApp } from "firebase/app";
import { getRemoteConfig } from "firebase/remote-config";

const firebaseConfig = {
  apiKey: "AIzaSyB_LpqFQJO-tR0IC40Gi6TN9wxfs9sTuwk",
  authDomain: "takoyadon-system.firebaseapp.com",
  projectId: "takoyadon-system",
  storageBucket: "takoyadon-system.firebasestorage.app",
  messagingSenderId: "10414790620",
  appId: "1:10414790620:web:23956e64b938d24a8d6119"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Remote Config
const remoteConfig = getRemoteConfig(app);

// Set default values
remoteConfig.defaultConfig = {
  "referral_feature_enabled": false,
};

export { remoteConfig, app };
