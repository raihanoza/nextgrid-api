import { NextResponse } from "next/server";
import {
  addDataProduct,
  deleteDataProduct,
  getDataProduct,
  getProductById,
  updateDataProduct,
} from "../../lib/process-product";
import db from "../../lib/db";
import { log } from "console";
import { type NextRequest } from "next/server";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().nonempty("nama wajib diisi"),
  brand_id: z.string().nonempty("brand wajib diisi"),
  price: z.string().nonempty("harga wajib diisi"),
});

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const id = searchParams.get("id");

  try {
    let data;
    if (id) {
      data = await getProductById(Number(id));
      if (!data) {
        return NextResponse.json({
          status: false,
          message: "Produk tidak ditemukan",
        });
      }
    } else {
      data = await getDataProduct();
    }
    return NextResponse.json({ status: true, data: data });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { status: false, message: "Gagal" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
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

export async function PUT(request: Request) {
  const body = await request.formData();
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

  if (!id) {
    return NextResponse.json(
      { status: false, message: "ID produk tidak ditemukan" },
      { status: 400 }
    );
  }
  const trx = await db.transaction();
  try {
    const updated = await updateDataProduct(Number(id), data);

    await trx.commit();
    if (updated) {
      return NextResponse.json({
        status: true,
        message: "Produk berhasil diperbarui",
      });
    } else {
      return NextResponse.json({
        status: false,
        message: "Produk tidak ditemukan",
      });
    }
  } catch (error) {
    await trx.rollback();
    console.log({ error });
    return NextResponse.json({ status: false, message: "Terjadi kesalahan" });
  }
}

export async function DELETE(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const id = searchParams.get("id");

  const trx = await db.transaction();
  try {
    const deleted = await deleteDataProduct(Number(id));

    await trx.commit();
    if (deleted) {
      return NextResponse.json({
        status: true,
        message: "Produk berhasil dihapus",
      });
    } else {
      return NextResponse.json({
        status: false,
        message: "Produk tidak ditemukan",
      });
    }
  } catch (error) {
    await trx.rollback();
    console.log({ error });
    return NextResponse.json({ status: false, message: "Terjadi kesalahan" });
  }
}
