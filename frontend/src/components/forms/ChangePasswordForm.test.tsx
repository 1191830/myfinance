import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChangePasswordForm } from './ChangePasswordForm';
import { changePassword } from '../../service/AuthService';

vi.mock('../../service/AuthService', () => ({
  changePassword: vi.fn(),
}));

const mockedChangePassword = vi.mocked(changePassword);

// The three PasswordField instances share identical structure and, for the two without a
// hint, identical eye-toggle aria-labels — getByLabelText/getByRole alone can't tell them
// apart. Scope to the specific field's own <label> (found by its visible text) instead.
const fieldFor = (labelText: string) => screen.getByText(labelText).closest('label') as HTMLElement;
const getPasswordInput = (labelText: string) => fieldFor(labelText).querySelector('input') as HTMLInputElement;
const getToggleButton = (labelText: string) => within(fieldFor(labelText)).getByRole('button');

const fillFields = async (user: ReturnType<typeof userEvent.setup>, current: string, next: string, confirm: string) => {
  await user.type(getPasswordInput('Palavra-passe atual'), current);
  await user.type(getPasswordInput('Nova palavra-passe'), next);
  await user.type(getPasswordInput('Confirmar nova palavra-passe'), confirm);
};

describe('ChangePasswordForm', () => {
  beforeEach(() => {
    mockedChangePassword.mockReset();
  });

  it('blocks submission when the new password is too short, without calling the backend', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    render(<ChangePasswordForm onSuccess={onSuccess} onCancel={vi.fn()} />);

    await fillFields(user, 'current-pass', 'short', 'short');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByText('A nova palavra-passe deve ter pelo menos 8 carateres.')).toBeInTheDocument();
    expect(mockedChangePassword).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('blocks submission when the passwords do not match, without calling the backend', async () => {
    const user = userEvent.setup();
    render(<ChangePasswordForm onSuccess={vi.fn()} onCancel={vi.fn()} />);

    await fillFields(user, 'current-pass', 'newpassword1', 'newpassword2');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByText('As palavras-passe não coincidem.')).toBeInTheDocument();
    expect(mockedChangePassword).not.toHaveBeenCalled();
  });

  it('surfaces a wrong-current-password error on the right field', async () => {
    mockedChangePassword.mockRejectedValue({
      isAxiosError: true,
      response: { status: 400, data: { currentPassword: 'A palavra-passe atual está incorreta.' } },
    });
    const user = userEvent.setup();
    render(<ChangePasswordForm onSuccess={vi.fn()} onCancel={vi.fn()} />);

    await fillFields(user, 'wrong-current', 'newpassword1', 'newpassword1');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByText('A palavra-passe atual está incorreta.')).toBeInTheDocument();
  });

  it('calls onSuccess after a successful change', async () => {
    mockedChangePassword.mockResolvedValue(undefined);
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    render(<ChangePasswordForm onSuccess={onSuccess} onCancel={vi.fn()} />);

    await fillFields(user, 'current-pass', 'newpassword1', 'newpassword1');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(mockedChangePassword).toHaveBeenCalledWith('current-pass', 'newpassword1');
    await screen.findByRole('button', { name: 'Guardar' }); // wait past the "A guardar…" state
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("the eye toggle flips a field's input type between password and text", async () => {
    const user = userEvent.setup();
    render(<ChangePasswordForm onSuccess={vi.fn()} onCancel={vi.fn()} />);

    const input = getPasswordInput('Palavra-passe atual');
    expect(input).toHaveAttribute('type', 'password');

    await user.click(getToggleButton('Palavra-passe atual'));
    expect(input).toHaveAttribute('type', 'text');

    await user.click(getToggleButton('Palavra-passe atual'));
    expect(input).toHaveAttribute('type', 'password');
  });

  it('shows the forced framing with no Cancel button and a different submit label', () => {
    render(<ChangePasswordForm forced onSuccess={vi.fn()} />);

    expect(screen.getByText('Primeiro acesso')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeInTheDocument();
  });
});
