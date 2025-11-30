import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // This ensures your process.env.API_KEY works in the browser after build
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});