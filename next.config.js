/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow all hosts for ngrok
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig

