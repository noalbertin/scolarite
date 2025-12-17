# Application de Gestion de Documents Administratifs - Scolarité

Application web full-stack pour la gestion des demandes de documents administratifs universitaires.

## 🚀 Technologies

**Frontend:**
- React 18+ avec Next.js 15
- TypeScript
- Tailwind CSS v4
- shadcn/ui Components

**Backend:**
- Node.js avec Express
- MySQL (via XAMPP)
- JWT pour l'authentification
- bcrypt pour le hashage des mots de passe

## 📋 Prérequis

- Node.js 18+ installé
- XAMPP avec MySQL
- npm ou yarn

## ⚙️ Installation

### 1. Configuration de la base de données

1. Démarrez XAMPP et lancez MySQL
2. Ouvrez phpMyAdmin (http://localhost/phpmyadmin)
3. Exécutez les scripts SQL dans l'ordre:
   - `scripts/01-create-database.sql`
   - `scripts/02-create-tables.sql`
   - `scripts/03-seed-data.sql`

### 2. Configuration du Backend

```bash
cd server
npm install
```

Créez un fichier `.env` dans le dossier `server`:

```env
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=scolarite
JWT_SECRET=votre_secret_jwt_changez_moi
```

Démarrez le serveur backend:

```bash
npm start
# ou pour le mode développement avec auto-reload
npm run dev
```

### 3. Configuration du Frontend

Dans le dossier racine du projet, ajoutez dans vos variables d'environnement:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Le frontend Next.js se lance automatiquement avec v0.

## 🎯 Fonctionnalités

### Pour les Étudiants:
- ✅ Inscription libre (aucune approbation nécessaire)
- ✅ Connexion sécurisée
- ✅ Demande de documents multiples en une seule fois
- ✅ Suivi en temps réel des demandes
- ✅ Notifications automatiques
- ✅ Calcul automatique du montant total

### Pour le Personnel:
- ✅ Connexion sécurisée
- ✅ Vue d'ensemble des demandes
- ✅ Validation/Rejet des demandes
- ✅ Gestion du statut des documents
- ✅ Système de notifications aux étudiants

### Documents disponibles:
- 📄 Relevé de notes (2 000 Ar) - par niveau/année
- 📄 Certificat de scolarité (2 000 Ar) - avec noms des parents
- 📄 Attestation de réussite (3 000 Ar) - L3 et M2 uniquement
- 📄 Attestations diverses (3 000 Ar) - inscription, fin d'études, français, etc.

## 🔐 Sécurité

- Mots de passe hashés avec bcrypt
- Authentification JWT
- Protection des routes API
- Validation des données côté serveur
- SQL préparé pour éviter les injections

## 📱 Design

Interface moderne et professionnelle avec:
- Palette de couleurs bleue inspirée du milieu universitaire
- Design responsive (mobile, tablette, desktop)
- Composants UI cohérents avec shadcn/ui
- Navigation intuitive
- Feedback visuel clair (badges de statut, notifications)

## 🔄 Workflow

1. **Étudiant** crée une demande avec un ou plusieurs documents
2. **Personnel** reçoit la demande (statut: EN_ATTENTE)
3. **Personnel** valide ou rejette la demande
4. Si validée → **Personnel** prépare le document (statut: PRET)
5. **Étudiant** reçoit une notification
6. **Étudiant** se présente au bureau avec le montant
7. **Personnel** enregistre le retrait (statut: RETIRE)

## 👥 Compte de test

**Personnel (Admin):**
- Email: admin@scolarite.mg
- Mot de passe: admin123

Note: Vous devrez générer le hash bcrypt correct pour ce mot de passe dans le script SQL.

## 📞 Support

Pour toute question ou problème, contactez l'équipe de développement.

## 📄 Licence

Projet développé pour la gestion administrative universitaire.
