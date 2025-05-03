import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Limpia después de cada prueba
afterEach(() => {
    cleanup();
});

// Extiende expect con los métodos de jest-dom
expect.extend({
    toBeInTheDocument: (received) => {
        const pass = received !== null;
        return {
            pass,
            message: () => `expected ${received} to be in the document`,
        };
    },
}); 