/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: "/products", destination: "/api/products" },
      { source: "/products/:id", destination: "/api/products/:id" },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
