import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "../../../lib/db"; 

const SALT_ROUNDS = 10;

// const userSchema = z.object({
//     username: z.string().nonempty("Username is required"),
//     password: z.string().nonempty("Password is required"),
// });

export async function POST(req: Request) {
  try {
    const body = await req.formData();

    const username = body.get("username") as string; // Cast to string
    const password = body.get("password") as string; // Cast to string

    // Validate username and password
    if (!username || !password) {
      return NextResponse.json(
        { message: "Username and password are required" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Save user to the database
    await db("users").insert({
      username,
      password: hashedPassword,
    });

    // Retrieve the last inserted user ID
    const userId = await db("users").select("id").where("username", username).first();

    return NextResponse.json(
      { message: "User registered successfully", userId: userId?.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
