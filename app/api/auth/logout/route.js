import { NextResponse } from 'next/server';

// FIX 6: expire the cookie immediately on logout
export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out' });
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(0),  // immediately expired
    path: '/',
  });
  return response;
}
