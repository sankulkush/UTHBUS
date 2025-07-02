import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"

// Check if we're in a preview/demo environment
const isPreviewEnvironment =
  typeof window !== "undefined" &&
  (window.location.hostname.includes("v0.dev") ||
    window.location.hostname.includes("vercel.app") ||
    window.location.hostname.includes("localhost") ||
    !process.env.NEXT_PUBLIC_FIREBASE_API_KEY)

// Demo Firebase config that works in preview
const demoConfig = {
  apiKey: "demo-api-key-12345",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project-12345",
  storageBucket: "demo-project-12345.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:demo12345",
}

// Real Firebase config from environment variables
const realConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Use demo config in preview, real config in production
export const firebaseConfig = isPreviewEnvironment ? demoConfig : realConfig

// Initialize Firebase
let app: FirebaseApp
let auth: Auth
let firestore: Firestore
let googleProvider: GoogleAuthProvider

try {
  // Check if Firebase is already initialized
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  
  // Initialize services
  auth = getAuth(app)
  firestore = getFirestore(app)
  googleProvider = new GoogleAuthProvider()

  // Configure Google provider
  googleProvider.addScope("email")
  googleProvider.addScope("profile")
  googleProvider.setCustomParameters({
    prompt: "select_account",
  })

  console.log("✅ Firebase initialized successfully")
  console.log("🔧 Using config:", isPreviewEnvironment ? "demo" : "production")
  
} catch (error) {
  console.error("❌ Firebase initialization failed:", error)
  
  // In preview environment, create mock services
  if (isPreviewEnvironment) {
    console.warn("🚧 Running in preview mode with mock Firebase services")
    // These will be undefined but won't crash the app
  } else {
    throw new Error("Failed to initialize Firebase. Please check your configuration.")
  }
}

// Helper function to check if Firebase is properly configured
export const isFirebaseConfigured = () => {
  if (isPreviewEnvironment) return false // Demo mode
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    auth &&
    firestore
  )
}

export { app, auth, firestore, googleProvider, isPreviewEnvironment }