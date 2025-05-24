import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        '/api': {
          target: 'https://eeqqfmydjzkzexavwdyr.supabase.co/functions/v1',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          secure: false,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Authorization, Content-Type, apikey',
          },
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.error('API Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Proxying API request to:', req.method, req.url);
              // Forward all request headers
              proxyReq.setHeader('Authorization', req.headers.authorization || '');
              proxyReq.setHeader('apikey', env.VITE_SUPABASE_ANON_KEY || '');
              proxyReq.setHeader('Access-Control-Allow-Origin', '*');
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received API response:', proxyRes.statusCode, req.url);
              // Ensure CORS headers are set in the response
              proxyRes.headers['Access-Control-Allow-Origin'] = '*';
              proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
              proxyRes.headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type, apikey';
            });
          },
        },
        '/functions/v1/functions': {
          target: 'https://eeqqfmydjzkzexavwdyr.supabase.co/functions/v1',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/functions\/v1\/functions/, ''),
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Authorization, Content-Type, apikey',
          },
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.error('Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Proxying request to:', req.method, req.url);
              // Forward all request headers
              proxyReq.setHeader('Authorization', req.headers.authorization || '');
              proxyReq.setHeader('apikey', env.VITE_SUPABASE_ANON_KEY || '');
              proxyReq.setHeader('Access-Control-Allow-Origin', '*');
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received response:', proxyRes.statusCode, req.url);
              // Ensure CORS headers are set in the response
              proxyRes.headers['Access-Control-Allow-Origin'] = '*';
              proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
              proxyRes.headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type, apikey';
            });
          },
        },
      },
      cors: {
        origin: true,
        credentials: true,
      },
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      'process.env': {
        VITE_SUPABASE_ANON_KEY: JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
        VITE_SUPABASE_URL: JSON.stringify(env.VITE_SUPABASE_URL)
      }
    }
  };
});
