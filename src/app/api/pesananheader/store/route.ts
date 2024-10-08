import { processStore } from "@/app/lib/process-pesananheader";
import db from "../../../lib/db";
import { z } from "zod";

const headerSchema = z.object({
  tglbukti: z.string().nonempty("tgl bukti wajib diisi"),
  customer: z.string().nonempty("Customer wajib diisi"),
  keterangan: z.string().optional(),
});

const detailSchema = z.array(
  z.object({
    product: z.string().nonempty(),
    qty: z.number().min(1),
    harga: z.number().min(0),
    totalharga: z.number().min(0),
  })
);

export async function POST(req: Request) {
  const body = await req.formData();
  const customer = body.get("customer");
  const tglbukti = body.get("tglbukti");
  const keterangan = body.get("keterangan");
  const detailString = (body.get("detail") || "").toString();

  // Log the raw detail string for debugging
  console.log("Raw detail string:", detailString);

  // Attempt to parse the detail string
  let parsedDetail;
  try {
    parsedDetail = JSON.parse(detailString);
  } catch (error) {
    console.error("Error parsing detail:", error);
    return new Response(
      JSON.stringify({
        status: false,
        message: "Detail data is malformed",
        errors: ["Detail data must be valid JSON."],
      }),
      { status: 400 }
    );
  }

  const headerData = headerSchema.safeParse({ customer, tglbukti, keterangan });
  const detailData = detailSchema.safeParse(parsedDetail);

  if (!headerData.success) {
    return new Response(
      JSON.stringify({
        status: false,
        message: "Validation failed",
        errors: headerData.error.errors,
      }),
      { status: 400 }
    );
  }

  if (!detailData.success) {
    return new Response(
      JSON.stringify({
        status: false,
        message: "Validation failed",
        errors: detailData.error.errors,
      }),
      { status: 400 }
    );
  }

  const trx = await db.transaction();

  try {
    const dataHeader = headerData.data;

    const pesananheader = await processStore(dataHeader, parsedDetail);
  
    await trx.commit();

    return new Response(
      JSON.stringify({
        status: true,
        message: "Berhasil menambahkan pesananheader",
      }),
      { status: 200 }
    );
  } catch (error) {
    await trx.rollback();
    console.error({ error });

    return new Response(
      JSON.stringify({ status: false, message: "Terjadi kesalahan" }),
      { status: 500 }
    );
  } finally {
    await trx.destroy();
  }
}
