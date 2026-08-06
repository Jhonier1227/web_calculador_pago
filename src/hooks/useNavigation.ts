import { useState, useCallback } from 'react';

type Seccion = 'turno' | 'periodo' | 'calculadora';

const ORDEN_TABS: Record<Seccion, number> = {
  turno: 0,
  periodo: 1,
  calculadora: 2,
} as const;

export function useNavigation() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('periodo');
  const [direccionSlide, setDireccionSlide] = useState<'izquierda' | 'derecha'>('derecha');
  const [animando, setAnimando] = useState(false);

  const cambiarSeccion = useCallback((nueva: Seccion) => {
    if (nueva === seccionActiva || animando) return;

    const direccion = ORDEN_TABS[nueva] > ORDEN_TABS[seccionActiva] ? 'derecha' : 'izquierda';

    setDireccionSlide(direccion);
    setAnimando(true);
    setSeccionActiva(nueva);

    setTimeout(() => {
      setAnimando(false);
    }, 350);
  }, [seccionActiva, animando]);

  return {
    seccionActiva,
    direccionSlide,
    animando,
    cambiarSeccion,
  };
}