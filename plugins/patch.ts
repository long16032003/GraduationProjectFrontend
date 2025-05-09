import type { PluginOption } from 'vite';
import * as path from 'node:path';
import * as fs from 'node:fs';

// https://rollupjs.org/guide/en/#build-hooks
// https://vite.dev/guide/api-plugin#universal-hooks
// https://vite.dev/guide/api-plugin#vite-specific-hooks

interface FileReplacement {
  /**
   * Pattern or substring to find file in node_modules
   * Example: 'json-schema/esm/compiler.js'
   */
  pattern: string;

  /**
   * Path to replacement file (relative to project root)
   */
  to: string;
}

/**
 * Simple plugin to replace file contents in node_modules
 */
export function patch(replacements: FileReplacement[]): PluginOption {
  const projectRoot = process.cwd();
  const normalizedReplacements = replacements.map(r => ({
    ...r,
    to: path.normalize(path.join(projectRoot, r.to))
  }));

  // Cache for replaced files to avoid logging multiple times
  const replacedFiles = new Set<string>();

  return {
    name: 'vite-plugin-patch',
    enforce: 'pre', // Run before other plugins

    // Load hook to replace file content
    load(id) {
      // Convert path to normalized form and use forward slashes
      const normalizedId = path.normalize(id).replace(/\\/g, '/');

      // Check if file matches any pattern
      const match = normalizedReplacements.find(
        r => normalizedId.includes(r.pattern)
      );

      if (match) {
        // Check if replacement file exists
        if (!fs.existsSync(match.to)) {
          console.error(`\n[vite-plugin-patch] Replacement file not found: ${match.to}`);
          return null;
        }

        try {
          const content = fs.readFileSync(match.to, 'utf-8');

          // Avoid logging multiple times for the same file
          if (!replacedFiles.has(normalizedId)) {
            console.log(`\n[vite-plugin-patch] \n${normalizedId} \n⟶ ${match.to} \n`);
            replacedFiles.add(normalizedId);
          }

          return content;

        } catch (err) {
          console.error(`\n[vite-plugin-patch] Error reading replacement file: ${err}`);
          return null;
        }
      }

      return null; // Let Vite handle other files normally
    }
  };
}
