import { NextResponse } from "next/server";
import db from "../../../lib/db";
import { updateDataProduct } from "@/app/lib/process-product";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().nonempty("nama wajib diisi"),
  brand_id: z.string().nonempty("brand wajib diisi"),
  price: z.string().nonempty("harga wajib diisi"),
});

export async function POST(req: Request) {
  const body = await req.formData();
  const id = body.get("id");
  const name = body.get("name");
  const brand_id = body.get("brand_id");
  const price = body.get("price");

  const result = productSchema.safeParse({ name, brand_id, price });

  if (!result.success) {
    return new Response(JSON.stringify({
      status: false,
      message: "Validation failed",
      errors: result.error.errors,
    }), { status: 400 });
  }

  const data = result.data;

  const trx = await db.transaction();
  try {
    const procces = await updateDataProduct(id, data);

    await trx.commit();
    if (procces)
      return Response.json({
        status: true,
        message: "berhasil edit product",
      });
    return Response.json({
      status: false,
      message: "Gagal edit product",
    });
  } catch (error) {
    await trx.rollback();
    console.log({ error });

    return Response.json({ status: false, message: "Terjadi kesalahan" });
  } finally {
    await trx.destroy();
  }
}
