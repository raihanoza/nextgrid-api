import { processUpdate } from "@/app/lib/process-pesananheader";
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

export async function PUT(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  
  const body = await req.formData();
  const customer = body.get("customer");
  const tglbukti = body.get("tglbukti");
  const keterangan = body.get("keterangan");
  const parsedDetail = JSON.parse((body.get("detail") || "").toString() || "[]");

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

    const pesananheader = await processUpdate(dataHeader,parsedDetail,id);

    await trx.commit();

    return new Response(
      JSON.stringify({
        status: true,
        message: "Berhasil mengupdate pesananheader",
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
