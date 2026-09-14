export interface StoredAuth {
  token: string;
  userId: string;
  username: string;
  displayName: string;
  mustChangePassword: boolean;
}

const STORAGE_KEY = 'myfinance_auth';

export const readAuth = (): StoredAuth | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredAuth) : null;
  } catch {
    return null;
  }
};

export const writeAuth = (auth: StoredAuth) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
};

export const clearAuth = () => {
  localStorage.removeItem(STORAGE_KEY);
};
