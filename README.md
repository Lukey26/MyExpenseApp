# Expense Tracker App

A modern, full‑stack **Expense Tracking** application built with **Next.js 16**, **Firebase**, **Tailwind v4**, and **Vercel**.  
Users can securely authenticate with Google, track income & expenses, set monthly budgets, and access their data across devices.

***

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-blue?style=for-the-badge)](https://my-expense-app-yxke.vercel.app)

## Features

### Core Features

*   Google Authentication (Firebase Auth)
*   Add, Edit, and Delete Transactions
*   Income & Expense Tracking
*   Monthly Filtering
*   Category Selection
*   Local storage fallback for signed‑out users

### Budgeting System

*   Per‑month category budgets
*   Progress bars showing spending vs limit
*   Over‑budget warnings
*   Editable monthly budget panel


### Cloud Features

*   Firestore for per‑user transactions
*   Secure Firestore rules (per‑user access)
*   Server‑timestamped metadata
*   Automatic index creation via Firestore links

### Developer Experience

*   Next.js App Router
*   TypeScript
*   Tailwind v4
*   Fully typed Firestore helpers
*   Clean, modern UI

***

## 🏗️ Tech Stack

| Layer    | Technology                                |
| -------- | ----------------------------------------- |
| Frontend | Next.js 16 (App Router), React 19         |
| Styling  | Tailwind CSS v4                           |
| Auth     | Firebase Authentication (Google provider) |
| Database | Firestore                                 |
| Deploy   | Vercel                                    |
| Language | TypeScript                                |

***

# Installation & Setup

## 1️⃣ Clone the repository

git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>/expense-app
```

***

## 2️⃣ Install dependencies

```bash
npm install
```

***

## 3️⃣ Create your Firebase project

Go to **Firebase Console**:  
<https://console.firebase.google.com>

Enable these services:

### ✓ Authentication

*   Go to **Authentication → Sign‑in method**
*   Enable **Google**

### ✓ Firestore

*   Go to **Firestore Database**
*   Click **Create database**
*   Use **Production mode**

***

## 4️⃣ Add your environment variables

Create a file named:

    .env.local

Paste your Firebase web config (Project Settings → Web App):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
```

**Never commit this file.**

***

## 5️⃣ Firestore Security Rules

Paste this into **Firestore → Rules → Publish**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function signedIn() {
      return request.auth != null;
    }

    // TRANSACTIONS
    match /transactions/{id} {

      allow read: if signedIn()
        && request.auth.uid == resource.data.userId;

      allow create: if signedIn()
        && request.auth.uid == request.resource.data.userId
        && request.resource.data.amount is number
        && request.resource.data.amount > 0
        && request.resource.data.type in ['income', 'expense']
        && request.resource.data.date is string
        && request.resource.data.month is string;

      allow update: if signedIn()
        && request.auth.uid == resource.data.userId
        && request.resource.data.userId == resource.data.userId
        && request.resource.data.amount is number
        && request.resource.data.amount > 0
        && request.resource.data.type in ['income', 'expense']
        && request.resource.data.date is string
        && request.resource.data.month is string;

      allow delete: if signedIn()
        && request.auth.uid == resource.data.userId;
    }

    // BUDGETS
    match /budgets/{uid}/months/{month} {
      allow read, write: if signedIn()
        && request.auth.uid == uid;
    }
  }
}
```

***

## 6️⃣ Run the app locally

```bash
npm run dev
```

Visit:

    http://localhost:3000

***

# 🚀 Deploying to Vercel

## 1) Push your code to GitHub

```bash
git add .
git commit -m "initial deploy"
git push
```

***

## 2) Import the repo into Vercel

1.  Go to <https://vercel.com>
2.  Click **New Project**
3.  Import your repo
4.  Set **Root Directory** → `expense-app/`
5.  Add **Environment Variables** (same as `.env.local`)
6.  Click **Deploy**

***

## 3) Fix Google Auth for production

Go to:  
**Firebase Console → Authentication → Settings → Authorized Domains**

Add your Vercel domain:

    your-app.vercel.app

Now Google sign‑in works in production.

***

# 🧩 Project Structure

    expense-app/
    │
    ├── app/
    │   ├── page.tsx          # Main page
    │   ├── layout.tsx        # Root layout + theme loader
    │   └── globals.css       # Tailwind v4 + theme CSS variables
    │
    ├── components/
    │   ├── AuthBar.tsx
    │   ├── TransactionForm.tsx
    │   ├── TransactionList.tsx
    │   ├── BudgetPanel.tsx
    │   ├── BudgetEditor.tsx
    │   ├── Filters.tsx
    │   ├── Summary.tsx
    │   └── Modal.tsx
    │
    ├── lib/
    │   ├── firebase.ts       # Firebase init
    │   ├── fx.ts             # Firestore CRUD for transactions
    │   ├── budgets.ts        # Firestore CRUD for budgets
    │   ├── types.ts          # TypeScript models
    │   ├── storage.ts        # Local storage fallback
    │   └── format.ts         # Format helpers
    │
    ├── public/
    ├── package.json
    └── tailwind/postcss config files

***

# 📘 How Data Works

### Transactions

*   Saved under `transactions/{id}`
*   Contains:
    ```ts
    { id, userId, amount, category, type, date, month, createdAt }
    ```

### Budgets

*   Saved under `budgets/{uid}/months/{yyyy-mm}`
*   Contains:
    ```ts
    { categories: { Food: 200, Bills: 400 }, updatedAt }
    ```

### Security

*   Every user only sees their own data
*   Firestore rules enforce ownership
*   Queries require indexing — Firebase auto‑links index creation

***

# 🎨 Theming System

Themes use CSS variables + Tailwind arbitrary colors:


# 📈 Future Improvements (Roadmap)

*   Category breakdown charts
*   Export CSV
*   Mobile PWA support
*   Recurring transactions
*   Bulk import
*   Shared budgets (family mode)

***

# 🤝 Contributing

1.  Fork the repo
2.  Create a branch
3.  Commit changes
4.  Submit a PR

Issues and suggestions are welcome.

***

# 📄 License

MIT License © 2026

***
