import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": "http://localhost:8080",
      "/auth": "http://localhost:8080",
      "/products": "http://localhost:8080",
      "/summaries": "http://localhost:8080",
      "/ping": "http://localhost:8080",
    },
  },
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.jsx?$/, // handle .js and .jsx as JSX
  },
});
