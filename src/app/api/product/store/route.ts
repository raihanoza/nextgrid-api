import { NextResponse } from "next/server";
import { addDataProduct, getDataProduct } from "../../../lib/process-product";
import db from "../../../lib/db";
import { z } from "zod";
import { jwtVerify } from "jose"; // Import jwtVerify dari jose

const SECRET_KEY = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "123456"
);
const productSchema = z.object({
  name: z.string().nonempty("nama wajib diisi"),
  brand_id: z.string().nonempty("brand wajib diisi"),
  price: z.string().nonempty("harga wajib diisi"),
});

export async function POST(req: Request) {
   // Extract token from Authorization header
   const authHeader = req.headers.get('Authorization');
   const token = authHeader?.split(' ')[1]; // Bearer token

   if (!token) {
     return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
   }

   // Verify the token
   try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
   } catch (error) {
     return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
   }

  const body = await req.formData();
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
    const procces = await addDataProduct(data,trx);

    await trx.commit();
    if (procces)
      return Response.json({
        status: true,
        message: "berhasil menambahkan buku",
      });
    return Response.json({
      status: false,
      message: "Gagal menambahkan buku",
    });
  } catch (error) {
    await trx.rollback();
    console.log({ error });

    return Response.json({ status: false, message: "Terjadi kesalahan" });
  } finally {
    await trx.destroy();
  }
}


