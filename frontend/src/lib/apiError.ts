import axios from 'axios';

/** Reads a 400 Bean-Validation body ({field: message}) as a field-error map, else null. */
export const getFieldErrors = (err: unknown): Record<string, string> | null => {
  if (!axios.isAxiosError(err) || err.response?.status !== 400) return null;
  const data = err.response.data;
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return data as Record<string, string>;
  }
  return null;
};

/** Generic human-readable fallback for an error that isn't a field-error map. */
export const getErrorMessage = (
  err: unknown,
  fallback = 'Ocorreu um erro. Tente novamente.',
): string => {
  if (axios.isAxiosError(err)) {
    if (err.response?.status === 409) return 'Já existe um registo com esse nome.';
    if (err.response?.status === 404) return 'Registo não encontrado.';
    if (!err.response) return 'Sem ligação ao servidor.';
  }
  return fallback;
};
