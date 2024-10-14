import { NextResponse } from 'next/server';
import redis from '../../../lib/redis'; // Pastikan path ke client Redis Anda benar

// Fungsi API untuk mendapatkan newRowId dengan method GET
export async function GET() {
  try {
    // Mengambil newPesananHeaderPage dari Redis
    const newRowId = await redis.get('newPesananHeaderPage');
    
    if (newRowId) {
      // Mengembalikan newRowId dengan status 200
      return NextResponse.json({ newRowId: JSON.parse(newRowId) }, { status: 200 });
    } else {
      // Jika tidak ada newRowId di Redis, kembalikan status 404
      return NextResponse.json({ error: 'No new row ID found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Failed to fetch new row ID:', error);
    // Jika terjadi error saat fetch dari Redis, kembalikan status 500
    return NextResponse.json({ error: 'Failed to fetch new row ID' }, { status: 500 });
  }
}
