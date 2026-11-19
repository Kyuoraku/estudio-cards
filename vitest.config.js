import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.js'],
        // Los flujos de integración con MUI pueden tardar varios segundos en runners lentos o cargados.
        testTimeout: 20000,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['src/**/*.{js,jsx}'],
            exclude: [
                'src/**/*.test.{js,jsx}',
                'src/test/**',
                'src/main.jsx',
                // Código muerto, no alcanzable desde la app (ver specs/08-defectos-conocidos.md).
                'src/components/QuizView.jsx',
                'src/components/SubjectList.jsx',
            ],
            thresholds: {
                statements: 90,
                branches: 90,
                functions: 90,
                lines: 90,
            },
        },
    },
});
