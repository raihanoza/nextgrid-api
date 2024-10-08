import { getDataBrands } from "@/app/lib/process-brands";

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY || "123456";

export async function GET(req: Request) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.split(" ")[1]; // Bearer token

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Verify the token
    try {
      jwt.verify(token, SECRET_KEY);
    } catch (error) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const data = await getDataBrands();

    return NextResponse.json({ status: true, data: data });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { status: false, message: "Gagal" },
      { status: 500 }
    );
  }
}
