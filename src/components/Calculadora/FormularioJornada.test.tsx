import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormularioJornada } from './FormularioJornada';
import type { JornadaPactada } from '../../lib/calculos/index';

describe('FormularioJornada', () => {
  const defaultDias = [1, 2, 3, 4, 5];
  const defaultHorarios: Record<number, { inicio: string; fin: string }> = {
    1: { inicio: '08:00', fin: '17:00' },
    2: { inicio: '08:00', fin: '17:00' },
    3: { inicio: '08:00', fin: '17:00' },
    4: { inicio: '08:00', fin: '17:00' },
    5: { inicio: '08:00', fin: '17:00' },
    6: { inicio: '08:00', fin: '17:00' },
    7: { inicio: '08:00', fin: '17:00' },
  };

  const defaultJornada: JornadaPactada = { dias: defaultDias, horariosPorDia: defaultHorarios };

  it('renderiza título y descripción', () => {
    render(
      <FormularioJornada
        dias={defaultDias}
        horarios={defaultHorarios}
        onToggleDia={vi.fn()}
        onUpdateHorario={vi.fn()}
        jornada={defaultJornada}
      />,
    );

    expect(screen.getByText('Jornada pactada')).toBeInTheDocument();
    expect(
      screen.getByText(/Selecciona los días que trabajas habitualmente/),
    ).toBeInTheDocument();
  });

  it('renderiza botones de días', () => {
    render(
      <FormularioJornada
        dias={defaultDias}
        horarios={defaultHorarios}
        onToggleDia={vi.fn()}
        onUpdateHorario={vi.fn()}
        jornada={defaultJornada}
      />,
    );

    expect(screen.getByRole('button', { name: 'Lun' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mié' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Jue' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Vie' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sáb' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dom' })).toBeInTheDocument();
  });

  it('ejecuta onToggleDia al hacer click en un día', () => {
    const onToggleDia = vi.fn();

    render(
      <FormularioJornada
        dias={defaultDias}
        horarios={defaultHorarios}
        onToggleDia={onToggleDia}
        onUpdateHorario={vi.fn()}
        jornada={defaultJornada}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Lun' }));
    expect(onToggleDia).toHaveBeenCalledWith(1);
  });

  it('renderiza inputs de tiempo por día seleccionado', () => {
    render(
      <FormularioJornada
        dias={defaultDias}
        horarios={defaultHorarios}
        onToggleDia={vi.fn()}
        onUpdateHorario={vi.fn()}
        jornada={defaultJornada}
      />,
    );

    defaultDias.forEach((d) => {
      expect(screen.getByLabelText(`${['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][d - 1]} inicio`)).toBeInTheDocument();
      expect(screen.getByLabelText(`${['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][d - 1]} fin`)).toBeInTheDocument();
    });
  });

  it('actualiza horario al cambiar input de tiempo', () => {
    const onUpdateHorario = vi.fn();

    render(
      <FormularioJornada
        dias={defaultDias}
        horarios={defaultHorarios}
        onToggleDia={vi.fn()}
        onUpdateHorario={onUpdateHorario}
        jornada={defaultJornada}
      />,
    );

    const inicioLun = screen.getByLabelText('Lun inicio');
    fireEvent.change(inicioLun, { target: { value: '09:00' } });
    expect(onUpdateHorario).toHaveBeenCalledWith(1, 'inicio', '09:00');
  });

  it('muestra horas semanales cuando hay días seleccionados', () => {
    render(
      <FormularioJornada
        dias={defaultDias}
        horarios={defaultHorarios}
        onToggleDia={vi.fn()}
        onUpdateHorario={vi.fn()}
        jornada={defaultJornada}
      />,
    );

    expect(screen.getByText(/Horas\/semana:/)).toBeInTheDocument();
  });

  it('muestra mensaje de domingo en jornada cuando día 7 está seleccionado', () => {
    const diasConDomingo = [...defaultDias, 7];

    render(
      <FormularioJornada
        dias={diasConDomingo}
        horarios={defaultHorarios}
        onToggleDia={vi.fn()}
        onUpdateHorario={vi.fn()}
        jornada={{ dias: diasConDomingo, horariosPorDia: defaultHorarios }}
      />,
    );

    expect(
      screen.getByText(/domingo incluido en jornada → sin recargo dominical/),
    ).toBeInTheDocument();
  });
});
