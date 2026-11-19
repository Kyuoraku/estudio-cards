// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import viteConfig from '../../vite.config.js';

const root = resolve(__dirname, '../..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');

// Specs: specs/03-navegacion-layout.md (NAV-07)
describe('configuración de despliegue en GitHub Pages', () => {
    it('[NAV-07] la app se publica bajo /estudio-cards/ y compila a dist/', () => {
        expect(viteConfig.base).toBe('/estudio-cards/');
        expect(viteConfig.build.outDir).toBe('dist');
    });

    it('[NAV-07] public/404.html se copia a la raíz de dist', () => {
        const names = viteConfig.plugins.flat().map(p => p?.name ?? '');
        expect(names.some(n => n.includes('static-copy'))).toBe(true);
    });

    it('[NAV-07] public/404.html redirige a /estudio-cards/', () => {
        const html = read('public/404.html');
        expect(html).toContain('<meta http-equiv="refresh" content="0; url=/estudio-cards/">');
        expect(html).toContain("window.location.href = '/estudio-cards/'");
    });

    it('[NAV-07] el enrutamiento usa HashRouter (compatible con hosting estático)', () => {
        const app = read('src/App.jsx');
        expect(app).toMatch(/<HashRouter\s*>/);
        expect(app).not.toMatch(/<BrowserRouter/);
    });
});
