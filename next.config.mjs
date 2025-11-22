/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "lh3.googleusercontent.com",   // Google avatars
      "images.pexels.com",           // Pexels images
      "avatars.githubusercontent.com", // GitHub avatars
    ],
  },
};

export default nextConfig;