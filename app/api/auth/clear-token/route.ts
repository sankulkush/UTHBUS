// app/api/auth/clear-token/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('auth-token')
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error clearing token:', error)
    return NextResponse.json({ error: 'Failed to clear token' }, { status: 500 })
  }
}