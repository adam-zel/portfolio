/// <reference types="vitest/config" />
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

function originTrialMeta(mode: string): Plugin {
  const env = loadEnv(mode, process.cwd(), '')
  const token = env.VITE_ORIGIN_TRIAL_TOKEN?.trim()

  return {
    name: 'origin-trial-meta',
    transformIndexHtml(html) {
      if (!token) return html
      return html.replace(
        '<head>',
        `<head>\n    <meta http-equiv="origin-trial" content="${token}" />`,
      )
    },
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), originTrialMeta(mode)],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
}))
