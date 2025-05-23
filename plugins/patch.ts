import type { PluginOption } from 'vite';
import * as path from 'node:path';
import * as fs from 'node:fs';
import * as ts from 'typescript';

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

interface PatchPluginOptions {
  /**
   * TypeScript compiler options to use
   * If not provided, default options will be used
   */
  compilerOptions?: ts.CompilerOptions;
}

/**
 * Compiles TypeScript to JavaScript (ESM format)
 */
function compileTypeScript(code: string, filePath: string, compilerOptions?: ts.CompilerOptions): string {
  // Add additional compiler options specifically for transpilation
  const transpileOptions: ts.CompilerOptions = {
    ...(compilerOptions || {}),
    // Always ensure these options for proper ESM output
    target: compilerOptions?.target || ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,

    // Bundler mode
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    allowImportingTsExtensions: true,
    isolatedModules: compilerOptions?.isolatedModules || true,
    moduleDetection: ts.ModuleDetectionKind.Force,
    // noEmit: true,
    jsx: ts.JsxEmit.ReactJSX,

    // Linting
    strict: compilerOptions?.strict || true,

    allowJs: compilerOptions?.allowJs || false,
    // Avoid emitting declaration files during transpilation
    declaration: false,
    declarationMap: false,
  };

  // Compile the TypeScript code
  const result = ts.transpileModule(code, {
    compilerOptions: transpileOptions,
    fileName: filePath, // Provide the filename for better error messages
    reportDiagnostics: true,
  });

  // Check for compilation errors
  if (result.diagnostics && result.diagnostics.length > 0) {
    const errors = ts.formatDiagnosticsWithColorAndContext(result.diagnostics, {
      getCurrentDirectory: () => process.cwd(),
      getCanonicalFileName: (fileName) => fileName,
      getNewLine: () => '\n',
    });
    console.error(`\n[vite-plugin-patch] TypeScript compilation errors:\n${errors}`);
  }

  return result.outputText;
}

/**
 * Simple plugin to replace file contents in node_modules
 */
export function patch(replacements: FileReplacement[], options?: PatchPluginOptions): PluginOption {
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

          // Detect if the source file is TypeScript
          const isSourceTypeScript = normalizedId.endsWith('.ts') || normalizedId.endsWith('.tsx')

          // Detect if the replacement file is TypeScript
          const isReplaceTypeScript = match.to.endsWith('.ts') || match.to.endsWith('.tsx');

          if (isSourceTypeScript && !isReplaceTypeScript) {
            console.error(`\n[vite-plugin-patch] Replacement file must be typescript (.ts, .tsx)`);
            return null;
          }

          // Process content based on file type
          let processedContent = content;
          if (isReplaceTypeScript && !isSourceTypeScript) {
            // Transform TypeScript to ESM JavaScript using the loaded compiler options
            processedContent = compileTypeScript(content, match.to, options?.compilerOptions);
            console.log(`\n[vite-plugin-patch] Compiled TypeScript to ESM for: ${match.to}`);
          }

          // Avoid logging multiple times for the same file
          if (!replacedFiles.has(normalizedId)) {
            console.log(`\n[vite-plugin-patch] \n${normalizedId} \n⟶ ${match.to} \n`);
            replacedFiles.add(normalizedId);
          }

          return processedContent;

        } catch (err) {
          console.error(`\n[vite-plugin-patch] Error processing replacement file: ${err}`);
          return null;
        }
      }

      return null; // Let Vite handle other files normally
    },
  };
}
