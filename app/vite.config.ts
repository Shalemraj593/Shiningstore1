import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

export default defineConfig(({ command }) => {
  return {
    base: './',
    // Serve public files from root in dev, but don't copy root files during build
    publicDir: command === 'serve' ? path.resolve(__dirname, '../') : false,
    plugins: [inspectAttr(), react()],
    build: {
      outDir: path.resolve(__dirname, '../'),
      emptyOutDir: false,
    },
    server: {
      port: 3000,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
