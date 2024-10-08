import { log } from "console";
import db from "./db";
import { processStoreDetail } from "./process-pesanandetail";

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
}: GetDataPesananHeaderParams) {
  try {
    // Ambil data pesanan header
    const queryHeader = db('pesananheader')
      .select('*');

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

    // Calculate offset based on page number
    const offset = (page - 1) * limit;

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

    return {
      page,
      limit,
      data: pesananWithDetails,
    };
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

export async function processStore(data: any,detail: any) {
  const tglbukti = data.tglbukti
  const customer = data.customer
  const keterangan = data.keterangan

  const insertedHeader = await db("pesananheader").insert({
    tglbukti,
    customer,
    keterangan,
  });

  const pesananHeaderId = insertedHeader[0]

  const pesananDetail = await processStoreDetail(pesananHeaderId,detail);

  return data;
}

export async function processUpdate(data: any,detail: any,id:any) {
  const tglbukti = data.tglbukti
  const customer = data.customer
  const keterangan = data.keterangan

  const insertedHeader = await db("pesananheader").update({
      tglbukti,
      customer,
      keterangan,
    })
    .where('id', id);

  const deleteDetail = await db('pesanandetail').where('pesananheaderid', id).del();

  const pesananDetail = await processStoreDetail(id,detail);

  return data;
}

export async function processDelete(id:number) {
  const process = await db("pesananheader").where({ id }).del();

  return id;
}
