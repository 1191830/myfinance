import { describe, expect, it, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { login as loginRequest } from '../service/AuthService';
import { clearAuth } from '../lib/authStorage';
import type { StoredAuth } from '../lib/authStorage';

vi.mock('../service/AuthService', () => ({
  login: vi.fn(),
}));

const mockedLogin = vi.mocked(loginRequest);

const sampleAuth: StoredAuth = {
  token: 'token-123',
  userId: 'user-1',
  username: 'rui',
  displayName: 'Rui Marques',
  mustChangePassword: false,
};

describe('AuthContext', () => {
  beforeEach(() => {
    clearAuth();
    mockedLogin.mockReset();
  });

  it('starts with no user when nothing is stored', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    expect(result.current.user).toBeNull();
  });

  it('login stores the response and updates the current user', async () => {
    mockedLogin.mockResolvedValue(sampleAuth);
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      await result.current.login('rui', 'changeme123');
    });

    expect(mockedLogin).toHaveBeenCalledWith('rui', 'changeme123');
    expect(result.current.user).toEqual(sampleAuth);
    expect(JSON.parse(localStorage.getItem('myfinance_auth')!)).toEqual(sampleAuth);
  });

  it('logout clears the current user and storage', async () => {
    mockedLogin.mockResolvedValue(sampleAuth);
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await act(async () => {
      await result.current.login('rui', 'changeme123');
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('myfinance_auth')).toBeNull();
  });

  it('markPasswordChanged flips mustChangePassword to false without a network call', async () => {
    mockedLogin.mockResolvedValue({ ...sampleAuth, mustChangePassword: true });
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await act(async () => {
      await result.current.login('rui', 'changeme123');
    });
    expect(result.current.user?.mustChangePassword).toBe(true);

    act(() => {
      result.current.markPasswordChanged();
    });

    expect(result.current.user?.mustChangePassword).toBe(false);
    expect(mockedLogin).toHaveBeenCalledTimes(1); // no extra network call
    expect(JSON.parse(localStorage.getItem('myfinance_auth')!).mustChangePassword).toBe(false);
  });
});
