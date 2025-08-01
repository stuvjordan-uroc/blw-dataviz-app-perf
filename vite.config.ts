import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import buildDataPlugin from "./src/data/build/build.js"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    buildDataPlugin()
  ],
})
