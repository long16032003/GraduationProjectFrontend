import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { promises as fs, readFileSync, statSync } from 'fs';
import { load as loadHtml } from 'cheerio';
import collect from 'collect.js';
import type { Plugin, Manifest } from 'vite';

export type Algorithm = 'sha256' | 'sha384' | 'sha512'

export interface Options {
    /**
     * Which hashing algorithms to use when calculate the integrity hash for each
     * asset in the manifest.
     *
     * @default ['sha384']
     */
    algorithms?: Algorithm[];

    /**
     * Path of the manifest files that should be read and augmented with the
     * integrity hash, relative to `outDir`.
     *
     * @default ['manifest.json', 'manifest-assets.json']
     */
    manifestPaths?: string[];

    selectors?: string[];

    crossOrigin?: 'anonymous' | 'use-credentials';

    indexHtmlPath?: string;

    filesToIgnore?: string[];
}

declare module 'vite' {
    interface ManifestChunk {
        integrity: string;
    }
}

// @link: https://github.com/ElMassimo/vite-plugin-manifest-sri
// @link: https://github.com/FranciscoMendes10866/vite-tiptop-sri
// @link: https://rollupjs.org/plugin-development/#build-hooks

export default function sri(options: Options = {}): Plugin {
    const {
        algorithms = ['sha384'],
        selectors = ['script', 'link[rel=stylesheet]'],
        indexHtmlPath = '/',
        crossOrigin = 'anonymous',
        filesToIgnore = [],
        manifestPaths = [
            '.vite/manifest.json',
            '.vite/manifest-assets.json',
            'manifest.json',
            'manifest-assets.json',
        ],
    } = options;

    let buildDir: string | undefined = undefined;

    return {
        name: 'vite-plugin-manifest-sri',
        apply: 'build',
        enforce: 'post',
        async writeBundle({ dir }) {
            buildDir = dir;
            await Promise.all(manifestPaths.map((path) => augmentManifest(path, algorithms, dir!)));
        },
        closeBundle: async () => {
            if (!buildDir) return;

            const outputFile = `${buildDir}/index.html`;
            const html = await fs.readFile(outputFile);

            const $ = loadHtml(html);

            const manifestPath = manifestPaths.find((path) => statSync(`${buildDir}/${path}`));

            if (!manifestPath) {
                console.warn(
                    'No manifest.json file found. For more detail https://vite.dev/config/build-options.html#build-manifest',
                );
                return;
            }

            const manifest: Manifest | undefined = JSON.parse(readFileSync(`${buildDir}/${manifestPath}`, { encoding: 'utf-8' }));

            const entries = collect(Object.values(manifest || {}).filter((chunk) => chunk.isEntry))
                .keyBy('file')
                .all();

            const elements = $(selectors.join()).get();

            for await (const element of elements) {
                const url = ($(element).attr('href') || $(element).attr('src'))?.replace(indexHtmlPath, '');

                if (!url || filesToIgnore.includes(url)) continue;

                if (url in entries) {
                    const entry = (entries as Record<string, any>)[url];
                    const integrityHash = entry.integrity;

                    $(element).attr('integrity', integrityHash);
                    $(element).attr('crossorigin', crossOrigin);
                }
            }

            await fs.writeFile(outputFile, minifyHtml($.html()));
        },
    };
}

async function augmentManifest(manifestPath: string, algorithms: string[], outDir: string) {
    const resolveInOutDir = (path: string) => resolve(outDir, path);
    manifestPath = resolveInOutDir(manifestPath);

    const manifest: Manifest | undefined = await fs.readFile(manifestPath, 'utf-8').then(JSON.parse, () => undefined);

    if (manifest) {
        await Promise.all(
            Object.values(manifest).map(async (chunk) => {
                chunk.integrity = integrityForAsset(
                    await fs.readFile(resolveInOutDir(chunk.file)),
                    algorithms,
                );
            }),
        );
        await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    }
}

function integrityForAsset(source: Buffer, algorithms: string[]) {
    return algorithms.map((algorithm) => calculateIntegrityHash(source, algorithm)).join(' ');
}

function calculateIntegrityHash(source: Buffer, algorithm: string) {
    const hash = createHash(algorithm).update(source).digest().toString('base64');
    return `${algorithm.toLowerCase()}-${hash}`;
}

const minifyHtml = (html: string) => html.replace(/>(\s+)</g, '><');
