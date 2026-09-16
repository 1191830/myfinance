import { describe, expect, it } from 'vitest';
import { getFieldErrors, getErrorMessage } from './apiError';

/** Shapes just enough of an AxiosError for axios.isAxiosError to recognize it. */
const axiosError = (status: number, data?: unknown) => ({
  isAxiosError: true,
  response: { status, data },
});

const networkError = () => ({ isAxiosError: true, response: undefined });

describe('getFieldErrors', () => {
  it('reads a 400 object body as a field-error map', () => {
    const err = axiosError(400, { name: 'O nome é obrigatório' });
    expect(getFieldErrors(err)).toEqual({ name: 'O nome é obrigatório' });
  });

  it('returns null for a non-400 status', () => {
    expect(getFieldErrors(axiosError(404, { name: 'x' }))).toBeNull();
  });

  it('returns null when the 400 body is an array, not an object', () => {
    expect(getFieldErrors(axiosError(400, ['x']))).toBeNull();
  });

  it('returns null for a non-axios error', () => {
    expect(getFieldErrors(new Error('boom'))).toBeNull();
  });
});

describe('getErrorMessage', () => {
  it('maps 409 to a duplicate-record message', () => {
    expect(getErrorMessage(axiosError(409))).toBe('Já existe um registo com esse nome.');
  });

  it('maps 404 to a not-found message', () => {
    expect(getErrorMessage(axiosError(404))).toBe('Registo não encontrado.');
  });

  it('maps a response-less axios error to a connectivity message', () => {
    expect(getErrorMessage(networkError())).toBe('Sem ligação ao servidor.');
  });

  it('falls back to the default message for anything else', () => {
    expect(getErrorMessage(new Error('boom'))).toBe('Ocorreu um erro. Tente novamente.');
  });

  it('honours a custom fallback message', () => {
    expect(getErrorMessage(new Error('boom'), 'Custom fallback.')).toBe('Custom fallback.');
  });
});
