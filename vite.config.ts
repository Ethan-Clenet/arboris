import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  // Driver pg + adaptateur Prisma 7 : rester hors du bundle SSR.
  ssr: {
    external: ['@prisma/client', '@prisma/adapter-pg', 'pg', 'prisma'],
  },
  plugins: [devtools(), tailwindcss(), tanstackStart(), nitro({ preset: 'vercel' }), viteReact()],
})

export default config
