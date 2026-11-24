import { RotateCcw, Search } from 'lucide-react';
import {
  FlightRisk,
  MatrixDensity,
  SuccessionReadiness,
  TalentFilterState,
} from '../types/talent';

interface FilterBarProps {
  filters: TalentFilterState;
  departments: string[];
  onChange: (next: TalentFilterState) => void;
  onReset: () => void;
  density?: MatrixDensity;
  onDensityChange?: (density: MatrixDensity) => void;
  showDensityToggle?: boolean;
}

export function FilterBar({
  filters,
  departments,
  onChange,
  onReset,
  density = 'cards',
  onDensityChange,
  showDensityToggle = false,
}: FilterBarProps) {
  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.department !== 'all' ||
    filters.flightRisk !== 'all' ||
    filters.readiness !== 'all';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2.5 flex-1 min-w-0">
        <div className="relative md:hidden w-full">
          <label htmlFor="mobile-talent-search" className="sr-only">
            Buscar colaborador
          </label>
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="mobile-talent-search"
            type="text"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Buscar nombre, cargo o líder..."
            className="w-full h-9 pl-9 pr-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="grid grid-cols-1 sm:flex sm:flex-wrap sm:items-center gap-2.5">
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <label
              htmlFor="filter-department"
              className="text-xs font-medium text-slate-600 whitespace-nowrap"
            >
              Área
            </label>
            <select
              id="filter-department"
              value={filters.department}
              onChange={(e) => onChange({ ...filters, department: e.target.value })}
              className="h-9 px-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-600 flex-1 sm:flex-initial"
            >
              <option value="all">Todas las áreas</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-2">
            <label
              htmlFor="filter-risk"
              className="text-xs font-medium text-slate-600 whitespace-nowrap"
            >
              Riesgo de fuga
            </label>
            <select
              id="filter-risk"
              value={filters.flightRisk}
              onChange={(e) => onChange({ ...filters, flightRisk: e.target.value })}
              className="h-9 px-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-600 flex-1 sm:flex-initial"
            >
              <option value="all">Todos</option>
              <option value={FlightRisk.High}>Alto</option>
              <option value={FlightRisk.Medium}>Medio</option>
              <option value={FlightRisk.Low}>Bajo</option>
            </select>
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-2">
            <label
              htmlFor="filter-readiness"
              className="text-xs font-medium text-slate-600 whitespace-nowrap"
            >
              Sucesión
            </label>
            <select
              id="filter-readiness"
              value={filters.readiness}
              onChange={(e) => onChange({ ...filters, readiness: e.target.value })}
              className="h-9 px-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-600 flex-1 sm:flex-initial"
            >
              <option value="all">Cualquiera</option>
              <option value={SuccessionReadiness.ReadyNow}>Listo ahora</option>
              <option value={SuccessionReadiness.In1To2Years}>En 1-2 años</option>
              <option value={SuccessionReadiness.Developing}>En desarrollo</option>
              <option value={SuccessionReadiness.NotApplicable}>No aplica</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center justify-center gap-1.5 h-9 px-3 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Limpiar filtros</span>
            </button>
          )}
        </div>
      </div>

      {showDensityToggle && onDensityChange && (
        <div
          className="flex items-center self-start lg:self-auto gap-1 p-1 bg-slate-100 rounded-lg shrink-0"
          role="group"
          aria-label="Densidad de tarjetas en matriz"
        >
          <button
            type="button"
            onClick={() => onDensityChange('cards')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              density === 'cards'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Detallada
          </button>
          <button
            type="button"
            onClick={() => onDensityChange('compact')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              density === 'compact'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Compacta
          </button>
        </div>
      )}
    </div>
  );
}
