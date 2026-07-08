import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DesgloseHoras } from './DesgloseHoras';
import { TipoHora } from '../../lib/calculos/index';
import type { HoraCalculada } from '../../lib/calculos/index';

describe('DesgloseHoras', () => {
  const crearHora = (overrides: Partial<HoraCalculada> = {}): HoraCalculada => ({
    horaInicio: new Date('2026-06-22T08:00:00'),
    horaFin: new Date('2026-06-22T09:00:00'),
    tipoHora: TipoHora.ORDINARIA_DIURNA,
    esFestivo: false,
    esNocturna: false,
    dentroDeJornada: true,
    valorHora: 8338,
    recargoAplicado: 0,
    esHoraExtra: false,
    ...overrides,
  });

  it('retorna null si no hay horas', () => {
    const { container } = render(<DesgloseHoras horas={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('renderiza tabla con headers correctos', () => {
    render(<DesgloseHoras horas={[crearHora()]} />);

    expect(screen.getByText('Desglose por hora')).toBeInTheDocument();
    expect(screen.getByText('Hora')).toBeInTheDocument();
    expect(screen.getByText('Día')).toBeInTheDocument();
    expect(screen.getByText('Tipo')).toBeInTheDocument();
    expect(screen.getByText('Noche')).toBeInTheDocument();
    expect(screen.getByText('Festivo')).toBeInTheDocument();
    expect(screen.getByText('Jornada')).toBeInTheDocument();
    expect(screen.getByText('Valor')).toBeInTheDocument();
  });

  it('renderiza fila con datos de hora', () => {
    render(
      <DesgloseHoras
        horas={[
          crearHora({
            horaInicio: new Date('2026-06-22T08:00:00'),
            valorHora: 8338,
          }),
        ]}
      />,
    );

    expect(screen.getByText('08:00')).toBeInTheDocument();
    expect(screen.getByText('$8.338')).toBeInTheDocument();
  });

  it('muestra símbolos para nocturna, festivo y dentro jornada', () => {
    render(
      <DesgloseHoras
        horas={[
          crearHora({
            esNocturna: true,
            esFestivo: true,
            dentroDeJornada: true,
          }),
        ]}
      />,
    );

    // Los caracteres se renderizan como texto
    expect(screen.getByText('🌙')).toBeInTheDocument();
    expect(screen.getByText('🔴')).toBeInTheDocument();
    expect(screen.getByText('✔')).toBeInTheDocument();
  });

  it('muestra badge con tipo de hora', () => {
    render(
      <DesgloseHoras
        horas={[
          crearHora({ tipoHora: TipoHora.EXTRA_NOCTURNA }),
        ]}
      />,
    );

    expect(screen.getByText('EXTRA NOCTURNA')).toBeInTheDocument();
  });

  it('renderiza múltiples horas', () => {
    render(
      <DesgloseHoras
        horas={[
          crearHora({ horaInicio: new Date('2026-06-22T08:00:00') }),
          crearHora({ horaInicio: new Date('2026-06-22T09:00:00') }),
        ]}
      />,
    );

    expect(screen.getByText('08:00')).toBeInTheDocument();
    expect(screen.getByText('09:00')).toBeInTheDocument();
  });
});
