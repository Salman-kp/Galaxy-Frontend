import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/auth": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
      "/api/admin": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
      "/api/captain": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
      "/api/worker": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});