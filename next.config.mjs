/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['drive.google.com','i.pravatar.cc'], // Add your image source domains here
  },
  webpack(config) {
    // Grab the existing rule that handles SVG imports
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.(".svg")
    );

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
        use: ["@svgr/webpack"],
      }
    );

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i;

    return config;
  },

  // Adding domains for next/image
  

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://world.openfoodfacts.org/api/:path*', // Proxy to Express server
      },
    ];
  },

  // ...other config
};

export default nextConfig;
