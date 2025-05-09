import type { ProxyOptions } from 'vite';

// https://vite.dev/config/server-options#server-proxy
// https://github.com/http-party/node-http-proxy#options
export function createProxyConfig(env: Record<string, string>): Record<string, ProxyOptions> {
  return {
    '/api': {
      target: env.VITE_PROXY_URL,
      secure: false, // allow self-signed cert
      changeOrigin: true,
      cookieDomainRewrite: {
        '*': '',
      },
      rewrite: (path) => path.replace(/^\/api/, ''),
      configure: (proxy) => {
        let startTime: number = 0;
        proxy.on('proxyReq', (proxyReq, req) => {
          startTime = Date.now();
          const originalUrl = `/api${req.url || ''}`;
          const fullTargetUrl = `${proxyReq.protocol || 'https:'}//${proxyReq.getHeader('host')}${proxyReq.path}`;

          console.info(`[proxy][req] ${req.method} ${originalUrl}`);
          console.info(` ↳ Target: ${fullTargetUrl}`);
        });

        proxy.on('proxyRes', (proxyRes, req) => {
          const originalUrl = `/api${req.url || ''}`;
          const duration = Date.now() - (startTime || Date.now());

          console.info(`[proxy][res] ${proxyRes.method} ${originalUrl} ← ${proxyRes.statusCode} (${duration}ms)`);
        });
      },
    },
  };
}