import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import '@/i18n';
import { PasswordStrength, scorePassword } from '@/components/auth/PasswordStrength';
import { renderWithProviders } from '@/test/utils';

describe('scorePassword', () => {
  it('scores an empty password as 0', () => {
    expect(scorePassword('')).toBe(0);
  });

  it('awards one point per satisfied rule', () => {
    expect(scorePassword('abc')).toBe(0);
    expect(scorePassword('abcdefgh')).toBe(1);
    expect(scorePassword('Abcdefgh')).toBe(2);
    expect(scorePassword('Abcdefg1')).toBe(3);
    expect(scorePassword('Abcdefg1!')).toBe(4);
  });

  it('treats a long passphrase as an extra point', () => {
    expect(scorePassword('abcdefghijkl')).toBe(2);
  });
});

describe('<PasswordStrength />', () => {
  it('renders nothing for an empty value', () => {
    const { container } = renderWithProviders(<PasswordStrength value="" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows a qualitative label that tracks the score', () => {
    const { rerender } = renderWithProviders(<PasswordStrength value="Abcdefg1!" />);
    expect(screen.getByText(/Password: Strong/)).toBeInTheDocument();

    rerender(<PasswordStrength value="abcdefgh" />);
    expect(screen.getByText(/Password: Weak/)).toBeInTheDocument();
  });
});
