import type { PluginOption } from 'vite';
import * as path from 'node:path';
import * as fs from 'node:fs';

// Other Rollup hooks can be used here as well
// More info: https://rollupjs.org/guide/en/#build-hooks

interface FileReplacement {
  /**
   * Pattern or substring to find file in node_modules
   * Example: 'json-schema/esm/compiler.js'
   */
  pattern: string;

  /**
   * Path to replacement file (relative to project root)
   */
  replacement: string;
}

/**
 * Simple plugin to replace file contents in node_modules
 */
export function replaceFiles(replacements: FileReplacement[]): PluginOption {
  const projectRoot = process.cwd();
  const normalizedReplacements = replacements.map(r => ({
    ...r,
    replacement: path.normalize(path.join(projectRoot, r.replacement))
  }));

  // Cache for replaced files to avoid logging multiple times
  const replacedFiles = new Set<string>();

  return {
    name: 'vite-plugin-replace-files',
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
        // Avoid logging multiple times for the same file
        if (!replacedFiles.has(normalizedId)) {
          console.log(`[vite-plugin-replace-files] Replacing content of ${normalizedId} with ${match.replacement}`);
          replacedFiles.add(normalizedId);
        }

        // Check if replacement file exists
        if (!fs.existsSync(match.replacement)) {
          console.error(`[vite-plugin-replace-files] Replacement file not found: ${match.replacement}`);
          return null;
        }

        // Read and return content of replacement file
        try {
          return fs.readFileSync(match.replacement, 'utf-8');
        } catch (err) {
          console.error(`[vite-plugin-replace-files] Error reading replacement file: ${err}`);
          return null;
        }
      }

      return null; // Let Vite handle other files normally
    }
  };
}