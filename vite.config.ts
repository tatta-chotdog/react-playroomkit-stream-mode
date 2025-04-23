import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // ネットワーク全体からアクセス可能に
    port: 5173, // デフォルトポート
  },
});
