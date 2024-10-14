import { NextResponse, NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { getDataProduct } from '@/app/lib/process-product';

const SECRET_KEY = process.env.SECRET_KEY || '123456'; // Use your environment variable for the secret key

export async function GET(req: NextRequest) {
  try {
    const data = await getDataProduct();
    return NextResponse.json({ status: true, data }, { status: 200 });

  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ status: false, message: 'Failed to load data' }, { status: 500 });
  }
}
