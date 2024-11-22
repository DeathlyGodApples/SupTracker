import { defineConfig } from '@vite-pwa/assets-generator';

export default defineConfig({
  preset: {
    name: 'minimal',
    sizes: [64, 192, 512],
    mask: true,
    favicon: true,
    apple: true,
    maskable: true
  },
  images: ['public/icon.svg']
});