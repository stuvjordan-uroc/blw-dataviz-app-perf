import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { makeImpSample } from './build-data'
import { writeFileSync } from 'node:fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'make-imp-data',
      buildStart() {
        const impSample = makeImpSample(1000, [['Democrat'], ['Republican'], ['Independent', 'Other']])
        writeFileSync('src/data/imp.json', JSON.stringify(impSample))
      }
    }
  ],
})
