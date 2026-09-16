import { useState, useCallback } from 'react';

type Seccion = 'turno' | 'periodo' | 'calculadora' | 'privacidad' | 'terminos';
export type { Seccion };

const ORDEN_TABS: Record<Seccion, number> = {
  turno: 0,
  periodo: 1,
  calculadora: 2,
  privacidad: 3,
  terminos: 4,
} as const;

export function useNavigation() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('periodo');
  const [direccionSlide, setDireccionSlide] = useState<'izquierda' | 'derecha'>('derecha');
  const [animando, setAnimando] = useState(false);
  const [seccionAnterior, setSeccionAnterior] = useState<Seccion>('periodo');

  const cambiarSeccion = useCallback((nueva: Seccion) => {
    if (nueva === seccionActiva || animando) return;

    const direccion = ORDEN_TABS[nueva] > ORDEN_TABS[seccionActiva] ? 'derecha' : 'izquierda';

    setSeccionAnterior(seccionActiva);
    setDireccionSlide(direccion);
    setAnimando(true);
    setSeccionActiva(nueva);

    setTimeout(() => {
      setAnimando(false);
    }, 350);
  }, [seccionActiva, animando]);

  const volverAAnterior = useCallback(() => {
    cambiarSeccion(seccionAnterior);
  }, [cambiarSeccion, seccionAnterior]);

  return {
    seccionActiva,
    direccionSlide,
    animando,
    cambiarSeccion,
    seccionAnterior,
    volverAAnterior,
  };
}