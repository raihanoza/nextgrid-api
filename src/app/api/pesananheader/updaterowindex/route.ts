// src/app/api/pesananheader/get-new-row/route.ts

import { NextResponse } from 'next/server';
import redis from '../../../lib/redis'; // Pastikan path ke client Redis Anda benar

// Fungsi API untuk mendapatkan newRowId
export async function POST() {
  try {
    const newRowId = await redis.get('updatedRowIndex'); // Mengambil newRowId dari Redis
    if (newRowId) {
      return NextResponse.json( newRowId, { status: 200 });
    } else {
      return NextResponse.json({ error: 'No new row ID found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Failed to fetch new row ID:', error);
    return NextResponse.json({ error: 'Failed to fetch new row ID' }, { status: 500 });
  }
}
