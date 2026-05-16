import { securityHeaders } from "./src/lib/security-headers.mjs";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "malou";

function normalizeBasePath(basePath) {
  if (!basePath || basePath === "/") return "";
  return basePath.startsWith("/") ? basePath : `/${basePath}`;
}

const basePath = normalizeBasePath(
  process.env.NEXT_PUBLIC_BASE_PATH ?? (isGitHubPages ? repositoryName : "")
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(isGitHubPages
    ? {
        output: "export",
        trailingSlash: true,
        ...(basePath ? { basePath, assetPrefix: `${basePath}/` } : {}),
        images: {
          unoptimized: true
        }
      }
    : {
        async headers() {
          return [
            {
              source: "/:path*",
              headers: securityHeaders
            }
          ];
        }
      })
};

export default nextConfig;
