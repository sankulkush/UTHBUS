# UTHBUS

Online bus ticket booking web app built with Next.js 16, Firebase, and Tailwind CSS.

## 🚀 What is this
This project is a full-stack booking platform with:
- User and operator auth
- Firestore data storage
- Payment routing (eSewa/Khalti integration points)
- Next.js app router and API routes
- Vercel deployment

## 🧭 Quick start
```bash
# Clone
git clone <repo-url>
cd V0.dev

# Install dependencies
npm install

# Run locally
npm run dev
```

Open `http://localhost:3000`

Production: https://uthbus.vercel.app

## 🔧 Required environment variables
Create `.env.local` with:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Vercel env vars (production)
Set the same values in Vercel environment settings.

## 🧱 Build
```bash
npm run build
npm run start
```

## 🧪 Common fixes
- If build fails due to missing module `firebase-admin`, install it and add dependency.
- If API route needs admin auth env values, add `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY`.

## 🔁 Deploy to Vercel
```bash
vercel --prod
```

Then alias to custom domain:
```bash
vercel alias set <deployment-url> uthbus.vercel.app
```

## 🧾 Notes
- This project uses Next.js App Router.
- Keep private Firebase admin keys secure (Vercel secret env).

## ❤️ Maintainers
- Sankul Kamat