/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
      return [
        {
          // Apply headers to all API routes
          source: "/api/:path*", // This will include all API routes
          headers: [
            { key: "Access-Control-Allow-Credentials", value: "true" },
            { key: "Access-Control-Allow-Origin", value: "*" }, // Consider specifying your origin for security
            { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT,OPTIONS" },
            { key: "Access-Control-Allow-Headers", value: "Authorization, Content-Type, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version" },
          ],
        },
      ];
    },
  };
  
  export default nextConfig;
  