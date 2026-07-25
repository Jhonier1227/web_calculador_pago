import React from 'react';
import { MacetaIzquierda } from './MacetaIzquierda';

export const MacetaDerecha = React.memo(() => {
  return (
    <div style={{ transform: 'scaleX(-1)' }}>
      <MacetaIzquierda />
    </div>
  );
});

MacetaDerecha.displayName = 'MacetaDerecha';
