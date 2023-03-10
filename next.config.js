/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: false,
  swcMinify: true,
  webpack: (config, {isServer}) => {
    config.module.rules.push({
      test: /\.(png|gif|woff|woff2|eot|ttf|svg)$/,
      type: 'asset/resource',
    })
    return config
  },
}

module.exports = nextConfig
