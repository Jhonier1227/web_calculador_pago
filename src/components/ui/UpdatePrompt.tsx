import { useRegisterSW } from 'virtual:pwa-register/react';

export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl) {
      // eslint-disable-next-line no-console
      console.info('SW registrado:', swUrl);
    },
    onRegisterError(error) {
      // eslint-disable-next-line no-console
      console.error('Error registrando SW:', error);
    },
  });

  const cerrar = () => {
    setNeedRefresh(false);
    setOfflineReady(false);
  };

  const actualizar = () => {
    void updateServiceWorker(true);
  };

  if (offlineReady) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed inset-x-4 bottom-20 z-40 mx-auto max-w-md rounded-lg border border-emerald-300 bg-emerald-50 p-3 shadow-lg dark:border-emerald-800 dark:bg-emerald-950 sm:bottom-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
              Aplicación lista para uso sin conexión
            </p>
          </div>
          <button
            type="button"
            onClick={cerrar}
            aria-label="Cerrar notificación"
            className="rounded-md px-2 py-1 text-sm font-medium text-emerald-700 hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-900"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  if (needRefresh) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="fixed inset-x-4 bottom-20 z-40 mx-auto max-w-md rounded-lg border border-amber-300 bg-amber-50 p-3 shadow-lg dark:border-amber-800 dark:bg-amber-950 sm:bottom-4"
      >
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
              Nueva versión disponible
            </p>
            <p className="mt-1 text-xs text-amber-800 dark:text-amber-300">
              Hay una actualización lista para aplicar.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-1">
            <button
              type="button"
              onClick={actualizar}
              className="rounded-md bg-amber-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-amber-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              Actualizar
            </button>
            <button
              type="button"
              onClick={cerrar}
              aria-label="Cerrar notificación de actualización"
              className="rounded-md px-3 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900"
            >
              Más tarde
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
