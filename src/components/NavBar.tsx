import { ClockIcon, CalendarIcon, CalculatorIcon } from './ui/Icons';

type Seccion = 'turno' | 'periodo' | 'calculadora';

interface NavBarProps {
  activa: Seccion;
  onChange: (s: Seccion) => void;
}

const items: { id: Seccion; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'turno', label: 'Turno', Icon: ClockIcon },
  { id: 'periodo', label: 'Período', Icon: CalendarIcon },
  { id: 'calculadora', label: 'Calc.', Icon: CalculatorIcon },
];

function NavItem({
  id,
  label,
  Icon,
  activa,
  onChange,
}: {
  id: Seccion;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  activa: boolean;
  onChange: (s: Seccion) => void;
}) {
  const activaCls = 'bg-blue-900/60 text-emerald-400 dark:bg-blue-900/60';
  const inactivaCls = 'text-slate-500 hover:bg-slate-800/50 dark:hover:bg-slate-800/50';

  return (
    <button
      onClick={() => onChange(id)}
      className={`flex flex-col items-center justify-center gap-0.5 rounded-lg p-2 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
        activa ? activaCls : inactivaCls
      }`}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </button>
  );
}

export function NavBar({ activa, onChange }: NavBarProps) {
  return (
    <>
      {/* Sidebar — desktop */}
      <nav
        aria-label="Secciones"
        className="fixed right-0 top-0 z-40 hidden h-screen w-20 flex-col items-center gap-3 border-l border-slate-800 bg-slate-900/80 pt-4 backdrop-blur-sm md:flex"
      >
        {items.map((item) => (
          <NavItem key={item.id} {...item} activa={activa === item.id} onChange={onChange} />
        ))}
      </nav>

      {/* Bottom bar — móvil */}
      <nav
        aria-label="Secciones"
        className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-slate-800 bg-slate-900/90 backdrop-blur-sm md:hidden"
      >
        {items.map((item) => (
          <NavItem key={item.id} {...item} activa={activa === item.id} onChange={onChange} />
        ))}
      </nav>
    </>
  );
}
