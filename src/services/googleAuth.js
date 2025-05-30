import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';

// Sign in with Google using popup
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Check if user profile exists in Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));

        if (!userDoc.exists()) {
            // Do not create user profile here to allow role selection modal
            // User profile will be created after role selection
            // await setDoc(doc(db, 'users', user.uid), {
            //     uid: user.uid,
            //     email: user.email,
            //     fullName: user.displayName || '',
            //     role: 'customer', // Default role for Google sign-ins
            //     phone: user.phoneNumber || '',
            //     location: '',
            //     profilePicture: user.photoURL || '',
            //     provider: 'google',
            //     createdAt: new Date(),
            //     updatedAt: new Date()
            // });
        }

        return {
            success: true,
            user: user,
            isNewUser: !userDoc.exists()
        };
    } catch (error) {
        console.error('Google sign-in error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Sign in with Google using redirect (for mobile)
export const signInWithGoogleRedirect = async () => {
    try {
        await signInWithRedirect(auth, googleProvider);
    } catch (error) {
        console.error('Google redirect sign-in error:', error);
        throw error;
    }
};

// Handle redirect result
export const handleGoogleRedirectResult = async () => {
    try {
        const result = await getRedirectResult(auth);
        if (result) {
            const user = result.user;

            // Check if user profile exists
            const userDoc = await getDoc(doc(db, 'users', user.uid));

            if (!userDoc.exists()) {
                // Do not create user profile here to allow role selection modal
                // User profile will be created after role selection
                // await setDoc(doc(db, 'users', user.uid), {
                //     uid: user.uid,
                //     email: user.email,
                //     fullName: user.displayName || '',
                //     role: 'customer',
                //     phone: user.phoneNumber || '',
                //     location: '',
                //     profilePicture: user.photoURL || '',
                //     provider: 'google',
                //     createdAt: new Date(),
                //     updatedAt: new Date()
                // });
            }

            return {
                success: true,
                user: user,
                isNewUser: !userDoc.exists()
            };
        }
        return { success: false };
    } catch (error) {
        console.error('Google redirect result error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};
