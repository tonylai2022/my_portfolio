/**
 * Firebase Configuration
 * ─────────────────────────────────────────────────────────────────
 * Setup steps:
 *
 * 1. Go to https://console.firebase.google.com/
 * 2. Create a new project → give it a name
 * 3. Project Settings (⚙) → General → Your apps → Add app (</> Web)
 * 4. Copy the config object and paste the values below
 *
 * 5. Enable these services in your Firebase console:
 *    ▸ Authentication   → Sign-in method → Email/Password → Enable
 *    ▸ Firestore        → Create database → Start in production mode
 *    ▸ Storage          → Get started → Start in production mode
 *
 * 6. Firestore Rules (Firestore → Rules tab):
 *    ─────────────────────────────────────────
 *    rules_version = '2';
 *    service cloud.firestore {
 *      match /databases/{database}/documents {
 *        match /portfolio/main {
 *          allow read:  if true;
 *          allow write: if request.auth != null
 *                       && request.auth.token.email == 'tonytennisworld@gmail.com';
 *        }
 *      }
 *    }
 *
 * 7. Storage Rules (Storage → Rules tab):
 *    ─────────────────────────────────────────
 *    rules_version = '2';
 *    service firebase.storage {
 *      match /b/{bucket}/o {
 *        match /assets/{allPaths=**} {
 *          allow read:  if true;
 *          allow write: if request.auth != null
 *                       && request.auth.token.email == 'tonytennisworld@gmail.com'
 *                       && request.resource.size < 100 * 1024 * 1024;
 *        }
 *      }
 *    }
 *
 * 8. Authentication → Users → Add user. Create the account for
 *    tonytennisworld@gmail.com and choose its login password.
 *
 * SECURITY NOTE: Firebase API keys are safe to expose in client-side JS.
 * Access is controlled entirely by Firestore and Storage security rules.
 * ─────────────────────────────────────────────────────────────────
 */

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDZIcZDS344jTjPckOcCnjbjSSIEjvXJaU",
    authDomain: "tonyportfolio-73c80.firebaseapp.com",
    projectId: "tonyportfolio-73c80",
    storageBucket: "tonyportfolio-73c80.firebasestorage.app",
    messagingSenderId: "436493341070",
    appId: "1:436493341070:web:a8214aca19e7c2cc3214df"
};

// The only email address permitted to access the portfolio admin panel.
const ADMIN_EMAIL = 'tonytennisworld@gmail.com';

function isFirebaseConfigured() {
    return Boolean(FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId);
}

if (isFirebaseConfigured()) {
    try {
        if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    } catch (e) {
        console.error('Firebase init failed:', e);
    }
}
