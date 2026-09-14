import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { ChangePasswordForm } from '../components/forms/ChangePasswordForm';

export const ChangePasswordPage = () => {
  const { user, markPasswordChanged } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!user.mustChangePassword) {
    return <Navigate to="/inicio" replace />;
  }

  const handleSuccess = () => {
    markPasswordChanged();
    navigate('/inicio', { replace: true });
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
        <ChangePasswordForm forced onSuccess={handleSuccess} />
      </Card>
    </div>
  );
};
