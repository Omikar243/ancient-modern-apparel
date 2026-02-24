import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable turbopack loader in production to avoid build issues
  ...(process.env.NODE_ENV === "development" && {
    turbopack: {
      rules: {
        "*.{jsx,tsx}": {
          loaders: [require.resolve('./src/visual-edits/component-tagger-loader.js')]
        }
      }
    },
  }),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      }
    ]
  },
  // Ensure proper runtime configuration
  serverExternalPackages: ['@libsql/client'],
  // Exclude mobile-app from webpack compilation
  webpack: (config, { isServer }) => {
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /mobile-app\/.*/,
      use: 'ignore-loader'
    });
    return config;
  },
};

export default nextConfig;