import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

const isBrowserEnv = typeof window !== 'undefined';

beforeEach(() => {
    if (!isBrowserEnv) return;
    localStorage.clear();
    window.location.hash = '';
});

afterEach(() => {
    if (isBrowserEnv) cleanup();
    vi.restoreAllMocks();
});
