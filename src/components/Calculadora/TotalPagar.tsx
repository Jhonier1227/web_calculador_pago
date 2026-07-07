import { CopyIcon } from '../ui/Icons';

interface TotalPagarProps {
  total: number;
  auxilioTransporte?: number;
}

export function TotalPagar({ total, auxilioTransporte }: TotalPagarProps) {
  const handleCopiar = () => {
    navigator.clipboard.writeText(`$${total.toLocaleString('es-CO')}`);
  };

  return (
    <div className="text-center">
      <p className="text-sm text-slate-500">Total a pagar</p>
      <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
        ${total.toLocaleString('es-CO')}
      </p>
      {auxilioTransporte && auxilioTransporte > 0 && (
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          Incluye ${auxilioTransporte.toLocaleString('es-CO')} de auxilio de transporte
        </p>
      )}
      <button
        type="button"
        onClick={handleCopiar}
        aria-label="Copiar total al portapapeles"
        className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-600 underline hover:text-emerald-500 dark:text-emerald-500 dark:hover:text-emerald-400"
      >
        <CopyIcon className="h-3.5 w-3.5" />
        Copiar total
      </button>
    </div>
  );
}
