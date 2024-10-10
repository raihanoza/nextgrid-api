import db from '../../../lib/db'; // Sesuaikan path ke db jika perlu
import { NextRequest, NextResponse } from 'next/server';

// Ekspor untuk metode GET
export async function GET(req: NextRequest) {
  try {
    // Buat tabel sementara jika belum ada
    await db.raw(`
        CREATE TEMPORARY TABLE IF NOT EXISTS temp_pesananheader (
            id INT,
            customer VARCHAR(255),
            keterangan VARCHAR(255),
            tglbukti DATETIME
        );
    `);

    // Sisipkan data ke dalam tabel sementara
    await db.raw(`
        INSERT INTO temp_pesananheader (id, customer, keterangan, tglbukti)
        SELECT id, customer, keterangan, tglbukti FROM pesananheader;
    `);

    // Ambil semua data dari tabel sementara dan urutkan berdasarkan customer
    const tempData = await db('temp_pesananheader')
      .select('*')
      .orderBy('customer'); // Menambahkan sorting berdasarkan customer

    // Jika tidak ada data di tabel sementara
    if (tempData.length === 0) {
      return NextResponse.json({ error: 'No data found in temporary table.' }, { status: 404 });
    }

    // Kirim semua data sebagai response
    return NextResponse.json(tempData, { status: 200 });
  } catch (error) {
    console.error('Error fetching temporary data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
