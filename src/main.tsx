// Copyright (c) 2026 Jhonier Stiven Montaño Castillo. Todos los derechos reservados.
// Uso no autorizado de este código está estrictamente prohibido.

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initAnalytics } from './lib/analytics.ts'

initAnalytics()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
