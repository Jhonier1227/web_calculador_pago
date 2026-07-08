import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResumenTotales } from './ResumenTotales';
import { TipoHora } from '../../lib/calculos/index';
import type { ResumenTipo } from '../../lib/calculos/index';

describe('ResumenTotales', () => {
  it('retorna null si no hay resumen', () => {
    const { container } = render(<ResumenTotales resumen={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('renderiza título', () => {
    const resumen: ResumenTipo[] = [
      { tipoHora: TipoHora.ORDINARIA_DIURNA, cantidadHoras: 4, valorTotal: 33352, recargoPromedio: 0 },
    ];

    render(<ResumenTotales resumen={resumen} />);

    expect(screen.getByText('Resumen por tipo')).toBeInTheDocument();
  });

  it('renderiza badge y valor total para cada tipo', () => {
    const resumen: ResumenTipo[] = [
      { tipoHora: TipoHora.ORDINARIA_DIURNA, cantidadHoras: 4, valorTotal: 33352, recargoPromedio: 0 },
      { tipoHora: TipoHora.EXTRA_NOCTURNA, cantidadHoras: 3, valorTotal: 43774, recargoPromedio: 0.75 },
    ];

    render(<ResumenTotales resumen={resumen} />);

    expect(screen.getByText('ORDINARIA DIURNA')).toBeInTheDocument();
    expect(screen.getByText('$33.352')).toBeInTheDocument();
    expect(screen.getByText('EXTRA NOCTURNA')).toBeInTheDocument();
    expect(screen.getByText('$43.774')).toBeInTheDocument();
  });

  it('renderiza cantidad de horas y recargo promedio', () => {
    const resumen: ResumenTipo[] = [
      { tipoHora: TipoHora.EXTRA_DIURNA, cantidadHoras: 2, valorTotal: 20845, recargoPromedio: 0.25 },
    ];

    render(<ResumenTotales resumen={resumen} />);

    expect(screen.getByText('2h × recargo 25%')).toBeInTheDocument();
  });
});
