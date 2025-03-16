/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        unoptimized: true, // Disable image optimization for static export
    },
    trailingSlash: true,
};

export default nextConfig;
