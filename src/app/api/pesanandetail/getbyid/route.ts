import { NextResponse } from "next/server";
import { getPesananDetailById } from "@/app/lib/process-pesanandetail";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pesananheaderid = searchParams.get("pesananheaderid");

  try {
    const pesanandetail = await getPesananDetailById(Number(pesananheaderid));
  
    if (!pesanandetail) {
      return NextResponse.json({ message: "pesanan detail not found" }, { status: 404 });
    } else {
        return NextResponse.json({ status: true, data: pesanandetail });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal", error }, { status: 500 });
  }
}
