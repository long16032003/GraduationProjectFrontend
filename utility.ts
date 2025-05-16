import { BuildOptions } from 'vite';

export function normalizeSourcemapValue(sourcemap: string): BuildOptions['sourcemap'] {
  if (!sourcemap || sourcemap === 'false' || sourcemap === '0') return false;
  if (sourcemap === 'true' || sourcemap === '1') return true;
  return sourcemap as ('inline' | 'hidden');
}