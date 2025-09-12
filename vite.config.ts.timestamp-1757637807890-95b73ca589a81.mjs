// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { NodeGlobalsPolyfillPlugin } from "file:///home/project/node_modules/@esbuild-plugins/node-globals-polyfill/dist/index.js";
import { NodeModulesPolyfillPlugin } from "file:///home/project/node_modules/@esbuild-plugins/node-modules-polyfill/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // This ensures that 'util' and 'buffer' are replaced with their polyfills
      util: "util",
      buffer: "buffer"
    }
  },
  optimizeDeps: {
    exclude: ["lucide-react"],
    esbuildOptions: {
      // Enable esbuild polyfills for Node.js globals and modules
      define: {
        global: "globalThis"
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true
        }),
        NodeModulesPolyfillPlugin()
      ]
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgeyBOb2RlR2xvYmFsc1BvbHlmaWxsUGx1Z2luIH0gZnJvbSAnQGVzYnVpbGQtcGx1Z2lucy9ub2RlLWdsb2JhbHMtcG9seWZpbGwnO1xuaW1wb3J0IHsgTm9kZU1vZHVsZXNQb2x5ZmlsbFBsdWdpbiB9IGZyb20gJ0Blc2J1aWxkLXBsdWdpbnMvbm9kZS1tb2R1bGVzLXBvbHlmaWxsJztcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtyZWFjdCgpXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAvLyBUaGlzIGVuc3VyZXMgdGhhdCAndXRpbCcgYW5kICdidWZmZXInIGFyZSByZXBsYWNlZCB3aXRoIHRoZWlyIHBvbHlmaWxsc1xuICAgICAgdXRpbDogJ3V0aWwnLFxuICAgICAgYnVmZmVyOiAnYnVmZmVyJ1xuICAgIH1cbiAgfSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgZXhjbHVkZTogWydsdWNpZGUtcmVhY3QnXSxcbiAgICBlc2J1aWxkT3B0aW9uczoge1xuICAgICAgLy8gRW5hYmxlIGVzYnVpbGQgcG9seWZpbGxzIGZvciBOb2RlLmpzIGdsb2JhbHMgYW5kIG1vZHVsZXNcbiAgICAgIGRlZmluZToge1xuICAgICAgICBnbG9iYWw6ICdnbG9iYWxUaGlzJ1xuICAgICAgfSxcbiAgICAgIHBsdWdpbnM6IFtcbiAgICAgICAgTm9kZUdsb2JhbHNQb2x5ZmlsbFBsdWdpbih7XG4gICAgICAgICAgcHJvY2VzczogdHJ1ZSxcbiAgICAgICAgICBidWZmZXI6IHRydWUsXG4gICAgICAgIH0pLFxuICAgICAgICBOb2RlTW9kdWxlc1BvbHlmaWxsUGx1Z2luKClcbiAgICAgIF0sXG4gICAgfSxcbiAgfSxcbn0pOyJdLAogICJtYXBwaW5ncyI6ICI7QUFBeU4sU0FBUyxvQkFBb0I7QUFDdFAsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsaUNBQWlDO0FBQzFDLFNBQVMsaUNBQWlDO0FBRzFDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxFQUNqQixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUE7QUFBQSxNQUVMLE1BQU07QUFBQSxNQUNOLFFBQVE7QUFBQSxJQUNWO0FBQUEsRUFDRjtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLGNBQWM7QUFBQSxJQUN4QixnQkFBZ0I7QUFBQTtBQUFBLE1BRWQsUUFBUTtBQUFBLFFBQ04sUUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBLFNBQVM7QUFBQSxRQUNQLDBCQUEwQjtBQUFBLFVBQ3hCLFNBQVM7QUFBQSxVQUNULFFBQVE7QUFBQSxRQUNWLENBQUM7QUFBQSxRQUNELDBCQUEwQjtBQUFBLE1BQzVCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
