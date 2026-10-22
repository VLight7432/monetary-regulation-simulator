import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/recharts/')) {
            return 'charts';
          }

          if (id.includes('/node_modules/framer-motion/')) {
            return 'animation';
          }

          if (
            id.includes('/node_modules/react/') ||
            id.includes('/node_modules/react-dom/') ||
            id.includes('/node_modules/scheduler/')
          ) {
            return 'react-vendor';
          }

          return undefined;
        }
      }
    }
  },
  server: {
    port: 3000,
    strictPort: false,
  },
});
