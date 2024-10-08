import { NextResponse } from "next/server";
import {  getPesananDetailById } from "@/app/lib/process-pesanandetail";
import { getDataPesananHeaderById } from "@/app/lib/process-pesananheader";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  try {
    const pesananheader = await getDataPesananHeaderById(Number(id));
    const pesanandetail = await getPesananDetailById(Number(id));
    
    if (!pesananheader) {
      return NextResponse.json({ message: "pesanan detail not found" }, { status: 404 });
    } else {
      return NextResponse.json({ status: true, data: pesananheader,detail: pesanandetail });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal", error }, { status: 500 });
  }
}
