import { useState } from 'react';
import type { FormEvent } from 'react';
import { FormField, formInputClass } from '../ui/FormField';
import { changePassword } from '../../service/AuthService';
import { getErrorMessage, getFieldErrors } from '../../lib/apiError';

interface ChangePasswordFormProps {
  /** Mandatory first-login framing: no Cancel, different title/submit label. */
  forced?: boolean;
  onSuccess: () => void;
  onCancel?: () => void;
}

const iconProps = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const EyeIcon = () => (
  <svg {...iconProps}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg {...iconProps}>
    <path d="M3 3l18 18" />
    <path d="M6.3 6.3C4 8 2 12 2 12s3.5 7 10 7c1.4 0 2.7-.3 3.8-.8M10.6 5.2A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a15.6 15.6 0 0 1-3.2 4.1" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  </svg>
);

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  autoFocus?: boolean;
  autoComplete?: string;
}

const PasswordField = ({
  label,
  value,
  onChange,
  error,
  hint,
  autoFocus,
  autoComplete,
}: PasswordFieldProps) => {
  const [visible, setVisible] = useState(false);
  return (
    <FormField label={label} error={error}>
      <div className="relative flex">
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          className={`${formInputClass(!!error)} pr-10`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded text-faint hover:bg-[#f2f4f6] hover:text-muted"
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {!error && hint && <span className="text-[11px] text-faint">{hint}</span>}
    </FormField>
  );
};

export const ChangePasswordForm = ({ forced = false, onSuccess, onCancel }: ChangePasswordFormProps) => {
  const [current, setCurrent] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [currentError, setCurrentError] = useState('');
  const [newError, setNewError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setCurrentError('');
    setNewError('');
    setConfirmError('');
    setFormError('');

    if (!current) {
      setCurrentError('A palavra-passe atual é obrigatória.');
      return;
    }
    if (newPw.length < 8) {
      setNewError('A nova palavra-passe deve ter pelo menos 8 carateres.');
      return;
    }
    if (newPw !== confirm) {
      setConfirmError('As palavras-passe não coincidem.');
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword(current, newPw);
      onSuccess();
    } catch (err) {
      const fe = getFieldErrors(err);
      if (fe?.currentPassword) setCurrentError(fe.currentPassword);
      else if (fe?.newPassword) setNewError(fe.newPassword);
      else setFormError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      {forced ? (
        <div>
          <div className="text-[15px] font-semibold text-ink">Primeiro acesso</div>
          <div className="mt-1.5 text-[13px] leading-relaxed text-muted">
            Por segurança, tem de definir uma nova palavra-passe antes de continuar.
          </div>
        </div>
      ) : (
        <div className="text-[15px] font-semibold text-ink">Alterar palavra-passe</div>
      )}

      {formError && <p className="text-xs text-expense">{formError}</p>}

      <PasswordField
        label="Palavra-passe atual"
        value={current}
        onChange={setCurrent}
        error={currentError}
        autoFocus
        autoComplete="current-password"
      />
      <PasswordField
        label="Nova palavra-passe"
        value={newPw}
        onChange={setNewPw}
        error={newError}
        hint="Mínimo 8 carateres."
        autoComplete="new-password"
      />
      <PasswordField
        label="Confirmar nova palavra-passe"
        value={confirm}
        onChange={setConfirm}
        error={confirmError}
        autoComplete="new-password"
      />

      <div className="mt-1.5 flex justify-end gap-2.5">
        {!forced && (
          <button
            type="button"
            onClick={onCancel}
            className="h-9 rounded-control border border-[#d7dbe0] bg-white px-4 text-[13px] font-medium text-ink"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-9 rounded-control bg-brand px-4 text-[13px] font-medium text-white hover:bg-brand-strong disabled:opacity-60"
        >
          {isSubmitting ? 'A guardar…' : forced ? 'Continuar' : 'Guardar'}
        </button>
      </div>
    </form>
  );
};
