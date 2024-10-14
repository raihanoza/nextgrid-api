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
  search?: string; // Global search filter
  sortColumn?: string; // Column to sort by
  sortDirection?: 'ASC' | 'DESC'; // Sorting direction
  limit?: number; // Number of records to return
  page?: number; // Page number for pagination
}

export async function getDataPesananHeader({
  customer,
  keterangan,
  tglbukti,
  search, // New global search filter
  sortColumn = 'id', // Default sort by id
  sortDirection = 'ASC', // Default sorting direction
  limit = 10, // Default limit for pagination
  page = 1, // Default page number
}: GetDataPesananHeaderParams): Promise<any> {
  try {
    // Menghitung offset berdasarkan nomor halaman
    const offset = (page - 1) * limit;
    

    // Ambil data pesanan header dari database
    const queryHeader = db('pesananheader').select('*');

    // Apply filters based on specific columns
    if (customer) {
      queryHeader.where('customer', 'like', `%${customer}%`); // Assuming partial match
    }
    if (keterangan) {
      queryHeader.where('keterangan', 'like', `%${keterangan}%`); // Assuming partial match
    }
    if (tglbukti) {
      queryHeader.where('tglbukti', '=', tglbukti); // Exact match
    }

    // Apply global search across multiple columns
    if (search) {
      queryHeader.where(function() {
        this.where('customer', 'like', `%${search}%`)
          .orWhere('keterangan', 'like', `%${search}%`)
          .orWhere('tglbukti', 'like', `%${search}%`);
      });
    }
    queryHeader.orderBy(sortColumn, sortDirection);
    queryHeader.limit(limit).offset(offset);

    const pesananheader = await queryHeader;
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


    return response;
  } catch (error) {
    console.error('Error fetching pesananheader:', error);
    throw new Error('Database query failed');
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

  // Fetch all pesanan headers ordered by customer ASC
  const allPesananHeaders = await db("pesananheader")
    .select('*')
    .orderBy('customer', 'asc'); // Order by customer ascending

  // Get the total count of orders (headers)
  const totalCountResult = await db("pesananheader").count('* as count');
  const totalCount = Number(totalCountResult[0].count);

  const limit = 30; // Pagination limit (30 data per page)
  
  // Find the position (index) of the newly added data in the ordered list
  const newHeaderIndex = allPesananHeaders.findIndex(header => header.id === pesananHeaderId);
  
  // Calculate the page number for the newly added header
  const newHeaderPage = Math.ceil((newHeaderIndex + 1) / limit); // Page starts from 1

  // Calculate index within the page
  const indexOnPage = newHeaderIndex % limit; // Position in the page (0-indexed)

  await redis.set('newPesananHeaderPage', newHeaderPage.toString()); // Save the page of the newly added order
  await redis.set('newPesananHeaderIndex', indexOnPage.toString()); // Save the index of the new order on its page

  // Invalidate cache entries related to the newly added order
  const totalPages = Math.ceil(totalCount / limit); // Calculate total pages

  // Clear cache for all pages to invalidate old cache
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

  // Ensure both IDs are the same type (e.g., both strings)
  const updatedRowIndex = allPesananHeaders.findIndex(header => String(header.id) === String(id));

  const pageSize = 30;
  const indexInPage = updatedRowIndex % pageSize;
  const newHeaderPage = Math.floor(updatedRowIndex / pageSize) + 1;
  await redis.set('newPesananHeaderIndex', indexInPage.toString());
  await redis.set('newPesananHeaderPage', newHeaderPage.toString());

  return data; // Return the updated data
}

export async function processDelete(id: number) {
  // Menghapus pesanan header berdasarkan ID
  await db("pesananheader").where({ id }).del();

  // Mengembalikan ID yang dihapus
  return id;
}

