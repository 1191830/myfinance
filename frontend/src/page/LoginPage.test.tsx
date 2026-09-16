import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { MemoryRouterProps } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import { useAuth } from '../context/AuthContext';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

// FormField's <label> wraps a <span>{label}</span> with no other text, so when a field has
// no hint/error the label's own textContent equals the span's exactly, and plain
// getByLabelText matches both label and span. Scope to the field's own <label> instead.
const getInput = (labelText: string) =>
  screen.getByText(labelText).closest('label')!.querySelector('input') as HTMLInputElement;

const renderLogin = (initialEntries: MemoryRouterProps['initialEntries'] = ['/login']) =>
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/inicio" element={<div>overview page</div>} />
        <Route path="/somewhere" element={<div>somewhere page</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe('LoginPage', () => {
  beforeEach(() => {
    mockedUseAuth.mockReset();
  });

  it('submits the typed username and password', async () => {
    const login = vi.fn().mockResolvedValue(undefined);
    mockedUseAuth.mockReturnValue({ user: null, login } as unknown as ReturnType<typeof useAuth>);
    const user = userEvent.setup();
    renderLogin();

    await user.type(getInput('Utilizador'), 'rui');
    await user.type(getInput('Palavra-passe'), 'changeme123');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(login).toHaveBeenCalledWith('rui', 'changeme123');
    expect(await screen.findByText('overview page')).toBeInTheDocument();
  });

  it('shows a mapped error and does not navigate when login is rejected', async () => {
    const login = vi.fn().mockRejectedValue(new Error('boom'));
    mockedUseAuth.mockReturnValue({ user: null, login } as unknown as ReturnType<typeof useAuth>);
    const user = userEvent.setup();
    renderLogin();

    await user.type(getInput('Utilizador'), 'rui');
    await user.type(getInput('Palavra-passe'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Utilizador ou palavra-passe incorretos.')).toBeInTheDocument();
    expect(screen.queryByText('overview page')).not.toBeInTheDocument();
  });

  it('disables the submit button until both fields are filled', async () => {
    mockedUseAuth.mockReturnValue({ user: null, login: vi.fn() } as unknown as ReturnType<typeof useAuth>);
    const user = userEvent.setup();
    renderLogin();

    const button = screen.getByRole('button', { name: 'Entrar' });
    expect(button).toBeDisabled();

    await user.type(getInput('Utilizador'), 'rui');
    expect(button).toBeDisabled();

    await user.type(getInput('Palavra-passe'), 'changeme123');
    expect(button).not.toBeDisabled();
  });

  it('redirects to /inicio when already authenticated with no redirect target', () => {
    mockedUseAuth.mockReturnValue({
      user: { mustChangePassword: false },
      login: vi.fn(),
    } as unknown as ReturnType<typeof useAuth>);

    renderLogin();

    expect(screen.getByText('overview page')).toBeInTheDocument();
  });

  it('honours location.state.from when already authenticated', () => {
    mockedUseAuth.mockReturnValue({
      user: { mustChangePassword: false },
      login: vi.fn(),
    } as unknown as ReturnType<typeof useAuth>);

    renderLogin([{ pathname: '/login', state: { from: '/somewhere' } }]);

    expect(screen.getByText('somewhere page')).toBeInTheDocument();
  });
});
