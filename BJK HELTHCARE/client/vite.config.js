import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5000,
    strictPort: true,
    hmr: {
      clientPort: 5000,
    },
  },
  legacy: {
    skipWebSocketTokenCheck: true,
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['recharts'],
          'vendor-icons': ['lucide-react'],
          'vendor-export': ['jspdf', 'html2canvas', 'qrcode']
        }
      }
    }
  }
});
