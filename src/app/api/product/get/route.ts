import { NextResponse, NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { getDataProduct } from '@/app/lib/process-product';

const SECRET_KEY = process.env.SECRET_KEY || '123456'; // Use your environment variable for the secret key

export async function GET(req: NextRequest) {
  try {
    // const cookies = cookie.parse(req.headers.get('cookie') || '');
    // const token = cookies.token;
  
    // if (!token) {
    //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    // }

    // Extract token from Authorization header
    // const authHeader = req.headers.get('Authorization');
    // const token = authHeader?.split(' ')[1]; // Bearer token

    // if (!token) {
    //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    // }

    // // Verify the token
    // try {
    //   jwt.verify(token, SECRET_KEY);
    // } catch (error) {
    //   return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
    // }

    // Fetch product data if token is valid
    const data = await getDataProduct();
    return NextResponse.json({ status: true, data }, { status: 200 });

  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ status: false, message: 'Failed to load data' }, { status: 500 });
  }
}
