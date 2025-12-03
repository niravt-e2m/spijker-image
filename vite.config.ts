import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: parseInt(process.env.PORT || '5173'),
    host: '0.0.0.0',
    proxy: {
      "/api/n8n": {
        target: "https://spijkerenco.app.n8n.cloud",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/n8n/, ""),
      },
    },
  },
  preview: {
    port: parseInt(process.env.PORT || '4173'),
    host: '0.0.0.0'
  }
});
