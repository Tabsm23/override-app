import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { stripeApiPlugin } from './vite-plugin-stripe-api.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), stripeApiPlugin()],
})
