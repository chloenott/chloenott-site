/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // useEffect for chart triggers twice, so duplicate forms if this is true; only occurs in development.
  swcMinify: true,
  i18n: {
    locales: ['en-US'],
    defaultLocale: 'en-US',
  },
}

module.exports = nextConfig
