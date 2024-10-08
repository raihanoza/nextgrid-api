import db from "@/app/lib/db";
import { NextResponse, NextRequest } from 'next/server';


  export async function GET() {
    try {
      await db.raw('SELECT 1+1 AS result');
      return NextResponse.json({ status: true, message: 'Database connection successful' });
    } catch (error) {
      console.error('Database connection failed:', error);
      return NextResponse.json({ status: false, message: `Database connection failed ${error}` }, { status: 500 });
    }
  }