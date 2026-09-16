import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// globals: false means RTL's own auto-cleanup (which relies on an ambient afterEach) never
// registers, so renders would otherwise pile up across tests in the same file.
afterEach(cleanup);
