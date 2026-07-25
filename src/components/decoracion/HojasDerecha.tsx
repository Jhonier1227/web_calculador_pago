import React from 'react';
import { HojasIzquierda } from './HojasIzquierda';

export const HojasDerecha = React.memo(({ animandoTransicion = false }: { animandoTransicion?: boolean }) => {
  return <HojasIzquierda animandoTransicion={animandoTransicion} mirrored />;
});

HojasDerecha.displayName = 'HojasDerecha';
