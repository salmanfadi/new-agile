// vite.config.ts
import { defineConfig, loadEnv } from "file:///C:/Users/mines/Downloads/agile-warehouse-ui-main%20(2)/agile-warehouse-ui-main/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/mines/Downloads/agile-warehouse-ui-main%20(2)/agile-warehouse-ui-main/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
import { componentTagger } from "file:///C:/Users/mines/Downloads/agile-warehouse-ui-main%20(2)/agile-warehouse-ui-main/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\mines\\Downloads\\agile-warehouse-ui-main (2)\\agile-warehouse-ui-main";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        "/api": {
          target: "https://eeqqfmydjzkzexavwdyr.supabase.co/functions/v1",
          changeOrigin: true,
          rewrite: (path2) => path2.replace(/^\/api/, ""),
          secure: false,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Authorization, Content-Type, apikey"
          },
          configure: (proxy, _options) => {
            proxy.on("error", (err, _req, _res) => {
              console.error("API Proxy error:", err);
            });
            proxy.on("proxyReq", (proxyReq, req, _res) => {
              console.log("Proxying API request to:", req.method, req.url);
              proxyReq.setHeader("Authorization", req.headers.authorization || "");
              proxyReq.setHeader("apikey", env.VITE_SUPABASE_ANON_KEY || "");
              proxyReq.setHeader("Access-Control-Allow-Origin", "*");
            });
            proxy.on("proxyRes", (proxyRes, req, _res) => {
              console.log("Received API response:", proxyRes.statusCode, req.url);
              proxyRes.headers["Access-Control-Allow-Origin"] = "*";
              proxyRes.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS";
              proxyRes.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type, apikey";
            });
          }
        },
        "/functions/v1/functions": {
          target: "https://eeqqfmydjzkzexavwdyr.supabase.co/functions/v1",
          changeOrigin: true,
          secure: false,
          rewrite: (path2) => path2.replace(/^\/functions\/v1\/functions/, ""),
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Authorization, Content-Type, apikey"
          },
          configure: (proxy, _options) => {
            proxy.on("error", (err, _req, _res) => {
              console.error("Proxy error:", err);
            });
            proxy.on("proxyReq", (proxyReq, req, _res) => {
              console.log("Proxying request to:", req.method, req.url);
              proxyReq.setHeader("Authorization", req.headers.authorization || "");
              proxyReq.setHeader("apikey", env.VITE_SUPABASE_ANON_KEY || "");
              proxyReq.setHeader("Access-Control-Allow-Origin", "*");
            });
            proxy.on("proxyRes", (proxyRes, req, _res) => {
              console.log("Received response:", proxyRes.statusCode, req.url);
              proxyRes.headers["Access-Control-Allow-Origin"] = "*";
              proxyRes.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS";
              proxyRes.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type, apikey";
            });
          }
        }
      },
      cors: {
        origin: true,
        credentials: true
      }
    },
    plugins: [
      react(),
      mode === "development" && componentTagger()
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src")
      }
    },
    define: {
      "process.env": {
        VITE_SUPABASE_ANON_KEY: JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
        VITE_SUPABASE_URL: JSON.stringify(env.VITE_SUPABASE_URL)
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtaW5lc1xcXFxEb3dubG9hZHNcXFxcYWdpbGUtd2FyZWhvdXNlLXVpLW1haW4gKDIpXFxcXGFnaWxlLXdhcmVob3VzZS11aS1tYWluXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtaW5lc1xcXFxEb3dubG9hZHNcXFxcYWdpbGUtd2FyZWhvdXNlLXVpLW1haW4gKDIpXFxcXGFnaWxlLXdhcmVob3VzZS11aS1tYWluXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9taW5lcy9Eb3dubG9hZHMvYWdpbGUtd2FyZWhvdXNlLXVpLW1haW4lMjAoMikvYWdpbGUtd2FyZWhvdXNlLXVpLW1haW4vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcbiAgLy8gTG9hZCBlbnZpcm9ubWVudCB2YXJpYWJsZXNcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCAnJyk7XG4gIFxuICByZXR1cm4ge1xuICAgIHNlcnZlcjoge1xuICAgICAgaG9zdDogXCI6OlwiLFxuICAgICAgcG9ydDogODA4MCxcbiAgICAgIHByb3h5OiB7XG4gICAgICAgICcvYXBpJzoge1xuICAgICAgICAgIHRhcmdldDogJ2h0dHBzOi8vZWVxcWZteWRqemt6ZXhhdndkeXIuc3VwYWJhc2UuY28vZnVuY3Rpb25zL3YxJyxcbiAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgICAgcmV3cml0ZTogKHBhdGgpID0+IHBhdGgucmVwbGFjZSgvXlxcL2FwaS8sICcnKSxcbiAgICAgICAgICBzZWN1cmU6IGZhbHNlLFxuICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicsXG4gICAgICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyc6ICdHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBPUFRJT05TJyxcbiAgICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogJ0F1dGhvcml6YXRpb24sIENvbnRlbnQtVHlwZSwgYXBpa2V5JyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGNvbmZpZ3VyZTogKHByb3h5LCBfb3B0aW9ucykgPT4ge1xuICAgICAgICAgICAgcHJveHkub24oJ2Vycm9yJywgKGVyciwgX3JlcSwgX3JlcykgPT4ge1xuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdBUEkgUHJveHkgZXJyb3I6JywgZXJyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcHJveHkub24oJ3Byb3h5UmVxJywgKHByb3h5UmVxLCByZXEsIF9yZXMpID0+IHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1Byb3h5aW5nIEFQSSByZXF1ZXN0IHRvOicsIHJlcS5tZXRob2QsIHJlcS51cmwpO1xuICAgICAgICAgICAgICAvLyBGb3J3YXJkIGFsbCByZXF1ZXN0IGhlYWRlcnNcbiAgICAgICAgICAgICAgcHJveHlSZXEuc2V0SGVhZGVyKCdBdXRob3JpemF0aW9uJywgcmVxLmhlYWRlcnMuYXV0aG9yaXphdGlvbiB8fCAnJyk7XG4gICAgICAgICAgICAgIHByb3h5UmVxLnNldEhlYWRlcignYXBpa2V5JywgZW52LlZJVEVfU1VQQUJBU0VfQU5PTl9LRVkgfHwgJycpO1xuICAgICAgICAgICAgICBwcm94eVJlcS5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsICcqJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHByb3h5Lm9uKCdwcm94eVJlcycsIChwcm94eVJlcywgcmVxLCBfcmVzKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdSZWNlaXZlZCBBUEkgcmVzcG9uc2U6JywgcHJveHlSZXMuc3RhdHVzQ29kZSwgcmVxLnVybCk7XG4gICAgICAgICAgICAgIC8vIEVuc3VyZSBDT1JTIGhlYWRlcnMgYXJlIHNldCBpbiB0aGUgcmVzcG9uc2VcbiAgICAgICAgICAgICAgcHJveHlSZXMuaGVhZGVyc1snQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJ10gPSAnKic7XG4gICAgICAgICAgICAgIHByb3h5UmVzLmhlYWRlcnNbJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnXSA9ICdHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBPUFRJT05TJztcbiAgICAgICAgICAgICAgcHJveHlSZXMuaGVhZGVyc1snQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyddID0gJ0F1dGhvcml6YXRpb24sIENvbnRlbnQtVHlwZSwgYXBpa2V5JztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgICcvZnVuY3Rpb25zL3YxL2Z1bmN0aW9ucyc6IHtcbiAgICAgICAgICB0YXJnZXQ6ICdodHRwczovL2VlcXFmbXlkanpremV4YXZ3ZHlyLnN1cGFiYXNlLmNvL2Z1bmN0aW9ucy92MScsXG4gICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICAgIHNlY3VyZTogZmFsc2UsXG4gICAgICAgICAgcmV3cml0ZTogKHBhdGgpID0+IHBhdGgucmVwbGFjZSgvXlxcL2Z1bmN0aW9uc1xcL3YxXFwvZnVuY3Rpb25zLywgJycpLFxuICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicsXG4gICAgICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyc6ICdHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBPUFRJT05TJyxcbiAgICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogJ0F1dGhvcml6YXRpb24sIENvbnRlbnQtVHlwZSwgYXBpa2V5JyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGNvbmZpZ3VyZTogKHByb3h5LCBfb3B0aW9ucykgPT4ge1xuICAgICAgICAgICAgcHJveHkub24oJ2Vycm9yJywgKGVyciwgX3JlcSwgX3JlcykgPT4ge1xuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdQcm94eSBlcnJvcjonLCBlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBwcm94eS5vbigncHJveHlSZXEnLCAocHJveHlSZXEsIHJlcSwgX3JlcykgPT4ge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZygnUHJveHlpbmcgcmVxdWVzdCB0bzonLCByZXEubWV0aG9kLCByZXEudXJsKTtcbiAgICAgICAgICAgICAgLy8gRm9yd2FyZCBhbGwgcmVxdWVzdCBoZWFkZXJzXG4gICAgICAgICAgICAgIHByb3h5UmVxLnNldEhlYWRlcignQXV0aG9yaXphdGlvbicsIHJlcS5oZWFkZXJzLmF1dGhvcml6YXRpb24gfHwgJycpO1xuICAgICAgICAgICAgICBwcm94eVJlcS5zZXRIZWFkZXIoJ2FwaWtleScsIGVudi5WSVRFX1NVUEFCQVNFX0FOT05fS0VZIHx8ICcnKTtcbiAgICAgICAgICAgICAgcHJveHlSZXEuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCAnKicpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBwcm94eS5vbigncHJveHlSZXMnLCAocHJveHlSZXMsIHJlcSwgX3JlcykgPT4ge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZygnUmVjZWl2ZWQgcmVzcG9uc2U6JywgcHJveHlSZXMuc3RhdHVzQ29kZSwgcmVxLnVybCk7XG4gICAgICAgICAgICAgIC8vIEVuc3VyZSBDT1JTIGhlYWRlcnMgYXJlIHNldCBpbiB0aGUgcmVzcG9uc2VcbiAgICAgICAgICAgICAgcHJveHlSZXMuaGVhZGVyc1snQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJ10gPSAnKic7XG4gICAgICAgICAgICAgIHByb3h5UmVzLmhlYWRlcnNbJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnXSA9ICdHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBPUFRJT05TJztcbiAgICAgICAgICAgICAgcHJveHlSZXMuaGVhZGVyc1snQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyddID0gJ0F1dGhvcml6YXRpb24sIENvbnRlbnQtVHlwZSwgYXBpa2V5JztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgY29yczoge1xuICAgICAgICBvcmlnaW46IHRydWUsXG4gICAgICAgIGNyZWRlbnRpYWxzOiB0cnVlLFxuICAgICAgfSxcbiAgICB9LFxuICAgIHBsdWdpbnM6IFtcbiAgICAgIHJlYWN0KCksXG4gICAgICBtb2RlID09PSAnZGV2ZWxvcG1lbnQnICYmIGNvbXBvbmVudFRhZ2dlcigpLFxuICAgIF0uZmlsdGVyKEJvb2xlYW4pLFxuICAgIHJlc29sdmU6IHtcbiAgICAgIGFsaWFzOiB7XG4gICAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgICAgfSxcbiAgICB9LFxuICAgIGRlZmluZToge1xuICAgICAgJ3Byb2Nlc3MuZW52Jzoge1xuICAgICAgICBWSVRFX1NVUEFCQVNFX0FOT05fS0VZOiBKU09OLnN0cmluZ2lmeShlbnYuVklURV9TVVBBQkFTRV9BTk9OX0tFWSksXG4gICAgICAgIFZJVEVfU1VQQUJBU0VfVVJMOiBKU09OLnN0cmluZ2lmeShlbnYuVklURV9TVVBBQkFTRV9VUkwpXG4gICAgICB9XG4gICAgfVxuICB9O1xufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQW9hLFNBQVMsY0FBYyxlQUFlO0FBQzFjLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFIaEMsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE1BQU07QUFFeEMsUUFBTSxNQUFNLFFBQVEsTUFBTSxRQUFRLElBQUksR0FBRyxFQUFFO0FBRTNDLFNBQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLE9BQU87QUFBQSxRQUNMLFFBQVE7QUFBQSxVQUNOLFFBQVE7QUFBQSxVQUNSLGNBQWM7QUFBQSxVQUNkLFNBQVMsQ0FBQ0EsVUFBU0EsTUFBSyxRQUFRLFVBQVUsRUFBRTtBQUFBLFVBQzVDLFFBQVE7QUFBQSxVQUNSLFNBQVM7QUFBQSxZQUNQLCtCQUErQjtBQUFBLFlBQy9CLGdDQUFnQztBQUFBLFlBQ2hDLGdDQUFnQztBQUFBLFVBQ2xDO0FBQUEsVUFDQSxXQUFXLENBQUMsT0FBTyxhQUFhO0FBQzlCLGtCQUFNLEdBQUcsU0FBUyxDQUFDLEtBQUssTUFBTSxTQUFTO0FBQ3JDLHNCQUFRLE1BQU0sb0JBQW9CLEdBQUc7QUFBQSxZQUN2QyxDQUFDO0FBQ0Qsa0JBQU0sR0FBRyxZQUFZLENBQUMsVUFBVSxLQUFLLFNBQVM7QUFDNUMsc0JBQVEsSUFBSSw0QkFBNEIsSUFBSSxRQUFRLElBQUksR0FBRztBQUUzRCx1QkFBUyxVQUFVLGlCQUFpQixJQUFJLFFBQVEsaUJBQWlCLEVBQUU7QUFDbkUsdUJBQVMsVUFBVSxVQUFVLElBQUksMEJBQTBCLEVBQUU7QUFDN0QsdUJBQVMsVUFBVSwrQkFBK0IsR0FBRztBQUFBLFlBQ3ZELENBQUM7QUFDRCxrQkFBTSxHQUFHLFlBQVksQ0FBQyxVQUFVLEtBQUssU0FBUztBQUM1QyxzQkFBUSxJQUFJLDBCQUEwQixTQUFTLFlBQVksSUFBSSxHQUFHO0FBRWxFLHVCQUFTLFFBQVEsNkJBQTZCLElBQUk7QUFDbEQsdUJBQVMsUUFBUSw4QkFBOEIsSUFBSTtBQUNuRCx1QkFBUyxRQUFRLDhCQUE4QixJQUFJO0FBQUEsWUFDckQsQ0FBQztBQUFBLFVBQ0g7QUFBQSxRQUNGO0FBQUEsUUFDQSwyQkFBMkI7QUFBQSxVQUN6QixRQUFRO0FBQUEsVUFDUixjQUFjO0FBQUEsVUFDZCxRQUFRO0FBQUEsVUFDUixTQUFTLENBQUNBLFVBQVNBLE1BQUssUUFBUSwrQkFBK0IsRUFBRTtBQUFBLFVBQ2pFLFNBQVM7QUFBQSxZQUNQLCtCQUErQjtBQUFBLFlBQy9CLGdDQUFnQztBQUFBLFlBQ2hDLGdDQUFnQztBQUFBLFVBQ2xDO0FBQUEsVUFDQSxXQUFXLENBQUMsT0FBTyxhQUFhO0FBQzlCLGtCQUFNLEdBQUcsU0FBUyxDQUFDLEtBQUssTUFBTSxTQUFTO0FBQ3JDLHNCQUFRLE1BQU0sZ0JBQWdCLEdBQUc7QUFBQSxZQUNuQyxDQUFDO0FBQ0Qsa0JBQU0sR0FBRyxZQUFZLENBQUMsVUFBVSxLQUFLLFNBQVM7QUFDNUMsc0JBQVEsSUFBSSx3QkFBd0IsSUFBSSxRQUFRLElBQUksR0FBRztBQUV2RCx1QkFBUyxVQUFVLGlCQUFpQixJQUFJLFFBQVEsaUJBQWlCLEVBQUU7QUFDbkUsdUJBQVMsVUFBVSxVQUFVLElBQUksMEJBQTBCLEVBQUU7QUFDN0QsdUJBQVMsVUFBVSwrQkFBK0IsR0FBRztBQUFBLFlBQ3ZELENBQUM7QUFDRCxrQkFBTSxHQUFHLFlBQVksQ0FBQyxVQUFVLEtBQUssU0FBUztBQUM1QyxzQkFBUSxJQUFJLHNCQUFzQixTQUFTLFlBQVksSUFBSSxHQUFHO0FBRTlELHVCQUFTLFFBQVEsNkJBQTZCLElBQUk7QUFDbEQsdUJBQVMsUUFBUSw4QkFBOEIsSUFBSTtBQUNuRCx1QkFBUyxRQUFRLDhCQUE4QixJQUFJO0FBQUEsWUFDckQsQ0FBQztBQUFBLFVBQ0g7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLE1BQ0EsTUFBTTtBQUFBLFFBQ0osUUFBUTtBQUFBLFFBQ1IsYUFBYTtBQUFBLE1BQ2Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxNQUFNO0FBQUEsTUFDTixTQUFTLGlCQUFpQixnQkFBZ0I7QUFBQSxJQUM1QyxFQUFFLE9BQU8sT0FBTztBQUFBLElBQ2hCLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxRQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxNQUN0QztBQUFBLElBQ0Y7QUFBQSxJQUNBLFFBQVE7QUFBQSxNQUNOLGVBQWU7QUFBQSxRQUNiLHdCQUF3QixLQUFLLFVBQVUsSUFBSSxzQkFBc0I7QUFBQSxRQUNqRSxtQkFBbUIsS0FBSyxVQUFVLElBQUksaUJBQWlCO0FBQUEsTUFDekQ7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbInBhdGgiXQp9Cg==
