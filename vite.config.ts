import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    {
      name: 'rewrite-blog-index',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.url === '/blog' || req.url === '/blog/') {
            req.url = '/blog/index.html';
          }
          next();
        });
      }
    }
  ],
})
