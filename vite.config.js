import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function dawonApiDevPlugin() {
  return {
    name: 'dawon-api-dev-server',
    configureServer(server) {
      // Load environment variables from .env and .env.local into process.env for local dev
      const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');
      Object.assign(process.env, env);

      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/dawon') && req.method === 'POST') {
          let bodyStr = '';
          req.on('data', chunk => { bodyStr += chunk; });
          req.on('end', async () => {
            try {
              req.body = bodyStr ? JSON.parse(bodyStr) : {};
              const { default: handler } = await import('./api/dawon.js');

              const mockRes = {
                setHeader(k, v) { res.setHeader(k, v); return this; },
                status(code) { res.statusCode = code; return this; },
                json(data) {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                  return this;
                },
                end(data) { res.end(data); return this; }
              };

              await handler(req, mockRes);
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        } else {
          next();
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dawonApiDevPlugin()
  ],
})
