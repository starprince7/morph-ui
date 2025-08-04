'use server';

import { cookies } from 'next/headers';
import SessionManager from '@/lib/session-manager';

/**
 * Server Action to create or get a session
 * This is needed because cookies can only be modified in Server Actions in Next.js 15
 */
export async function createOrGetSession(): Promise<string> {
  const sessionManager = SessionManager.getInstance();
  
  try {
    // Try to get existing session from cookies
    const cookieStore = await cookies();
    const existingSessionId = cookieStore.get('session-id')?.value;
    
    // Use the public getSessionId method which already validates the session
    const validSessionId = await sessionManager.getSessionId();
    if (validSessionId) {
      return validSessionId;
    }
    
    // Create new session
    const newSessionId = sessionManager.generateSessionId();
    
    // Set cookie with proper security settings
    cookieStore.set('session-id', newSessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    });
    
    return newSessionId;
  } catch (error) {
    console.error('Error creating/getting session:', error);
    // Return a temporary session ID if cookie operations fail
    return sessionManager.generateSessionId();
  }
}

/**
 * Server Action to clear the session
 */
export async function clearSession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('session-id');
  } catch (error) {
    console.error('Error clearing session:', error);
  }
}