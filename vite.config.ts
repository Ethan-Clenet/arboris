import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  // Prisma ships a native query engine; keep it external so Vite never tries
  // to bundle it into the server (or client) build.
  ssr: {
    external: ['@prisma/client', 'prisma'],
  },
  plugins: [devtools(), tailwindcss(), tanstackStart(), nitro({ preset: 'vercel' }), viteReact()],
})

export default config
