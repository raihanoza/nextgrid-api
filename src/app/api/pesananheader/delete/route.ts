// app/api/product/delete-product/route.ts
import { NextResponse } from "next/server";
import db from "../../../lib/db";
import { deleteDataProduct } from "@/app/lib/process-product";
import { processDelete } from "@/app/lib/process-pesananheader";

export async function POST(req: Request) {
  if (!req.headers.get("content-type")?.includes("multipart/form-data")) {
    return NextResponse.json({ message: "Content-Type was not one of 'multipart/form-data'" }, { status: 400 });
  }

  const formData = await req.formData();
  const id = formData.get("id");

  const trx = await db.transaction();
  try {
    const existingProduct = await trx("pesananheader").where({ id }).first();
    if (!existingProduct) {
      await trx.rollback();
      return NextResponse.json({
        status: false,
        message: "pesanan header tidak ditemukan",
      });
    }

    // const process = await db("pesananheader").where({ id }).del();
    const process = await processDelete(Number(id));

    await trx.commit();
    if (process) {
      return NextResponse.json({
        status: true,
        message: "Berhasil hapus pesanan header",
      });
    } else {
      return NextResponse.json({
        status: false,
        message: "Gagal hapus pesanan header",
      });
    }
  } catch (error) {
    await trx.rollback();
    console.error(error);
    return NextResponse.json({ status: false, message: "Terjadi kesalahan" });
  } finally {
    await trx.destroy();
  }
}
