import path from "node:path";
import { fileURLToPath } from "node:url";

// Watchpack tests this regex against paths with forward slashes, so the root has
// to be normalised the same way.
const projectRoot = path
  .dirname(fileURLToPath(import.meta.url))
  .replace(/\\/g, "/");
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Webpack records every failed `node_modules` lookup as a "missing dependency",
// including the ones in the parent folders and at the drive root (e.g. D:/node_modules).
// Watchpack then watches the *parent* of every missing path, so it ends up scanning
// the drive root and blows up on the protected "System Volume Information" folder
// (EINVAL on lstat). Ignoring everything outside the project — plus the usual noisy
// folders — keeps the watcher inside the repo and the initial scan clean.
const IGNORED = new RegExp(
  `^(?!${escapeRe(projectRoot)}(?:$|/))` +
    `|/(?:node_modules|\\.next|\\.git|System Volume Information|\\$RECYCLE\\.BIN)(?:/|$)`,
  "i",
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Bookings/QR images etc. are gradient placeholders or /public assets.
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = { ...config.watchOptions, ignored: IGNORED };
    }
    return config;
  },
};

export default nextConfig;
