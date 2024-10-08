import { NextResponse } from "next/server";
import { SignJWT } from "jose"; // Import SignJWT from jose
import { handleLogin } from "../../../lib/process-user";
import { z } from "zod";

const SECRET_KEY = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "123456"
); // Encode secret key

const userSchema = z.object({
  username: z.string().nonempty("Username is required"),
  password: z.string().nonempty("Password is required"),
});

export async function POST(req: Request) {
  const body = await req.formData();
  
  const username = body.get("username");
  const password = body.get("password");

 

  // Validate input data
  const result = userSchema.safeParse({ username, password });

  if (!result.success) {
    return new Response(JSON.stringify({
      status: false,
      message: "Validation failed",
      errors: result.error.errors,
    }), { status: 403 });
  }

  const { username: safeUsername, password: safePassword } = result.data;

  console.log(safeUsername, safePassword);

  // Handle login
  try {
    const user = await handleLogin(safeUsername, safePassword);

    if (user) {
      // Generate a JWT token if credentials are valid
      const token = await new SignJWT({ username: user.username }) // Create a new JWT with the user's username
        .setProtectedHeader({ alg: "HS256" }) // Set the algorithm header
        .setExpirationTime("1h") // Set the expiration time
        .sign(SECRET_KEY);

      // Create the response
      const response = NextResponse.json({
        message: "Login successful",
        token,
        username: user.username,
      });

      return response;
    }

    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  } catch (error) {
    console.error("Login error:", error); // Log the error
    return NextResponse.json(
      { message: "An error occurred during login" },
      { status: 500 }
    );
  }
}
