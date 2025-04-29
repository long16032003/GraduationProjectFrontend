import process from 'node:process';
import { IconResource, VitePWAOptions } from 'vite-plugin-pwa';

const appName: string = process.env.VITE_PWA_APP_NAME || 'r0';
const appShortName: string = process.env.VITE_PWA_APP_NAME || 'r0';
const appDescription: string = process.env.VITE_PWA_APP_DESC || 'r0';

const scope: string = '/';

const icons: IconResource[] = [
  {
    src: 'pwa-64x64.png',
    sizes: '64x64',
    type: 'image/png',
  },
  {
    src: 'pwa-192x192.png',
    sizes: '192x192',
    type: 'image/png',
  },
  {
    src: 'pwa-512x512.png',
    sizes: '512x512',
    type: 'image/png',
  },
  {
    src: 'maskable-icon-512x512.png',
    sizes: '512x512',
    type: 'image/png',
    purpose: 'maskable',
  },
];

export const pwa: Partial<VitePWAOptions> = {
  injectRegister: null,
  strategies: 'injectManifest',
  registerType: 'autoUpdate',
  srcDir: 'src',
  filename: 'sw.ts',
  scope,
  base: scope,

  manifest: {
    id: scope,
    scope,
    name: appName,
    short_name: appShortName,
    description: appDescription,
    theme_color: '#00bd7e',
    icons,
  },

  injectManifest: {
    enableWorkboxModulesLogs: true,
    globPatterns: ['**/*.{js,css,html,png,ico,svg,gif,json,jpg}'],
    maximumFileSizeToCacheInBytes: 3000000, // 3MB
    // navigateFallback: 'index.html',
  },

  devOptions: {
    enabled: process.env.NODE_ENV === 'development',
    // navigateFallbackAllowlist: [/^index.html$/],
    navigateFallback: 'index.html',
    type: 'module',
  },
};
