// app/api/auth/verify-token/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { auth } from 'firebase-admin'
import { initializeApp, getApps, cert } from 'firebase-admin/app'

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  })
}

export async function GET(request: NextRequest) {
  try {
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