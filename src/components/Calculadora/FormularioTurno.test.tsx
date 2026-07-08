import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormularioTurno } from './FormularioTurno';
import type { Turno } from '../../lib/calculos/index';

describe('FormularioTurno', () => {
  const defaultFranjas = [{ inicio: '18:00', fin: '22:00' }];
  const defaultFecha = '2026-06-22';
  const defaultTurno: Turno = {
    fecha: new Date(defaultFecha + 'T12:00:00'),
    franjas: defaultFranjas,
  };

  it('renderiza título y campo de fecha', () => {
    render(
      <FormularioTurno
        fecha={defaultFecha}
        franjas={defaultFranjas}
        onFechaChange={vi.fn()}
        onFranjaChange={vi.fn()}
        onAgregarFranja={vi.fn()}
        onEliminarFranja={vi.fn()}
        turno={defaultTurno}
        onCalcular={vi.fn()}
        jornadaValida={true}
      />,
    );

    expect(screen.getByText('Turno a calcular')).toBeInTheDocument();
    expect(screen.getByLabelText('Fecha del turno')).toHaveValue(defaultFecha);
  });

  it('renderiza inputs de franja con labels sr-only', () => {
    render(
      <FormularioTurno
        fecha={defaultFecha}
        franjas={defaultFranjas}
        onFechaChange={vi.fn()}
        onFranjaChange={vi.fn()}
        onAgregarFranja={vi.fn()}
        onEliminarFranja={vi.fn()}
        turno={defaultTurno}
        onCalcular={vi.fn()}
        jornadaValida={true}
      />,
    );

    expect(screen.getByLabelText('Franja 1 inicio')).toHaveValue('18:00');
    expect(screen.getByLabelText('Franja 1 fin')).toHaveValue('22:00');
  });

  it('llama onFechaChange al cambiar fecha', () => {
    const onFechaChange = vi.fn();

    render(
      <FormularioTurno
        fecha={defaultFecha}
        franjas={defaultFranjas}
        onFechaChange={onFechaChange}
        onFranjaChange={vi.fn()}
        onAgregarFranja={vi.fn()}
        onEliminarFranja={vi.fn()}
        turno={defaultTurno}
        onCalcular={vi.fn()}
        jornadaValida={true}
      />,
    );

    fireEvent.change(screen.getByLabelText('Fecha del turno'), { target: { value: '2026-07-01' } });
    expect(onFechaChange).toHaveBeenCalledWith('2026-07-01');
  });

  it('llama onFranjaChange al cambiar hora de franja', () => {
    const onFranjaChange = vi.fn();

    render(
      <FormularioTurno
        fecha={defaultFecha}
        franjas={defaultFranjas}
        onFechaChange={vi.fn()}
        onFranjaChange={onFranjaChange}
        onAgregarFranja={vi.fn()}
        onEliminarFranja={vi.fn()}
        turno={defaultTurno}
        onCalcular={vi.fn()}
        jornadaValida={true}
      />,
    );

    fireEvent.change(screen.getByLabelText('Franja 1 inicio'), { target: { value: '19:00' } });
    expect(onFranjaChange).toHaveBeenCalledWith(0, 'inicio', '19:00');
  });

  it('muestra botón Añadir franja cuando hay menos de 4', () => {
    render(
      <FormularioTurno
        fecha={defaultFecha}
        franjas={defaultFranjas}
        onFechaChange={vi.fn()}
        onFranjaChange={vi.fn()}
        onAgregarFranja={vi.fn()}
        onEliminarFranja={vi.fn()}
        turno={defaultTurno}
        onCalcular={vi.fn()}
        jornadaValida={true}
      />,
    );

    expect(screen.getByText('Añadir franja')).toBeInTheDocument();
  });

  it('oculta botón Añadir franja cuando hay 4', () => {
    const franjas = [
      { inicio: '08:00', fin: '12:00' },
      { inicio: '13:00', fin: '17:00' },
      { inicio: '18:00', fin: '20:00' },
      { inicio: '21:00', fin: '23:00' },
    ];

    render(
      <FormularioTurno
        fecha={defaultFecha}
        franjas={franjas}
        onFechaChange={vi.fn()}
        onFranjaChange={vi.fn()}
        onAgregarFranja={vi.fn()}
        onEliminarFranja={vi.fn()}
        turno={{ fecha: defaultTurno.fecha, franjas }}
        onCalcular={vi.fn()}
        jornadaValida={true}
      />,
    );

    expect(screen.queryByText('Añadir franja')).not.toBeInTheDocument();
  });

  it('llama onAgregarFranja al hacer click en añadir', () => {
    const onAgregarFranja = vi.fn();

    render(
      <FormularioTurno
        fecha={defaultFecha}
        franjas={defaultFranjas}
        onFechaChange={vi.fn()}
        onFranjaChange={vi.fn()}
        onAgregarFranja={onAgregarFranja}
        onEliminarFranja={vi.fn()}
        turno={defaultTurno}
        onCalcular={vi.fn()}
        jornadaValida={true}
      />,
    );

    fireEvent.click(screen.getByText('Añadir franja'));
    expect(onAgregarFranja).toHaveBeenCalled();
  });

  it('muestra botón eliminar cuando hay más de 1 franja', () => {
    const franjas = [{ inicio: '08:00', fin: '12:00' }, { inicio: '14:00', fin: '18:00' }];

    render(
      <FormularioTurno
        fecha={defaultFecha}
        franjas={franjas}
        onFechaChange={vi.fn()}
        onFranjaChange={vi.fn()}
        onAgregarFranja={vi.fn()}
        onEliminarFranja={vi.fn()}
        turno={{ fecha: defaultTurno.fecha, franjas }}
        onCalcular={vi.fn()}
        jornadaValida={true}
      />,
    );

    expect(screen.getByLabelText('Eliminar franja 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Eliminar franja 2')).toBeInTheDocument();
  });

  it('no muestra botón eliminar cuando hay 1 franja', () => {
    render(
      <FormularioTurno
        fecha={defaultFecha}
        franjas={defaultFranjas}
        onFechaChange={vi.fn()}
        onFranjaChange={vi.fn()}
        onAgregarFranja={vi.fn()}
        onEliminarFranja={vi.fn()}
        turno={defaultTurno}
        onCalcular={vi.fn()}
        jornadaValida={true}
      />,
    );

    expect(screen.queryByLabelText('Eliminar franja 1')).not.toBeInTheDocument();
  });

  it('deshabilita botón Calcular cuando jornada no es válida', () => {
    render(
      <FormularioTurno
        fecha={defaultFecha}
        franjas={defaultFranjas}
        onFechaChange={vi.fn()}
        onFranjaChange={vi.fn()}
        onAgregarFranja={vi.fn()}
        onEliminarFranja={vi.fn()}
        turno={defaultTurno}
        onCalcular={vi.fn()}
        jornadaValida={false}
      />,
    );

    expect(screen.getByText('Calcular')).toBeDisabled();
  });

  it('habilita botón Calcular cuando jornada válida y sin errores', () => {
    render(
      <FormularioTurno
        fecha={defaultFecha}
        franjas={defaultFranjas}
        onFechaChange={vi.fn()}
        onFranjaChange={vi.fn()}
        onAgregarFranja={vi.fn()}
        onEliminarFranja={vi.fn()}
        turno={defaultTurno}
        onCalcular={vi.fn()}
        jornadaValida={true}
      />,
    );

    expect(screen.getByText('Calcular')).not.toBeDisabled();
  });

  it('llama onCalcular al presionar Calcular', () => {
    const onCalcular = vi.fn();

    render(
      <FormularioTurno
        fecha={defaultFecha}
        franjas={defaultFranjas}
        onFechaChange={vi.fn()}
        onFranjaChange={vi.fn()}
        onAgregarFranja={vi.fn()}
        onEliminarFranja={vi.fn()}
        turno={defaultTurno}
        onCalcular={onCalcular}
        jornadaValida={true}
      />,
    );

    fireEvent.click(screen.getByText('Calcular'));
    expect(onCalcular).toHaveBeenCalled();
  });

  it('muestra alert de cruce medianoche cuando fin < inicio', () => {
    const franjas = [{ inicio: '22:00', fin: '02:00' }];
    const turno: Turno = { fecha: defaultTurno.fecha, franjas };

    render(
      <FormularioTurno
        fecha={defaultFecha}
        franjas={franjas}
        onFechaChange={vi.fn()}
        onFranjaChange={vi.fn()}
        onAgregarFranja={vi.fn()}
        onEliminarFranja={vi.fn()}
        turno={turno}
        onCalcular={vi.fn()}
        jornadaValida={true}
      />,
    );

    expect(screen.getByText(/Turno cruza medianoche/)).toBeInTheDocument();
  });
});
