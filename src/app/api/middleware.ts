// app/api/_middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.SECRET_KEY || '123456';

export async function middleware(req: NextRequest) {

  console.log(req);
  
  // Check for Authorization header
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.split(' ')[1]; // Bearer token

  // Verify the token
  if (token) {
    try {
      jwt.verify(token, SECRET_KEY);
      return NextResponse.next(); // Proceed if token is valid
    } catch (error) {
      console.error('Invalid or expired token:', error);
    }
  }

  // Respond with an unauthorized message
  return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
}
