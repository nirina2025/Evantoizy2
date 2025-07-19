import { useState, useEffect } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth || !db) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: userData.name || '',
              role: userData.role || 'vendor',
              createdAt: userData.createdAt?.toDate() || new Date()
            });
          } else {
            // Si le document utilisateur n'existe pas, le créer
            const newUserData = {
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Utilisateur',
              email: firebaseUser.email || '',
              role: 'vendor',
              createdAt: new Date()
            };
            
            await setDoc(doc(db, 'users', firebaseUser.uid), newUserData);
            
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: newUserData.name,
              role: newUserData.role,
              createdAt: newUserData.createdAt
            });
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des données utilisateur:', error);
          // En cas d'erreur, créer un utilisateur basique
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Utilisateur',
            role: 'vendor',
            createdAt: new Date()
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
};