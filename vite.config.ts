import { fileURLToPath, URL } from 'node:url';
import dns from 'node:dns';
import process from 'node:process';
import { ConfigEnv, defineConfig, loadEnv, Plugin, UserConfigExport } from 'vite';
import react from '@vitejs/plugin-react-swc';
import mkcert from 'vite-plugin-mkcert';
import { VitePWA } from 'vite-plugin-pwa';
import { createPwaConfig } from './config/pwa.ts';
import { visualizer } from 'rollup-plugin-visualizer';
import sri from './plugins/sri';
import { patch } from './plugins/patch.ts';
import { createProxyConfig } from './config/proxy.ts';
import { normalizeSourcemapValue } from './utility.ts';

// @see: https://vitejs.dev/config/server-options.html#server-host
dns.setDefaultResultOrder('verbatim');

// https://vitejs.dev/config/
export default function(config: ConfigEnv): UserConfigExport {
  // load .env
  const env = loadEnv(config.mode, process.cwd(), '');
  const domain = new URL(env.VITE_APP_URL || 'https://admin.r0.test');

  return defineConfig({
    plugins: [
      patch([
        {
          pattern: 'node_modules/@formily/json-schema/esm/compiler.js',
          to: '.patch/@formily/json-schema/compiler.ts',
        },
      ]),
      mkcert({
        source: 'coding',
      }),
      react(),
      // https://vite-pwa-org.netlify.app/guide/cookbook.html
      VitePWA(createPwaConfig(env, config)),
      visualizer({
        gzipSize: true,
        // sourcemap: true,
        // filename: 'dist/stats.html',
        template: 'treemap',
      }) as Plugin,
      sri({
        algorithms: ['sha256'],
      }),
    ],
    esbuild: {
      legalComments: 'none',
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      host: domain.hostname,
      // https: true,
      strictPort: true,
      // https://vite.dev/config/server-options#server-proxy
      // https://github.com/http-party/node-http-proxy#options
      proxy: createProxyConfig(env, config),
    },
    // @link: https://vite.dev/config/build-options.html
    build: {
      sourcemap: normalizeSourcemapValue(env.VITE_SOURCE_MAP),
      // generate .vite/manifest.json in outDir
      manifest: true,
      assetsInlineLimit: 0,
      rollupOptions: {
        output: {
          // https://rollupjs.org/guide/en/#outputmanualchunks
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // Split vendor chunks into separate files
              return 'vendor';
            }
          },
        },
      },
    },
  });
}
