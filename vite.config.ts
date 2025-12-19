<<<<<<< HEAD
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],

=======

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
>>>>>>> 99a7da8f2121b9440cc0997a2fd1d569cd689e6a
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
<<<<<<< HEAD

=======
>>>>>>> 99a7da8f2121b9440cc0997a2fd1d569cd689e6a
  build: {
    target: 'esnext',
    outDir: 'dist',
  },
<<<<<<< HEAD

=======
>>>>>>> 99a7da8f2121b9440cc0997a2fd1d569cd689e6a
  server: {
    port: 3000,
    open: true,
  },
<<<<<<< HEAD

  // 👇 أضف هذا الجزء فقط
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})
=======
});
>>>>>>> 99a7da8f2121b9440cc0997a2fd1d569cd689e6a
