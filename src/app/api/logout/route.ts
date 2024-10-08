import { NextResponse } from 'next/server';
import cookie from 'cookie';

import { cookies } from 'next/headers'

export async function POST() {
    const response = NextResponse.json({ message: 'Logout successful' });
  
    response.headers.set(
      'Set-Cookie',
      cookie.serialize('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', 
        maxAge: -1, 
        sameSite: 'strict',
        path: '/',
      })
    );
  
    return response;
  }