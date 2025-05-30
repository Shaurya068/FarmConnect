import { initializeApp } from "firebase/app";
import { getFirestore, enableNetwork, disableNetwork } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {

    apiKey: "AIzaSyArdP66Q6faUUPJkkjRk5S5dsuXo0xQ2V8",
    authDomain: "farmer-marketplace-6a998.firebaseapp.com",
    projectId: "farmer-marketplace-6a998",
    storageBucket: "farmer-marketplace-6a998.firebasestorage.app",
    messagingSenderId: "518838142278",
    appId: "1:518838142278:web:213f441f3ec788cde3d147"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);

// Google Auth Provider with custom parameters
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');
// Force account selection every time
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

// Helper functions
export const enableOffline = () => disableNetwork(db);
export const enableOnline = () => enableNetwork(db);

// Export services
export { db, auth, googleProvider };
export default app;

