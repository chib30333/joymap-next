/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Bookings/QR images etc. are gradient placeholders or /public assets.
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
};

export default nextConfig;
