import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { FormField, formInputClass } from '../components/ui/FormField';
import { getErrorMessage } from '../lib/apiError';

export const LoginPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    const redirectTo = (location.state as { from?: string } | null)?.from ?? '/inicio';
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(username, password);
      navigate('/inicio', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Utilizador ou palavra-passe incorretos.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <Card className="w-full max-w-sm">
        <div className="mb-5 flex items-center gap-2.5">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 2 3 7v10l9 5 9-5V7l-9-5Z"
              stroke="var(--color-gold)"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path
              d="M8 12.5l2.6 2.6L16 9.4"
              stroke="var(--color-navy-900)"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-base font-semibold tracking-tight text-ink">myfinance</span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {error && <p className="text-xs text-expense">{error}</p>}
          <FormField label="Utilizador">
            <input
              type="text"
              autoFocus
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={formInputClass()}
            />
          </FormField>
          <FormField label="Palavra-passe">
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={formInputClass()}
            />
          </FormField>
          <button
            type="submit"
            disabled={isSubmitting || !username || !password}
            className="mt-1.5 h-9 rounded-control bg-brand text-[13px] font-medium text-white hover:bg-brand-strong disabled:opacity-60"
          >
            {isSubmitting ? 'A entrar…' : 'Entrar'}
          </button>
        </form>
      </Card>
    </div>
  );
};
