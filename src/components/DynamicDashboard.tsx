import { useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  Award,
  RotateCcw,
  ShieldAlert,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  BoxId,
  Employee,
  FlightRisk,
  NineBoxModelConfig,
  SuccessionReadiness,
} from '../types/talent';
import {
  BOX_COLOR_STYLES,
  computeAnalytics,
  getBoxDefinition,
  getBoxId,
  getInitials,
} from '../utils/nineBox';

interface DynamicDashboardProps {
  employees: Employee[];
  modelConfig: NineBoxModelConfig;
  onSelectEmployee: (employee: Employee) => void;
  onGoToMatrix: () => void;
}

type DrillFilter =
  | { type: 'all'; label: string }
  | { type: 'stars'; label: string }
  | { type: 'readyNow'; label: string }
  | { type: 'criticalRetention'; label: string }
  | { type: 'box'; boxId: BoxId; label: string }
  | { type: 'department'; department: string; label: string };

export function DynamicDashboard({
  employees,
  modelConfig,
  onSelectEmployee,
  onGoToMatrix,
}: DynamicDashboardProps) {
  const analytics = computeAnalytics(employees, modelConfig);
  const [drill, setDrill] = useState<DrillFilter>({
    type: 'all',
    label: 'Todos los colaboradores filtrados',
  });
  const [hoveredEmpId, setHoveredEmpId] = useState<string | null>(null);

  const drillEmployees = employees.filter((emp) => {
    if (drill.type === 'all') return true;
    if (drill.type === 'stars') {
      return (
        getBoxDefinition(modelConfig, emp.performance, emp.potential).strategicGroup ===
        'Estrella y Alto Potencial'
      );
    }
    if (drill.type === 'readyNow') {
      return emp.readiness === SuccessionReadiness.ReadyNow;
    }
    if (drill.type === 'criticalRetention') {
      return (
        emp.flightRisk === FlightRisk.High &&
        (emp.performance >= 2 || emp.potential >= 2)
      );
    }
    if (drill.type === 'box') {
      return getBoxId(emp.performance, emp.potential) === drill.boxId;
    }
    if (drill.type === 'department') {
      return emp.department === drill.department;
    }
    return true;
  });

  if (employees.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
        <h2 className="font-display text-lg font-bold text-slate-900">
          Sin datos para mostrar en el tablero
        </h2>
        <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
          No hay colaboradores que coincidan con los filtros seleccionados. Ajusta los filtros o agrega nuevos perfiles para visualizar las métricas.
        </p>
      </div>
    );
  }

  const maxQuadrantCount = Math.max(
    1,
    ...analytics.quadrants.map((q) => q.count)
  );
  const hoveredEmp = employees.find((e) => e.id === hoveredEmpId) ?? null;

  return (
    <div className="space-y-6">
      {/* 4-Column KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() =>
            setDrill({ type: 'all', label: 'Todos los colaboradores filtrados' })
          }
          className={`text-left bg-white border rounded-xl p-4 transition-colors ${
            drill.type === 'all'
              ? 'border-blue-600 ring-2 ring-blue-600/15'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Talento evaluado</span>
            <Users className="w-4 h-4 text-slate-400" aria-hidden="true" />
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-slate-900 tabular-nums">
            {analytics.total}
          </div>
          <div className="mt-1 text-xs text-slate-600 tabular-nums">
            Prom. Desempeño {analytics.avgPerformanceRating} · Potencial{' '}
            {analytics.avgPotentialRating}
          </div>
        </button>

        <button
          type="button"
          onClick={() =>
            setDrill({
              type: 'stars',
              label: 'Estrellas y Alto Potencial',
            })
          }
          className={`text-left bg-white border rounded-xl p-4 transition-colors ${
            drill.type === 'stars'
              ? 'border-emerald-600 ring-2 ring-emerald-600/15'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Alto potencial y estrellas</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" aria-hidden="true" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-slate-900 tabular-nums">
              {analytics.starAndHighPotPct}%
            </span>
            <span className="text-xs font-medium text-slate-500 tabular-nums">
              ({analytics.starAndHighPotCount} personas)
            </span>
          </div>
          <div className="mt-1 text-xs text-emerald-700 font-medium">
            Cuadrantes superiores derechos
          </div>
        </button>

        <button
          type="button"
          onClick={() =>
            setDrill({
              type: 'readyNow',
              label: 'Sucesores listos ahora',
            })
          }
          className={`text-left bg-white border rounded-xl p-4 transition-colors ${
            drill.type === 'readyNow'
              ? 'border-blue-600 ring-2 ring-blue-600/15'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Listos para sucesión</span>
            <Award className="w-4 h-4 text-blue-700" aria-hidden="true" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-slate-900 tabular-nums">
              {analytics.readyNowCount}
            </span>
            <span className="text-xs font-medium text-slate-500 tabular-nums">
              ({analytics.readyNowPct}% del equipo)
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-600">
            Disponibilidad inmediata de promoción
          </div>
        </button>

        <button
          type="button"
          onClick={() =>
            setDrill({
              type: 'criticalRetention',
              label: 'Alertas de retención prioritaria',
            })
          }
          className={`text-left bg-white border rounded-xl p-4 transition-colors ${
            drill.type === 'criticalRetention'
              ? 'border-rose-600 ring-2 ring-rose-600/15'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Retención crítica</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" aria-hidden="true" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-rose-700 tabular-nums">
              {analytics.criticalRetentionCount}
            </span>
            <span className="text-xs font-medium text-slate-500 tabular-nums">
              de {analytics.highFlightRiskCount} en riesgo alto
            </span>
          </div>
          <div className="mt-1 text-xs text-rose-700 font-medium">
            Talento clave con riesgo de salida
          </div>
        </button>
      </div>

      {/* Main Analytics Row: Quadrant Distribution + Continuous Scatter Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Quadrant Distribution */}
        <section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">
                Distribución por Cuadrante 9-Box
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Haz clic en cualquier barra para filtrar el detalle inferior
              </p>
            </div>
            <button
              type="button"
              onClick={onGoToMatrix}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 whitespace-nowrap shrink-0"
            >
              <span>Abrir matriz</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-2.5 flex-1">
            {analytics.quadrants.map((q) => {
              const style = BOX_COLOR_STYLES[q.box.color];
              const barWidth = Math.round((q.count / maxQuadrantCount) * 100);
              const isSelected = drill.type === 'box' && drill.boxId === q.box.id;
              return (
                <button
                  key={q.box.id}
                  type="button"
                  onClick={() =>
                    setDrill({
                      type: 'box',
                      boxId: q.box.id,
                      label: `Cuadrante: ${q.box.title}`,
                    })
                  }
                  className={`w-full text-left p-2 rounded-lg transition-colors ${
                    isSelected
                      ? 'bg-blue-50/70 ring-1 ring-blue-600'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-2 h-2 rounded-xs shrink-0 ${style.dot}`}
                        aria-hidden="true"
                      />
                      <span className="font-semibold text-slate-900 truncate">
                        {q.box.title}
                      </span>
                      {q.highRiskCount > 0 && (
                        <span className="text-[11px] font-medium text-rose-700 shrink-0 tabular-nums">
                          · {q.highRiskCount} riesgo alto
                        </span>
                      )}
                    </div>
                    <span className="font-mono-nums text-slate-700 font-semibold shrink-0">
                      {q.count} ({q.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-md overflow-hidden">
                    <div
                      className={`h-full rounded-md transition-all duration-300 ${style.accentBar}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Continuous Scatter Map */}
        <section className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900">
              Mapa de Dispersión ({modelConfig.axes.xLabel} vs {modelConfig.axes.yLabel})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Posición exacta por puntaje 1.0–5.0 · Haz clic en un punto para editar
            </p>
          </div>

          <div className="my-4 relative">
            <svg
              viewBox="0 0 360 280"
              className="w-full h-auto overflow-visible"
              role="img"
              aria-label="Gráfico de dispersión de desempeño y potencial"
            >
              {/* 3x3 subtle quadrant backdrop */}
              <rect x="44" y="16" width="300" height="222" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" rx="6" />
              {/* Vertical dividers (1..5 scale, thirds at 2.33 and 3.67) */}
              <line x1="144" y1="16" x2="144" y2="238" stroke="#cbd5e1" strokeDasharray="4 4" />
              <line x1="244" y1="16" x2="244" y2="238" stroke="#cbd5e1" strokeDasharray="4 4" />
              {/* Horizontal dividers */}
              <line x1="44" y1="90" x2="344" y2="90" stroke="#cbd5e1" strokeDasharray="4 4" />
              <line x1="44" y1="164" x2="344" y2="164" stroke="#cbd5e1" strokeDasharray="4 4" />

              {/* Top-right star highlight tint */}
              <rect x="244" y="16" width="100" height="74" fill="#10b981" fillOpacity="0.08" />

              {/* Axis ticks */}
              {[1, 2, 3, 4, 5].map((tick) => {
                const xPos = 44 + ((tick - 1) / 4) * 300;
                const yPos = 238 - ((tick - 1) / 4) * 222;
                return (
                  <g key={tick}>
                    <text
                      x={xPos}
                      y="254"
                      textAnchor="middle"
                      className="fill-slate-500 text-[10px] font-mono"
                    >
                      {tick}.0
                    </text>
                    <text
                      x="36"
                      y={yPos + 3}
                      textAnchor="end"
                      className="fill-slate-500 text-[10px] font-mono"
                    >
                      {tick}.0
                    </text>
                  </g>
                );
              })}

              <text
                x="194"
                y="272"
                textAnchor="middle"
                className="fill-slate-700 text-[11px] font-semibold"
              >
                {modelConfig.axes.xLabel} →
              </text>
              <text
                x="12"
                y="127"
                textAnchor="middle"
                transform="rotate(-90 12 127)"
                className="fill-slate-700 text-[11px] font-semibold"
              >
                {modelConfig.axes.yLabel} ↑
              </text>

              {/* Employee Plot Points */}
              {employees.map((emp) => {
                const cx = 44 + ((Math.min(5, Math.max(1, emp.performanceRating)) - 1) / 4) * 300;
                const cy = 238 - ((Math.min(5, Math.max(1, emp.potentialRating)) - 1) / 4) * 222;
                const isRisk = emp.flightRisk === FlightRisk.High;
                const isHovered = hoveredEmpId === emp.id;

                return (
                  <g
                    key={emp.id}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredEmpId(emp.id)}
                    onMouseLeave={() => setHoveredEmpId(null)}
                    onClick={() => onSelectEmployee(emp)}
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 8 : 6}
                      fill={isRisk ? '#e11d48' : '#1d4ed8'}
                      fillOpacity={0.9}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="min-h-[44px] bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex items-center justify-between gap-2 text-xs">
            {hoveredEmp ? (
              <>
                <div className="min-w-0">
                  <span className="font-bold text-slate-900">{hoveredEmp.name}</span>
                  <span className="text-slate-500"> · {hoveredEmp.department}</span>
                </div>
                <span className="font-mono-nums font-semibold text-slate-700 shrink-0">
                  Des: {hoveredEmp.performanceRating} · Pot: {hoveredEmp.potentialRating}
                </span>
              </>
            ) : (
              <>
                <span className="text-slate-600">
                  Pasa el cursor sobre un punto para ver detalle
                </span>
                <span className="text-slate-500 shrink-0">
                  Azul: Normal · Rojo: Riesgo alto
                </span>
              </>
            )}
          </div>
        </section>
      </div>

      {/* Department Breakdown & Actionable Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="font-display text-base font-bold text-slate-900">
            Salud del Talento por Área
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 mb-4">
            Proporción de Estrella/Alto Potencial, Talento Clave y Atención por departamento
          </p>

          <div className="space-y-3">
            {analytics.departments.map((dept) => {
              const starW = (dept.starAndHighPotCount / dept.total) * 100;
              const coreW = (dept.coreCount / dept.total) * 100;
              const attW = (dept.attentionCount / dept.total) * 100;
              const isSelected =
                drill.type === 'department' && drill.department === dept.department;

              return (
                <button
                  key={dept.department}
                  type="button"
                  onClick={() =>
                    setDrill({
                      type: 'department',
                      department: dept.department,
                      label: `Área: ${dept.department}`,
                    })
                  }
                  className={`w-full text-left p-2.5 rounded-lg border transition-colors ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/40'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        {dept.department}
                      </span>
                      <span className="text-xs text-slate-500 tabular-nums">
                        {dept.total} {dept.total === 1 ? 'persona' : 'personas'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 font-mono-nums">
                      Prom. {dept.avgPerformance} / {dept.avgPotential}
                      {dept.highRiskCount > 0 && (
                        <span className="text-rose-700 font-semibold">
                          {' '}
                          · {dept.highRiskCount} riesgo alto
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-md overflow-hidden flex">
                    {starW > 0 && (
                      <div
                        className="bg-emerald-600 h-full"
                        style={{ width: `${starW}%` }}
                        title={`Estrella / Alto Potencial: ${dept.starAndHighPotCount}`}
                      />
                    )}
                    {coreW > 0 && (
                      <div
                        className="bg-indigo-500 h-full"
                        style={{ width: `${coreW}%` }}
                        title={`Talento Clave: ${dept.coreCount}`}
                      />
                    )}
                    {attW > 0 && (
                      <div
                        className="bg-amber-500 h-full"
                        style={{ width: `${attW}%` }}
                        title={`Desarrollo y Atención: ${dept.attentionCount}`}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center gap-4 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600" aria-hidden="true" />
              Estrella y Alto Potencial
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-indigo-500" aria-hidden="true" />
              Talento Clave y Sólido
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-amber-500" aria-hidden="true" />
              Desarrollo y Atención
            </span>
          </div>
        </section>

        {/* Actionable Retention & Succession Cards */}
        <section className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-5">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-base font-bold text-slate-900">
                Foco de Retención Inmediata
              </h2>
              <AlertTriangle className="w-4 h-4 text-rose-600" aria-hidden="true" />
            </div>
            {analytics.criticalRetentionList.length === 0 ? (
              <p className="text-xs text-slate-500 py-3">
                Sin alertas críticas de fuga en talento medio o alto.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {analytics.criticalRetentionList.slice(0, 4).map((emp) => {
                  const box = getBoxDefinition(modelConfig, emp.performance, emp.potential);
                  return (
                    <button
                      key={emp.id}
                      type="button"
                      onClick={() => onSelectEmployee(emp)}
                      className="w-full py-2.5 flex items-center justify-between gap-2 text-left hover:bg-slate-50 rounded-lg px-1.5 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">
                          {emp.name}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {emp.role} · {box.title}
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-rose-700 whitespace-nowrap shrink-0">
                        Riesgo alto
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-base font-bold text-slate-900">
                Banca de Sucesión (Listo ahora)
              </h2>
              <Award className="w-4 h-4 text-blue-700" aria-hidden="true" />
            </div>
            {analytics.readySuccessionList.length === 0 ? (
              <p className="text-xs text-slate-500 py-3">
                No hay colaboradores marcados como "Listo ahora" para sucesión.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {analytics.readySuccessionList.slice(0, 4).map((emp) => (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => onSelectEmployee(emp)}
                    className="w-full py-2.5 flex items-center justify-between gap-2 text-left hover:bg-slate-50 rounded-lg px-1.5 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900 truncate">
                        {emp.name}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {emp.role} · {emp.department}
                      </div>
                    </div>
                    <span className="text-xs font-mono-nums font-semibold text-blue-700 whitespace-nowrap shrink-0">
                      {emp.performanceRating} / {emp.potentialRating}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Interactive Drill-Down List */}
      <section className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900">
              Detalle Dinámico: {drill.label}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
              {drillEmployees.length}{' '}
              {drillEmployees.length === 1 ? 'colaborador' : 'colaboradores'} en esta vista
            </p>
          </div>
          {drill.type !== 'all' && (
            <button
              type="button"
              onClick={() =>
                setDrill({ type: 'all', label: 'Todos los colaboradores filtrados' })
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Ver todos</span>
            </button>
          )}
        </div>

        {drillEmployees.length === 0 ? (
          <p className="text-sm text-slate-500 py-4">
            No hay colaboradores en esta selección.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                  <th className="py-2.5 pr-4">Colaborador</th>
                  <th className="py-2.5 px-3">Área</th>
                  <th className="py-2.5 px-3">Cuadrante 9-Box</th>
                  <th className="py-2.5 px-3 text-right">Desempeño</th>
                  <th className="py-2.5 px-3 text-right">Potencial</th>
                  <th className="py-2.5 px-3">Riesgo de fuga</th>
                  <th className="py-2.5 pl-3">Sucesión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {drillEmployees.map((emp) => {
                  const box = getBoxDefinition(
                    modelConfig,
                    emp.performance,
                    emp.potential
                  );
                  const style = BOX_COLOR_STYLES[box.color];
                  return (
                    <tr
                      key={emp.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-2.5 pr-4">
                        <button
                          type="button"
                          onClick={() => onSelectEmployee(emp)}
                          className="flex items-center gap-2.5 text-left group"
                        >
                          <span
                            className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${style.softChip}`}
                          >
                            {getInitials(emp.name)}
                          </span>
                          <div>
                            <div className="font-semibold text-slate-900 group-hover:text-blue-700">
                              {emp.name}
                            </div>
                            <div className="text-xs text-slate-500">{emp.role}</div>
                          </div>
                        </button>
                      </td>
                      <td className="py-2.5 px-3 text-xs text-slate-700">
                        {emp.department}
                      </td>
                      <td className="py-2.5 px-3 text-xs font-semibold text-slate-900">
                        {box.title}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono-nums text-xs font-semibold text-slate-800">
                        {emp.performanceRating.toFixed(1)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono-nums text-xs font-semibold text-slate-800">
                        {emp.potentialRating.toFixed(1)}
                      </td>
                      <td className="py-2.5 px-3 text-xs">
                        <span
                          className={`font-semibold ${
                            emp.flightRisk === FlightRisk.High
                              ? 'text-rose-700'
                              : emp.flightRisk === FlightRisk.Medium
                              ? 'text-amber-700'
                              : 'text-slate-600'
                          }`}
                        >
                          {emp.flightRisk}
                        </span>
                      </td>
                      <td className="py-2.5 pl-3 text-xs text-slate-700">
                        {emp.readiness}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
