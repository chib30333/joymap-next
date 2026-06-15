/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Bookings/QR images etc. are gradient placeholders or /public assets.
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
  // On Windows the dev file-watcher can walk up to the drive root and choke on
  // the protected "System Volume Information" folder (EINVAL on lstat). Ignore
  // it (and node_modules/.next/.git) so the initial scan succeeds cleanly.
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          "**/node_modules/**",
          "**/.next/**",
          "**/.git/**",
          "**/System Volume Information/**",
          "**/$RECYCLE.BIN/**",
        ],
      };
    }
    return config;
  },
};

export default nextConfig;
