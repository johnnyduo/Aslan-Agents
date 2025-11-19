import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'import.meta.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'import.meta.env.TWELVEDATA_API_KEY': JSON.stringify(env.TWELVEDATA_API_KEY),
        'import.meta.env.NEWS_API_KEY': JSON.stringify(env.NEWS_API_KEY),
        'import.meta.env.HEDERA_MIRROR_NODE_URL': JSON.stringify(env.HEDERA_MIRROR_NODE_URL || 'https://mainnet.mirrornode.hedera.com/api/v1'),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
