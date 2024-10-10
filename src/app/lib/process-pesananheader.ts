import { log } from "console";
import db from "./db";
import { processStoreDetail } from "./process-pesanandetail";
import redis from "./redis";

interface GetDataPesananHeaderParams {
  customer?: string;
  keterangan?: string;
  tglbukti?: string;
  sortColumn?: string; // Column to sort by
  sortDirection?: 'ASC' | 'DESC'; // Sorting direction
  limit?: number; // Number of records to return
  page?: number; // Page number for pagination
}

interface GetDataPesananHeaderParams {
  customer?: string;
  keterangan?: string;
  tglbukti?: string;
  sortColumn?: string; // Column to sort by
  sortDirection?: 'ASC' | 'DESC'; // Sorting direction
  limit?: number; // Number of records to return
  page?: number; // Page number for pagination
}

export async function getDataPesananHeader({
  customer,
  keterangan,
  tglbukti,
  sortColumn = 'id', // Default sort by id
  sortDirection = 'ASC', // Default sorting direction
  limit = 10, // Default limit for pagination
  page = 1, // Default page number
}: GetDataPesananHeaderParams): Promise<any> {
  try {
    // Menghitung offset berdasarkan nomor halaman
    const offset = (page - 1) * limit;

    // Cek cache di Redis
    const cacheKey = `pesananheader:customer:${customer}:keterangan:${keterangan}:tglbukti:${tglbukti}:sort:${sortColumn}:${sortDirection}:limit:${limit}:page:${page}`;
    const cachedData = await redis.get(cacheKey);
    
    if (cachedData) {
      // Jika ada data dalam cache, kembalikan data tersebut
      return JSON.parse(cachedData);
    }

    // Ambil data pesanan header dari database
    const queryHeader = db('pesananheader').select('*');

    // Apply filters
    if (customer) {
      queryHeader.where('customer', 'like', `%${customer}%`); // Assuming partial match
    }
    if (keterangan) {
      queryHeader.where('keterangan', 'like', `%${keterangan}%`); // Assuming partial match
    }
    if (tglbukti) {
      queryHeader.where('tglbukti', '=', tglbukti); // Exact match
    }

    // Apply sorting
    queryHeader.orderBy(sortColumn, sortDirection);

    // Apply pagination (limit and offset)
    queryHeader.limit(limit).offset(offset);

    const pesananheader = await queryHeader;

    // Ambil detail untuk setiap pesanan header
    const pesananDetailPromises = pesananheader.map(async (header) => {
      const details = await db('pesanandetail')
        .where('pesananheaderid', header.id); // Mengambil detail untuk setiap header
      return {
        ...header,
        details, // Menambahkan detail ke header
      };
    });

    const pesananWithDetails = await Promise.all(pesananDetailPromises); // Tunggu hingga semua detail selesai

    // Hitung total data
    const totalCountResult = await db("pesananheader").count('* as count');
    const totalCount = Number(totalCountResult[0].count); // Ensure it's a number

    // Buat objek respons
    const response = {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit), // Hitung total halaman
      data: pesananWithDetails,
    };

    // Simpan hasil ke dalam cache
    await redis.set(cacheKey, JSON.stringify(response), 'EX', 1); // Cache selama 1 jam

    return response;
  } catch (error) {
    console.error('Error fetching pesananheader:', error);
    throw new Error('Database query failed'); // Rethrow error for higher-level handling
  }
}


export async function getDataPesananHeaderById(id: number) {
  const pesananheader = await db("pesananheader")
    .select(
      "pesananheader.id",
      "pesananheader.tglbukti",
      "pesananheader.customer",
      "pesananheader.keterangan"
    )
    .where("pesananheader.id", id);
  return pesananheader;
}

