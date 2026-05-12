import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envDirCandidates = [
  resolve(__dirname, '../..'),
  resolve(__dirname, '..'),
  __dirname,
]
const envDir = envDirCandidates.find((candidate) => existsSync(resolve(candidate, '.env'))) ?? resolve(__dirname, '..')

// https://vite.dev/config/
export default defineConfig({
  base: './',
  envDir,
  plugins: [react()],
})
