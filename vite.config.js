import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ['defaults', 'not IE 11', 'iOS >= 10', 'Android >= 8'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      renderLegacyChunks: true,
      polyfills: [
        'es.promise',
        'es.symbol',
        'es.array.iterator',
      ]
    })
  ],
  build: {
    target: 'es2015', // Support older browsers including Instagram's webview
    polyfillModulePreload: true,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        manualChunks: undefined, // Disable code splitting for better compatibility
      },
    },
  },
})
