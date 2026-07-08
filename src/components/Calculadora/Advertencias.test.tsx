import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Advertencias } from './Advertencias';
import type { Advertencia } from '../../lib/calculos/index';

describe('Advertencias', () => {
  it('retorna null si no hay advertencias', () => {
    const { container } = render(<Advertencias advertencias={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('renderiza título y advertencias', () => {
    const advertencias: Advertencia[] = [
      { codigo: 'HORAS_EXTRA_DIARIA_EXCEDIDA', mensaje: 'Más de 2 horas extra en el turno.', severidad: 'warning' },
    ];

    render(<Advertencias advertencias={advertencias} />);

    expect(screen.getByText('Advertencias')).toBeInTheDocument();
    expect(screen.getByText(/HORAS_EXTRA_DIARIA_EXCEDIDA/)).toBeInTheDocument();
    expect(screen.getByText(/Más de 2 horas extra en el turno./)).toBeInTheDocument();
  });

  it('renderiza múltiples advertencias con diferentes severidades', () => {
    const advertencias: Advertencia[] = [
      { codigo: 'INFO_TEST', mensaje: 'Mensaje info.', severidad: 'info' },
      { codigo: 'WARN_TEST', mensaje: 'Mensaje warning.', severidad: 'warning' },
      { codigo: 'ERROR_TEST', mensaje: 'Mensaje error.', severidad: 'error' },
    ];

    render(<Advertencias advertencias={advertencias} />);

    expect(screen.getByText(/INFO_TEST/)).toBeInTheDocument();
    expect(screen.getByText(/WARN_TEST/)).toBeInTheDocument();
    expect(screen.getByText(/ERROR_TEST/)).toBeInTheDocument();
  });
});
