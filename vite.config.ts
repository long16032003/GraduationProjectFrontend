import { fileURLToPath, URL } from 'node:url';
import dns from 'node:dns';
import process from 'node:process';
import {ConfigEnv, defineConfig, loadEnv, Plugin, UserConfigExport} from 'vite';
import react from '@vitejs/plugin-react-swc';
import mkcert from 'vite-plugin-mkcert';
import { VitePWA } from 'vite-plugin-pwa';
import { pwa } from './pwa.config';
import { visualizer } from 'rollup-plugin-visualizer';
import sri from './plugins/sri';

// @see: https://vitejs.dev/config/server-options.html#server-host
dns.setDefaultResultOrder('verbatim');

// https://vitejs.dev/config/
export default function(config: ConfigEnv): UserConfigExport {
  // load .env
  const env = loadEnv(config.mode, process.cwd(), '');
  const domain = new URL(env.VITE_APP_URL || 'https://admin.r0.test');

  return defineConfig({
    plugins: [
      mkcert({
        source: 'coding',
      }),
      react(),
      VitePWA(pwa),
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
        // '@lib': fileURLToPath(new URL('./src/_libs', import.meta.url)),
      },
    },
    server: {
      host: domain.hostname,
      // https: true,
      strictPort: true,
    },
    // @link: https://vite.dev/config/build-options.html
    build: {
      // generate .vite/manifest.json in outDir
      manifest: true,
      assetsInlineLimit: 0,
    },
  });
}
