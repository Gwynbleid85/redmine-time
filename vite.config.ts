import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { nitroV2Plugin } from '@tanstack/nitro-v2-vite-plugin'
import { devtools } from '@tanstack/devtools-vite'

const config = defineConfig({
  plugins: [
    nitroV2Plugin({
      preset: "bun",
      serveStatic: "node",
      compatibilityDate: "2025-12-03",
    }),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    devtools(),

  ],
  optimizeDeps: {
    exclude: [
      '@tanstack/react-start',
      '@tanstack/start-server-core',
      '@tanstack/react-router',
      '@tanstack/react-router-devtools',
    ],
  },
})

export default config
