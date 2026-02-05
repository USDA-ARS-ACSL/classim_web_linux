import { TanStackRouterVite } from "@tanstack/router-vite-plugin"
import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vite"
import fs from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), TanStackRouterVite()],
  server: {
    port: 443,
    host: 'arsmdbe3142acsl.usda.net',
    https: {
      key: fs.readFileSync('ARSMDBE3142ACSL.key'),
      cert: fs.readFileSync('ARSMDBE3142ACSL.pem'),
    },
  },
})
