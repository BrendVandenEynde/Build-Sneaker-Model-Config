import { defineConfig } from 'vite';

export default defineConfig({
  base: '/my-threejs-app/', // Customize the base path for deployment
  server: {
    open: true,
    port: 3000, // Specify a custom port for the dev server
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      // You can specify Rollup options here
      input: {
        main: './index.html',
      },
    },
  },
});
