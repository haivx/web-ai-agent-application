/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true
  },
  eslint: {
    dirs: ['app', 'components', 'lib']
  }
};

export default nextConfig;
