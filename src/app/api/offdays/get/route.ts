import { getDataOffDays } from "@/app/lib/process-offdays";

import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const data = await getDataOffDays();

    return NextResponse.json({ status: true, data: data });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { status: false, message: "Gagal" },
      { status: 500 }
    );
  }
}
