import { sites } from '@openai/sites-vite-plugin';
import tailwindcss from '@tailwindcss/postcss';
import vinext from 'vinext';
import { defineConfig } from 'vite';

// This release processes submitted content in the browser and needs no server bindings.
export default defineConfig({
  server: {
    forwardConsole: false,
  },
  css: { postcss: { plugins: [tailwindcss()] } },
  plugins: [vinext(), sites()],
});
