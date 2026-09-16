import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

const renderProtected = () =>
  render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route path="/login" element={<div>login page</div>} />
        <Route path="/change-password" element={<div>change password page</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/protected" element={<div>protected content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe('ProtectedRoute', () => {
  it('redirects to /login when there is no user', () => {
    mockedUseAuth.mockReturnValue({ user: null } as ReturnType<typeof useAuth>);

    renderProtected();

    expect(screen.getByText('login page')).toBeInTheDocument();
  });

  it('redirects to /change-password when the user must change their password', () => {
    mockedUseAuth.mockReturnValue({
      user: { mustChangePassword: true },
    } as unknown as ReturnType<typeof useAuth>);

    renderProtected();

    expect(screen.getByText('change password page')).toBeInTheDocument();
  });

  it('renders the protected content for an authenticated user', () => {
    mockedUseAuth.mockReturnValue({
      user: { mustChangePassword: false },
    } as unknown as ReturnType<typeof useAuth>);

    renderProtected();

    expect(screen.getByText('protected content')).toBeInTheDocument();
  });
});
