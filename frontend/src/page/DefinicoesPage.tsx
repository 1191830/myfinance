import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSettings, useUpdateSettings } from '../hook/useSettings';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { SectionLabel } from '../components/ui/SectionLabel';
import { FormField, formInputClass } from '../components/ui/FormField';
import { getErrorMessage, getFieldErrors } from '../lib/apiError';

const PREFERENCES = [
  { label: 'Moeda', value: 'EUR (€)' },
  { label: 'Idioma', value: 'Português (Portugal)' },
];

export const DefinicoesPage = () => {
  const { data: settings, isLoading, isError, error } = useSettings();
  const updateMutation = useUpdateSettings();

  const [displayName, setDisplayName] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [formError, setFormError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) setDisplayName(settings.displayName);
  }, [settings]);

  const handleSave = () => {
    if (!settings?.id) return;
    if (!displayName.trim()) {
      setFieldError('O nome é obrigatório');
      return;
    }
    setFieldError('');
    setFormError('');
    setSaved(false);
    updateMutation.mutate(
      { id: settings.id, settings: { id: settings.id, displayName: displayName.trim() } },
      {
        onSuccess: () => setSaved(true),
        onError: (err) => {
          const fe = getFieldErrors(err);
          if (fe?.displayName) setFieldError(fe.displayName);
          else setFormError(getErrorMessage(err));
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Definições" />

      {isLoading && <div className="text-[13px] text-faint">A carregar…</div>}
      {isError && <div className="text-[13px] text-expense">{(error as Error).message}</div>}

      {!isLoading && !isError && (
        <>
          <Card className="max-w-md">
            <SectionLabel>Perfil</SectionLabel>
            <div className="mt-3.5 flex flex-col gap-3">
              {formError && <p className="text-xs text-expense">{formError}</p>}
              <FormField label="Nome" error={fieldError}>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    setSaved(false);
                  }}
                  className={formInputClass(!!fieldError)}
                />
              </FormField>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="h-9 self-start rounded-control bg-brand px-4 text-[13px] font-medium text-white hover:bg-brand-strong disabled:opacity-60"
                >
                  Guardar
                </button>
                {saved && <span className="text-xs text-income">Guardado.</span>}
              </div>
            </div>
          </Card>

          <Card className="max-w-md">
            <SectionLabel>Preferências</SectionLabel>
            <div className="mt-3.5 flex flex-col gap-2.5">
              {PREFERENCES.map((p) => (
                <div key={p.label} className="flex items-center justify-between text-[13px]">
                  <span className="text-muted">{p.label}</span>
                  <span className="font-medium text-ink">{p.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="max-w-md">
            <SectionLabel>Atalhos</SectionLabel>
            <div className="mt-3.5 flex flex-col gap-2.5 text-[13px]">
              <Link to="/categories" className="font-medium text-brand hover:text-brand-strong">
                Gerir categorias
              </Link>
              <Link
                to="/recurring-transactions"
                className="font-medium text-brand hover:text-brand-strong"
              >
                Gerir recorrências
              </Link>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
