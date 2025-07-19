# RechargeHub - Gestion des codes de recharge

Application de gestion des codes d'abonnement pour plateformes créatives (Envato, Freepik, Motionarray).

## Configuration Firebase

Pour utiliser cette application, vous devez configurer Firebase :

### 1. Créer un projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquez sur "Ajouter un projet"
3. Suivez les étapes de création

### 2. Configurer Authentication

1. Dans votre projet Firebase, allez dans "Authentication"
2. Cliquez sur "Commencer"
3. Dans l'onglet "Sign-in method", activez "E-mail/Mot de passe"

### 3. Configurer Firestore

1. Allez dans "Firestore Database"
2. Cliquez sur "Créer une base de données"
3. Choisissez "Commencer en mode test" pour le développement
4. Sélectionnez une région proche de vous

### 4. Obtenir la configuration

1. Allez dans "Paramètres du projet" (icône engrenage)
2. Dans l'onglet "Général", descendez jusqu'à "Vos applications"
3. Cliquez sur "Ajouter une application" et choisissez "Web"
4. Donnez un nom à votre application
5. Copiez la configuration qui s'affiche

### 5. Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet et ajoutez vos variables Firebase :

```env
VITE_FIREBASE_API_KEY=votre_api_key
VITE_FIREBASE_AUTH_DOMAIN=votre_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=votre_project_id
VITE_FIREBASE_STORAGE_BUCKET=votre_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
VITE_FIREBASE_APP_ID=votre_app_id
```

### 6. Règles de sécurité Firestore

Ajoutez ces règles dans Firestore pour sécuriser votre base de données :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Règles pour les utilisateurs
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Règles pour les codes de recharge
    match /rechargeCodes/{codeId} {
      allow read, write: if request.auth != null;
    }
    
    // Règles pour les transactions
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Installation et démarrage

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

## Fonctionnalités

- **Authentification** : Connexion et inscription avec email/mot de passe
- **Gestion des codes** : Ajout, modification, suppression des codes d'abonnement
- **Import en lot** : Import de codes via fichier CSV
- **Ventes** : Marquer les codes comme vendus et enregistrer les transactions
- **Historique** : Consultation de l'historique des ventes
- **Tableau de bord** : Statistiques et graphiques des ventes
- **Rôles** : Administrateur et vendeur avec permissions différentes

## Structure des données

### Codes de recharge
- Code d'abonnement
- Durée (1 mois / 3 mois)
- Plateforme (Envato, Freepik, Motionarray)
- Valeur, prix d'achat, prix de vente
- Statut (disponible, vendu, expiré)

### Transactions
- Informations du code vendu
- Client, vendeur, date de vente
- Calcul automatique des bénéfices