export async function processStore(data: any, detail: any) {
  const { tglbukti, customer, keterangan } = data;

  // Insert new pesanan header
  const insertedHeader = await db("pesananheader").insert({
    tglbukti,
    customer,
    keterangan,
  });

  const pesananHeaderId = insertedHeader[0]; // Get the inserted header ID

  // Insert pesanan details using the helper function
  await processStoreDetail(pesananHeaderId, detail);

  // Fetch all pesanan headers ordered by customer\
  const allPesananHeaders = await db("pesananheader")
  .select('*')
  .orderBy('customer');

// Mengambil detail untuk setiap header
const pesananDetailPromises = allPesananHeaders.map(async (header) => {
  const details = await db('pesanandetail')
    .where('pesananheaderid', header.id); // Mengambil detail untuk setiap header
  return {
    ...header,
    details, // Menambahkan detail ke header
  };
});
  // Find the index of the newly added header
  const newHeaderIndex = allPesananHeaders.findIndex(header => header.id === pesananHeaderId);


const pesananWithDetails = await Promise.all(pesananDetailPromises); // Tunggu hingga semua detail selesai
  // Simpan ID row baru ke Redis
  await redis.set('newRow', JSON.stringify(pesananWithDetails)); // Simpan data semua pesanan header ke Redis
  await redis.set('newPesananHeaderIndex', newHeaderIndex); // Simpan posisi (index) dari pesanan header yang baru ditambahkan

  // Invalidate cache entries related to the newly added order
  const totalCountResult = await db("pesananheader").count('* as count');
  const totalCount = Number(totalCountResult[0].count);
  const limit = 10; // Sesuaikan dengan pagination limit Anda

  const totalPages = Math.ceil(totalCount / limit); // Hitung total halaman

  // Clear cache for all pages
  for (let i = 1; i <= totalPages; i++) {
    await redis.del(`pesananheader:customer:${customer}:keterangan:${keterangan}:tglbukti:${tglbukti}:sort:id:ASC:limit:${limit}:page:${i}`);
    await redis.del(`pesananheader:customer:${customer}:keterangan:${keterangan}:tglbukti:${tglbukti}:sort:id:DESC:limit:${limit}:page:${i}`);
  }

  return data; // Return the inserted data
}

export async function processUpdate(data: any, detail: any, id: any) {
  const { tglbukti, customer, keterangan } = data;

  console.log(`Updating pesanan header with ID: ${id}`); // Log the ID being updated

  // Update pesanan header
  await db("pesananheader")
    .update({
      tglbukti,
      customer,
      keterangan,
    })
    .where('id', id);

  // Delete existing details for the header
  await db('pesanandetail').where('pesananheaderid', id).del();

  // Insert new details using the helper function
  await processStoreDetail(id, detail);

  // Directly fetch the updated header
  const updatedHeader = await db("pesananheader").select('*').where('id', id).first();
  console.log("Updated Header:", updatedHeader); // Log the updated header

  // Check if the header was successfully updated
  if (!updatedHeader) {
    console.error(`Pesanan header ID ${id} not found after update.`);
    return null; // Early exit if the header was not found
  }

  // Fetch all pesanan headers ordered by customer after the update
  const allPesananHeaders = await db("pesananheader").select('*').orderBy('customer');
  console.log("All Pesanan Headers:", allPesananHeaders); // Log all headers

  // Mengambil detail untuk setiap header
  const pesananDetailPromises = allPesananHeaders.map(async (header) => {
    const details = await db('pesanandetail')
      .where('pesananheaderid', header.id); // Mengambil detail untuk setiap header
    return {
      ...header,
      details, // Menambahkan detail ke header
    };
  });
  const pesananWithDetails = await Promise.all(pesananDetailPromises); // Tunggu hingga semua detail selesai

  // Ensure both IDs are the same type (e.g., both strings)
  const updatedRowIndex = allPesananHeaders.findIndex(header => String(header.id) === String(id));
  console.log("Updated Row Index:", updatedRowIndex); // Log the index of the updated row

  // Save the index to Redis
  if (updatedRowIndex !== -1) {
    await redis.set('newPesananHeaderIndex', updatedRowIndex);
  } else {
    console.error('Updated row not found in the list.');
  }
   // Simpan posisi (index) dari pesanan header yang baru ditambahkan

  // Simpan data semua pesanan header ke Redis (optional, sesuai kebutuhan)
  await redis.set('newRow', JSON.stringify(pesananWithDetails));

  return data; // Return the updated data
}




export async function processDelete(id:number) {
  const process = await db("pesananheader").where({ id }).del();
  const allPesananHeaders = await db("pesananheader").select('*').orderBy('customer');
  const pesananDetailPromises = allPesananHeaders.map(async (header) => {
    const details = await db('pesanandetail')
      .where('pesananheaderid', header.id); // Mengambil detail untuk setiap header
    return {
      ...header,
      details, // Menambahkan detail ke header
    };
  });
const pesananWithDetails = await Promise.all(pesananDetailPromises); // Tunggu hingga semua detail selesai
await redis.set('newRow', JSON.stringify(pesananWithDetails)); // Simpan data semua pesanan header ke Redis

  return id;
}
