import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose"; // Import jwtVerify from jose

export async function middleware(request: NextRequest) {
  const SECRET_KEY = new TextEncoder().encode(
    process.env.NEXTAUTH_SECRET || "123456"
  );
  const authHeader = request.headers.get("Authorization");

  // Handle preflight request (OPTIONS method) for CORS
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204, // No content for OPTIONS requests
      headers: {
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Origin": request.headers.get("origin") || "*", // Adjust this to allow specific origins
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE",
        "Access-Control-Allow-Headers":
          "Authorization, Content-Type, Access-Control-Allow-Headers, X-Requested-With",
      },
    });
  }

  const token = authHeader?.split(" ")[1]; // Bearer token

  // If the token is missing, return Unauthorized
  if (!token) {
    return NextResponse.json(
      { message: "Unauthorized" },
      {
        status: 401,
        headers: {
          "Access-Control-Allow-Origin": request.headers.get("origin") || "*", // Allow the origin in the error response too
        },
      }
    );
  }

  // Verify the token using jose
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    // Optionally, attach the decoded token payload to the request for use in the API
    request.nextUrl.searchParams.set("user", JSON.stringify(payload));
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Invalid or expired token" },
      {
        status: 401,
        headers: {
          "Access-Control-Allow-Origin": request.headers.get("origin") || "*",
        },
      }
    );
  }

  // Token is valid, proceed
  const response = NextResponse.next();
  response.headers.set(
    "Access-Control-Allow-Origin",
    request.headers.get("origin") || "*"
  );
  return response;
}

// Apply the middleware to the desired routes
// Apply the middleware to the desired routes
export const config = {
  matcher: [
    "/api/product/:path*",
    "/api/pesananheader/:path*", // Include your specific API routes here
  ],
};

