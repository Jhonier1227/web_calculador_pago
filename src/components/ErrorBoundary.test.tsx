import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renderiza children cuando no hay error', () => {
    render(
      <ErrorBoundary>
        <p>Contenido normal</p>
      </ErrorBoundary>,
    );

    expect(screen.getByText('Contenido normal')).toBeInTheDocument();
  });

  it('captura error y muestra UI fallback', () => {
    const BuggyComponent = () => {
      throw new Error('Error de prueba');
    };

    render(
      <ErrorBoundary>
        <BuggyComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
    expect(
      screen.getByText(/Ocurrió un error inesperado/),
    ).toBeInTheDocument();
  });

  it('muestra botón Reintentar que permite re-renderizar children normales', () => {
    let shouldThrow = true;
    const BuggyComponent = () => {
      if (shouldThrow) throw new Error('Error de prueba');
      return <p>Contenido recuperado</p>;
    };

    render(
      <ErrorBoundary>
        <BuggyComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();

    shouldThrow = false;
    const retryButton = screen.getByText('Reintentar');
    fireEvent.click(retryButton);

    expect(screen.getByText('Contenido recuperado')).toBeInTheDocument();
  });

  it('usa fallback personalizado si se provee', () => {
    const BuggyComponent = () => {
      throw new Error('Error de prueba');
    };

    render(
      <ErrorBoundary fallback={<p>Fallback personalizado</p>}>
        <BuggyComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Fallback personalizado')).toBeInTheDocument();
  });

  it('tiene role="alert" en el fallback', () => {
    const BuggyComponent = () => {
      throw new Error('Error de prueba');
    };

    render(
      <ErrorBoundary>
        <BuggyComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
