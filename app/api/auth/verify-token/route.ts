// app/api/auth/verify-token/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { auth } from 'firebase-admin'
import { initializeApp, getApps, cert } from 'firebase-admin/app'

// Initialize Firebase Admin if not already initialized
const hasServiceAccount = Boolean(
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY
)

if (hasServiceAccount && !getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n')
    })
  })
}

export async function GET(request: NextRequest) {
  try {
    if (!hasServiceAccount) {
      return NextResponse.json(
        {
          error: 'Firebase service account is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.'
        },
        { status: 500 }
      )
    }

    if (!getApps().length) {
      return NextResponse.json({ error: 'Firebase Admin not initialized.' }, { status: 500 })
    }

    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'No token found' }, { status: 401 })
    }

    // Verify token with Firebase Admin
    const decodedToken = await auth().verifyIdToken(token)
    
    return NextResponse.json({ 
      valid: true, 
      uid: decodedToken.uid,
      email: decodedToken.email 
    })
  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
}