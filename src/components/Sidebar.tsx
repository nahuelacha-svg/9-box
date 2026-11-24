import {
  Grid3X3,
  BarChart3,
  Users,
  Sliders,
  X,
  Upload,
  Download,
} from 'lucide-react';
import { NineBoxModelConfig, ViewTab } from '../types/talent';

interface SidebarProps {
  activeTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  modelConfig: NineBoxModelConfig;
  totalEmployees: number;
  filteredCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenImport: () => void;
  onExportCsv: () => void;
}

const NAV_ITEMS: Array<{
  id: ViewTab;
  label: string;
  description: string;
  icon: typeof Grid3X3;
}> = [
  {
    id: 'matrix',
    label: 'Matriz 9-Box',
    description: 'Mapa visual e interactivo',
    icon: Grid3X3,
  },
  {
    id: 'dashboard',
    label: 'Tablero Dinámico',
    description: 'KPIs, riesgo y sucesión',
    icon: BarChart3,
  },
  {
    id: 'directory',
    label: 'Directorio de Talento',
    description: 'Tabla editable y filtros',
    icon: Users,
  },
  {
    id: 'customizer',
    label: 'Personalizar Modelo',
    description: 'Cuadrantes, ejes y escalas',
    icon: Sliders,
  },
];

export function Sidebar({
  activeTab,
  onSelectTab,
  modelConfig,
  totalEmployees,
  filteredCount,
  isOpenMobile,
  onCloseMobile,
  onOpenImport,
  onExportCsv,
}: SidebarProps) {
  const navContent = (
    <div className="flex h-full flex-col justify-between bg-white border-r border-slate-200">
      <div>
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="grid grid-cols-3 gap-0.5 p-1.5 rounded-lg bg-blue-700" aria-hidden="true">
              <span className="w-1.5 h-1.5 rounded-[2px] bg-blue-200" />
              <span className="w-1.5 h-1.5 rounded-[2px] bg-blue-100" />
              <span className="w-1.5 h-1.5 rounded-[2px] bg-white" />
              <span className="w-1.5 h-1.5 rounded-[2px] bg-blue-300" />
              <span className="w-1.5 h-1.5 rounded-[2px] bg-blue-100" />
              <span className="w-1.5 h-1.5 rounded-[2px] bg-blue-100" />
              <span className="w-1.5 h-1.5 rounded-[2px] bg-blue-400" />
              <span className="w-1.5 h-1.5 rounded-[2px] bg-blue-300" />
              <span className="w-1.5 h-1.5 rounded-[2px] bg-blue-200" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
              Talento9
            </span>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Cerrar menú lateral"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3 space-y-1" aria-label="Navegación principal">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                  isActive
                    ? 'bg-blue-50 text-blue-900'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-blue-700' : 'text-slate-500'
                  }`}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <div className="text-sm font-semibold leading-tight truncate">
                    {item.label}
                  </div>
                  <div className="text-xs text-slate-500 truncate mt-0.5">
                    {item.description}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="mx-3 mt-4 pt-4 border-t border-slate-200 px-2">
          <div className="text-xs font-semibold text-slate-500">Modelo activo</div>
          <div className="mt-1 text-sm font-semibold text-slate-900 truncate">
            {modelConfig.modelName}
          </div>
          <div className="mt-1.5 text-xs text-slate-600 tabular-nums">
            Mostrando {filteredCount} de {totalEmployees} colaboradores
          </div>
        </div>
      </div>

      <div className="p-3 border-t border-slate-200 space-y-1.5">
        <button
          type="button"
          onClick={() => {
            onOpenImport();
            onCloseMobile();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <Upload className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
          <span className="whitespace-nowrap">Importar CSV</span>
        </button>
        <button
          type="button"
          onClick={onExportCsv}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <Download className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
          <span className="whitespace-nowrap">Exportar CSV</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0">
        {navContent}
      </aside>

      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-72 max-w-[85vw] h-full">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}
