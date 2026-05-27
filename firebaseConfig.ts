import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Only initialize when the API key is present.
// During build-time SSR on Vercel the NEXT_PUBLIC_* vars must be set in
// project settings — without them getAuth() throws auth/invalid-api-key at
// module evaluation, crashing the entire build.
const hasConfig = Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY)

const app: FirebaseApp = hasConfig
  ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0])
  : getApps()[0] ?? ({} as FirebaseApp)

export const auth: Auth = hasConfig ? getAuth(app) : ({} as Auth)
export const firestore: Firestore = hasConfig ? getFirestore(app) : ({} as Firestore)

export const googleProvider = new GoogleAuthProvider()
googleProvider.addScope("email")
googleProvider.addScope("profile")
googleProvider.setCustomParameters({ prompt: "select_account" })

export { app }
export const isPreviewEnvironment = process.env.NEXT_PUBLIC_ENV === "preview"
export const isFirebaseConfigured = hasConfig
