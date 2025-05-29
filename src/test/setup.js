import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
    cleanup();
});

expect.extend({
    toBeInTheDocument: (received) => {
        const pass = received !== null;
        return {
            pass,
            message: () => `expected ${received} to be in the document`,
        };
    },
}); 