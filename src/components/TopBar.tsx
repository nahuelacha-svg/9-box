import { Menu, Plus, Search, X } from 'lucide-react';
import { ViewTab } from '../types/talent';

interface TopBarProps {
  activeTab: ViewTab;
  search: string;
  onSearchChange: (value: string) => void;
  onOpenMobileMenu: () => void;
  onOpenAddEmployee: () => void;
}

const VIEW_TITLES: Record<ViewTab, { title: string; subtitle: string }> = {
  matrix: {
    title: 'Matriz 9-Box de Talento',
    subtitle: 'Arrastra tarjetas entre cuadrantes o haz clic para calibrar',
  },
  dashboard: {
    title: 'Tablero de Control Dinámico',
    subtitle: 'Distribución estratégica, retención crítica y banca de sucesión',
  },
  directory: {
    title: 'Directorio y Calibración',
    subtitle: 'Vista tabular editable para comités de talento',
  },
  customizer: {
    title: 'Personalizar Modelo 9-Box',
    subtitle: 'Adapta nombres, ejes, planes de acción y paleta de colores',
  },
};

export function TopBar({
  activeTab,
  search,
  onSearchChange,
  onOpenMobileMenu,
  onOpenAddEmployee,
}: TopBarProps) {
  const info = VIEW_TITLES[activeTab];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 -ml-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 shrink-0"
          aria-label="Abrir menú de navegación"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1 className="font-display text-base sm:text-lg font-bold text-slate-900 truncate">
            {info.title}
          </h1>
          <p className="hidden sm:block text-xs text-slate-500 truncate">
            {info.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {activeTab !== 'customizer' && (
          <div className="relative hidden md:block w-64">
            <label htmlFor="global-talent-search" className="sr-only">
              Buscar colaborador, cargo o líder
            </label>
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="global-talent-search"
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar nombre, cargo o líder..."
              className="w-full h-9 pl-9 pr-8 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-700"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={onOpenAddEmployee}
          aria-label="Agregar colaborador"
          className="inline-flex items-center gap-1.5 h-9 px-3 sm:px-3.5 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline">Agregar colaborador</span>
          <span className="sm:hidden">Agregar</span>
        </button>
      </div>
    </header>
  );
}
