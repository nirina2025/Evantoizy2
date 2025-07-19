import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

// Vérifier si toutes les variables d'environnement sont définies
const isConfigValid = firebaseConfig.apiKey && 
                     firebaseConfig.authDomain && 
                     firebaseConfig.projectId && 
                     firebaseConfig.storageBucket && 
                     firebaseConfig.messagingSenderId && 
                     firebaseConfig.appId;

let app;
let auth;
let db;
let analytics;

if (isConfigValid) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    // Analytics uniquement en production
    if (typeof window !== 'undefined') {
      analytics = getAnalytics(app);
    }
    console.log('Firebase initialisé avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de Firebase:', error);
    auth = null as any;
    db = null as any;
    analytics = null;
  }
} else {
  console.warn('Configuration Firebase incomplète. Veuillez vérifier vos variables d\'environnement.');
  auth = null as any;
  db = null as any;
  analytics = null;
}

export { auth, db, analytics };
export default app;