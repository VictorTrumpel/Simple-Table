import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@entity": path.resolve(__dirname, "src/entity"),
      "@features": path.resolve(__dirname, "src/features"),
      "@widgets": path.resolve(__dirname, "src/widgets"),
      "@shared": path.resolve(__dirname, "src/shared"),
      "@shared/network": path.resolve(__dirname, "src/shared/network"),
      "@shared/model": path.resolve(__dirname, "src/shared/model"),
      "@shared/theme": path.resolve(__dirname, "src/shared/theme"),
      "@shared/context": path.resolve(__dirname, "src/shared/context"),
      "@shared/utils": path.resolve(__dirname, "src/shared/utils"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => {
          return path.replace(/^\/api/, "");
        },
      },
      "/ws": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
});
