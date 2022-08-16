/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // useEffect for chart triggers twice, so duplicate forms if this is true; only occurs in development.
  swcMinify: true,
}

module.exports = nextConfig
