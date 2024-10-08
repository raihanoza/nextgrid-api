// app/api/product/get-product-id/route.ts
import { NextResponse } from "next/server";
import db from "../../../lib/db";
import { getProductById } from '@/app/lib/process-product';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  try {
    const product = await getProductById(Number(id));
  
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    } else {
      return NextResponse.json(product, { status: 200 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal", error }, { status: 500 });
  }
}
