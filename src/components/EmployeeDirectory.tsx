import { useState } from 'react';
import { ArrowUpDown, Download, Edit3, Upload } from 'lucide-react';
import {
  Employee,
  FlightRisk,
  LevelScore,
  NineBoxModelConfig,
} from '../types/talent';
import {
  BOX_COLOR_STYLES,
  getBoxDefinition,
  getInitials,
} from '../utils/nineBox';

interface EmployeeDirectoryProps {
  employees: Employee[];
  modelConfig: NineBoxModelConfig;
  onSelectEmployee: (employee: Employee) => void;
  onQuickUpdate: (
    employeeId: string,
    patch: Partial<Pick<Employee, 'performance' | 'potential' | 'flightRisk'>>
  ) => void;
  onOpenImport: () => void;
  onExportCsv: () => void;
}

type SortField = 'name' | 'department' | 'performance' | 'potential' | 'flightRisk';

export function EmployeeDirectory({
  employees,
  modelConfig,
  onSelectEmployee,
  onQuickUpdate,
  onOpenImport,
  onExportCsv,
}: EmployeeDirectoryProps) {
  const [sortField, setSortField] = useState<SortField>('performance');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir(field === 'name' || field === 'department' ? 'asc' : 'desc');
    }
  };

  const sorted = [...employees].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    if (sortField === 'name') return a.name.localeCompare(b.name) * dir;
    if (sortField === 'department') return a.department.localeCompare(b.department) * dir;
    if (sortField === 'performance') return (a.performance - b.performance) * dir;
    if (sortField === 'potential') return (a.potential - b.potential) * dir;
    const riskRank = { [FlightRisk.Low]: 1, [FlightRisk.Medium]: 2, [FlightRisk.High]: 3 };
    return (riskRank[a.flightRisk] - riskRank[b.flightRisk]) * dir;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-bold text-slate-900">
            Directorio Editable de Talento
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
            {employees.length}{' '}
            {employees.length === 1 ? 'registro visible' : 'registros visibles'} · Cambia niveles directamente o edita la ficha completa
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenImport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
          >
            <Upload className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Importar CSV</span>
          </button>
          <button
            type="button"
            onClick={onExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="p-10 text-center text-sm text-slate-500">
          No hay colaboradores que coincidan con los filtros actuales.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4">
                  <button
                    type="button"
                    onClick={() => handleSort('name')}
                    className="inline-flex items-center gap-1 hover:text-slate-900"
                  >
                    <span>Colaborador</span>
                    <ArrowUpDown className="w-3 h-3" aria-hidden="true" />
                  </button>
                </th>
                <th className="py-3 px-3">
                  <button
                    type="button"
                    onClick={() => handleSort('department')}
                    className="inline-flex items-center gap-1 hover:text-slate-900"
                  >
                    <span>Área / Líder</span>
                    <ArrowUpDown className="w-3 h-3" aria-hidden="true" />
                  </button>
                </th>
                <th className="py-3 px-3">Cuadrante 9-Box</th>
                <th className="py-3 px-3">
                  <button
                    type="button"
                    onClick={() => handleSort('performance')}
                    className="inline-flex items-center gap-1 hover:text-slate-900"
                  >
                    <span>{modelConfig.axes.xLabel}</span>
                    <ArrowUpDown className="w-3 h-3" aria-hidden="true" />
                  </button>
                </th>
                <th className="py-3 px-3">
                  <button
                    type="button"
                    onClick={() => handleSort('potential')}
                    className="inline-flex items-center gap-1 hover:text-slate-900"
                  >
                    <span>{modelConfig.axes.yLabel}</span>
                    <ArrowUpDown className="w-3 h-3" aria-hidden="true" />
                  </button>
                </th>
                <th className="py-3 px-3">
                  <button
                    type="button"
                    onClick={() => handleSort('flightRisk')}
                    className="inline-flex items-center gap-1 hover:text-slate-900"
                  >
                    <span>Riesgo fuga</span>
                    <ArrowUpDown className="w-3 h-3" aria-hidden="true" />
                  </button>
                </th>
                <th className="py-3 px-4 text-right">Ficha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {sorted.map((emp) => {
                const box = getBoxDefinition(
                  modelConfig,
                  emp.performance,
                  emp.potential
                );
                const style = BOX_COLOR_STYLES[box.color];
                return (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${style.softChip}`}
                        >
                          {getInitials(emp.name)}
                        </span>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 truncate">
                            {emp.name}
                          </div>
                          <div className="text-xs text-slate-500 truncate">
                            {emp.role}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-xs">
                      <div className="font-medium text-slate-800">{emp.department}</div>
                      <div className="text-slate-500">Líder: {emp.manager}</div>
                    </td>
                    <td className="py-2.5 px-3 text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                        <span
                          className={`w-2 h-2 rounded-xs shrink-0 ${style.dot}`}
                          aria-hidden="true"
                        />
                        <span>{box.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {emp.readiness}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <label className="sr-only" htmlFor={`dir-perf-${emp.id}`}>
                        Desempeño de {emp.name}
                      </label>
                      <select
                        id={`dir-perf-${emp.id}`}
                        value={emp.performance}
                        onChange={(e) =>
                          onQuickUpdate(emp.id, {
                            performance: Number(e.target.value) as LevelScore,
                          })
                        }
                        className="h-8 px-2 text-xs bg-white border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:border-blue-600"
                      >
                        <option value={1}>1 · {modelConfig.axes.xScales[1]}</option>
                        <option value={2}>2 · {modelConfig.axes.xScales[2]}</option>
                        <option value={3}>3 · {modelConfig.axes.xScales[3]}</option>
                      </select>
                    </td>
                    <td className="py-2.5 px-3">
                      <label className="sr-only" htmlFor={`dir-pot-${emp.id}`}>
                        Potencial de {emp.name}
                      </label>
                      <select
                        id={`dir-pot-${emp.id}`}
                        value={emp.potential}
                        onChange={(e) =>
                          onQuickUpdate(emp.id, {
                            potential: Number(e.target.value) as LevelScore,
                          })
                        }
                        className="h-8 px-2 text-xs bg-white border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:border-blue-600"
                      >
                        <option value={1}>1 · {modelConfig.axes.yScales[1]}</option>
                        <option value={2}>2 · {modelConfig.axes.yScales[2]}</option>
                        <option value={3}>3 · {modelConfig.axes.yScales[3]}</option>
                      </select>
                    </td>
                    <td className="py-2.5 px-3">
                      <label className="sr-only" htmlFor={`dir-risk-${emp.id}`}>
                        Riesgo de fuga de {emp.name}
                      </label>
                      <select
                        id={`dir-risk-${emp.id}`}
                        value={emp.flightRisk}
                        onChange={(e) =>
                          onQuickUpdate(emp.id, {
                            flightRisk: e.target.value as FlightRisk,
                          })
                        }
                        className={`h-8 px-2 text-xs bg-white border border-slate-200 rounded-md font-semibold focus:outline-none focus:border-blue-600 ${
                          emp.flightRisk === FlightRisk.High
                            ? 'text-rose-700'
                            : emp.flightRisk === FlightRisk.Medium
                            ? 'text-amber-700'
                            : 'text-slate-700'
                        }`}
                      >
                        <option value={FlightRisk.Low}>Bajo</option>
                        <option value={FlightRisk.Medium}>Medio</option>
                        <option value={FlightRisk.High}>Alto</option>
                      </select>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectEmployee(emp)}
                        aria-label={`Abrir ficha de ${emp.name}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Editar</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
