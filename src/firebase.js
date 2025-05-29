// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"; // For future image uploads

import { enableNetwork, disableNetwork } from "firebase/firestore";
// Firebase configuration using environment variables
// Temporary fix - replace with your actual values
const firebaseConfig = {
    apiKey: "AIzaSyArdP66Q6faUUPJkkjRk5S5dsuXo0xQ2V8",
    authDomain: "farmer-marketplace-6a998.firebaseapp.com",
    projectId: "farmer-marketplace-6a998",
    storageBucket: "farmer-marketplace-6a998.firebasestorage.app",
    messagingSenderId: "518838142278",
    appId: "1:518838142278:web:213f441f3ec788cde3d147"
};


// Validate configuration
const validateConfig = () => {
    const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
    const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);

    if (missingKeys.length > 0) {
        console.error('Missing Firebase configuration keys:', missingKeys);
        throw new Error('Firebase configuration is incomplete');
    }
};

// Validate before initializing
validateConfig();

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app); // For product images

// Optional: Enable offline persistence

// Helper functions
export const enableOffline = () => disableNetwork(db);
export const enableOnline = () => enableNetwork(db);

// Export services
export { db, auth, storage };
export default app;
