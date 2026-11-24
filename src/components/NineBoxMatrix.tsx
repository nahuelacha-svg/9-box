import { useState, type DragEvent } from 'react';
import { AlertTriangle, Info, Plus, RotateCcw } from 'lucide-react';
import {
  BoxDefinition,
  BoxId,
  Employee,
  FlightRisk,
  LevelScore,
  MatrixDensity,
  NineBoxModelConfig,
} from '../types/talent';
import {
  BOX_COLOR_STYLES,
  MATRIX_COL_ORDER,
  MATRIX_ROW_ORDER,
  getBoxId,
  getInitials,
} from '../utils/nineBox';

interface NineBoxMatrixProps {
  employees: Employee[];
  totalEmployees: number;
  modelConfig: NineBoxModelConfig;
  density: MatrixDensity;
  onSelectEmployee: (employee: Employee) => void;
  onMoveEmployee: (
    employeeId: string,
    performance: LevelScore,
    potential: LevelScore
  ) => void;
  onAddInBox: (performance: LevelScore, potential: LevelScore) => void;
  onResetFilters: () => void;
}

export function NineBoxMatrix({
  employees,
  totalEmployees,
  modelConfig,
  density,
  onSelectEmployee,
  onMoveEmployee,
  onAddInBox,
  onResetFilters,
}: NineBoxMatrixProps) {
  const [draggedEmployeeId, setDraggedEmployeeId] = useState<string | null>(null);
  const [dragOverBoxId, setDragOverBoxId] = useState<BoxId | null>(null);
  const [inspectedBox, setInspectedBox] = useState<BoxDefinition | null>(
    modelConfig.boxes['3-3']
  );

  const grouped = new Map<BoxId, Employee[]>();
  MATRIX_ROW_ORDER.forEach((pot) => {
    MATRIX_COL_ORDER.forEach((perf) => {
      grouped.set(getBoxId(perf, pot), []);
    });
  });

  for (const emp of employees) {
    const id = getBoxId(emp.performance, emp.potential);
    const list = grouped.get(id);
    if (list) list.push(emp);
  }

  const handleDragStart = (e: DragEvent<HTMLButtonElement>, empId: string) => {
    setDraggedEmployeeId(empId);
    e.dataTransfer.setData('text/plain', empId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, boxId: BoxId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverBoxId !== boxId) {
      setDragOverBoxId(boxId);
    }
  };

  const handleDrop = (
    e: DragEvent<HTMLDivElement>,
    performance: LevelScore,
    potential: LevelScore
  ) => {
    e.preventDefault();
    const droppedId = e.dataTransfer.getData('text/plain') || draggedEmployeeId;
    if (droppedId) {
      onMoveEmployee(droppedId, performance, potential);
    }
    setDraggedEmployeeId(null);
    setDragOverBoxId(null);
  };

  const activeInspected = inspectedBox
    ? modelConfig.boxes[inspectedBox.id]
    : modelConfig.boxes['3-3'];

  return (
    <div className="space-y-4">
      {employees.length === 0 && totalEmployees > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900">
              Ningún colaborador coincide con los filtros actuales
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Ajusta los filtros de búsqueda, área, riesgo de fuga o sucesión para volver a visualizar personas en la matriz.
            </p>
          </div>
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Limpiar filtros</span>
          </button>
        </div>
      )}

      {/* Strategy Guide Strip for selected quadrant */}
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`w-2.5 h-2.5 rounded-sm mt-1.5 shrink-0 ${
              BOX_COLOR_STYLES[activeInspected.color].dot
            }`}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="text-sm font-bold text-slate-900">
                Guía RRHH: {activeInspected.title}
              </span>
              <span className="text-xs text-slate-500">
                {activeInspected.subtitle}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              {activeInspected.actionPlan}
            </p>
          </div>
        </div>
        <div className="text-xs text-slate-500 whitespace-nowrap shrink-0">
          Haz clic en <Info className="w-3.5 h-3.5 inline -mt-0.5 mx-0.5" aria-hidden="true" /> de cualquier cuadrante para ver su plan
        </div>
      </div>

      {/* 9-Box Grid Container */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-5 overflow-x-auto">
        <div className="min-w-[820px]">
          <div className="grid grid-cols-[44px_1fr] gap-3">
            {/* Y-Axis Label */}
            <div className="flex items-center justify-center">
              <div className="-rotate-90 whitespace-nowrap text-xs font-bold tracking-wide text-slate-700 uppercase">
                {modelConfig.axes.yLabel} ↑
              </div>
            </div>

            {/* 3x3 Rows */}
            <div className="space-y-3">
              {MATRIX_ROW_ORDER.map((potential) => (
                <div
                  key={potential}
                  className="grid grid-cols-[92px_repeat(3,minmax(0,1fr))] gap-3 items-stretch"
                >
                  {/* Row Scale Label */}
                  <div className="flex flex-col justify-center pr-2 text-right border-r border-slate-200">
                    <span className="text-xs font-bold text-slate-800">
                      {modelConfig.axes.yScales[potential]}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono-nums">
                      Nivel {potential}
                    </span>
                  </div>

                  {/* 3 Performance Columns */}
                  {MATRIX_COL_ORDER.map((performance) => {
                    const boxId = getBoxId(performance, potential);
                    const box = modelConfig.boxes[boxId];
                    const style = BOX_COLOR_STYLES[box.color];
                    const boxEmployees = grouped.get(boxId) ?? [];
                    const pct =
                      employees.length > 0
                        ? Math.round((boxEmployees.length / employees.length) * 100)
                        : 0;
                    const isDragTarget = dragOverBoxId === boxId;

                    return (
                      <div
                        key={boxId}
                        data-testid={`nine-box-cell-${boxId}`}
                        onDragOver={(e) => handleDragOver(e, boxId)}
                        onDragLeave={() => {
                          if (dragOverBoxId === boxId) setDragOverBoxId(null);
                        }}
                        onDrop={(e) => handleDrop(e, performance, potential)}
                        className={`flex flex-col rounded-xl border p-3 min-h-[195px] transition-all ${
                          style.cellBg
                        } ${
                          isDragTarget
                            ? 'border-blue-600 ring-2 ring-blue-600/25'
                            : style.cellBorder
                        }`}
                      >
                        {/* Cell Header */}
                        <div className="flex items-start justify-between gap-2 mb-2.5">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h2
                                className={`font-display text-sm font-bold leading-snug truncate ${style.headerText}`}
                                title={box.title}
                              >
                                {box.title}
                              </h2>
                            </div>
                            <div className="text-[11px] text-slate-600 tabular-nums mt-0.5">
                              {boxEmployees.length}{' '}
                              {boxEmployees.length === 1 ? 'persona' : 'personas'} · {pct}%
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setInspectedBox(box)}
                              className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-white/70 transition-colors"
                              aria-label={`Ver recomendación de ${box.title}`}
                              title="Ver recomendación de RRHH"
                            >
                              <Info className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onAddInBox(performance, potential)}
                              className="p-1 rounded-md text-slate-600 hover:text-blue-700 hover:bg-white/80 transition-colors"
                              aria-label={`Agregar colaborador en ${box.title}`}
                              title="Agregar colaborador aquí"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Collaborator List */}
                        <div
                          className={`flex-1 ${
                            density === 'compact'
                              ? 'flex flex-wrap content-start gap-1.5'
                              : 'space-y-1.5'
                          }`}
                        >
                          {boxEmployees.length === 0 ? (
                            <div className="h-full min-h-[96px] flex items-center justify-center rounded-lg border border-dashed border-slate-300/80 text-xs text-slate-500 px-3 text-center">
                              Arrastra aquí o usa + para asignar
                            </div>
                          ) : (
                            boxEmployees.map((emp) =>
                              density === 'compact' ? (
                                <button
                                  key={emp.id}
                                  type="button"
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, emp.id)}
                                  onDragEnd={() => {
                                    setDraggedEmployeeId(null);
                                    setDragOverBoxId(null);
                                  }}
                                  onClick={() => onSelectEmployee(emp)}
                                  aria-label={`Editar a ${emp.name} (${emp.role})`}
                                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-500 text-left transition-colors focus-visible:outline-2 focus-visible:outline-blue-700 cursor-grab active:cursor-grabbing"
                                >
                                  <span
                                    className={`w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center shrink-0 ${style.softChip}`}
                                  >
                                    {getInitials(emp.name)}
                                  </span>
                                  <span className="text-xs font-semibold text-slate-900 truncate max-w-[115px]">
                                    {emp.name}
                                  </span>
                                  {emp.flightRisk === FlightRisk.High && (
                                    <AlertTriangle
                                      className="w-3 h-3 text-rose-600 shrink-0"
                                      aria-label="Riesgo de fuga alto"
                                    />
                                  )}
                                </button>
                              ) : (
                                <button
                                  key={emp.id}
                                  type="button"
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, emp.id)}
                                  onDragEnd={() => {
                                    setDraggedEmployeeId(null);
                                    setDragOverBoxId(null);
                                  }}
                                  onClick={() => onSelectEmployee(emp)}
                                  aria-label={`Ver y calibrar a ${emp.name}`}
                                  className="w-full flex items-center justify-between gap-2 p-2 rounded-lg bg-white border border-slate-200/90 hover:border-blue-500 hover:bg-blue-50/20 text-left transition-colors focus-visible:outline-2 focus-visible:outline-blue-700 cursor-grab active:cursor-grabbing"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <span
                                      className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${style.softChip}`}
                                    >
                                      {getInitials(emp.name)}
                                    </span>
                                    <div className="min-w-0">
                                      <div className="text-xs font-semibold text-slate-900 truncate">
                                        {emp.name}
                                      </div>
                                      <div className="text-[11px] text-slate-500 truncate">
                                        {emp.role} · {emp.department}
                                      </div>
                                    </div>
                                  </div>
                                  {emp.flightRisk === FlightRisk.High && (
                                    <span
                                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 shrink-0"
                                      title="Riesgo de fuga alto"
                                    >
                                      <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                                      <span className="hidden xl:inline">Riesgo</span>
                                    </span>
                                  )}
                                </button>
                              )
                            )
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* X-Axis Scale Labels */}
              <div className="grid grid-cols-[92px_repeat(3,minmax(0,1fr))] gap-3 pt-2 border-t border-slate-200">
                <div />
                {MATRIX_COL_ORDER.map((perf) => (
                  <div key={perf} className="text-center">
                    <div className="text-xs font-bold text-slate-800">
                      {modelConfig.axes.xScales[perf]}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono-nums">
                      Nivel {perf}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center text-xs font-bold tracking-wide text-slate-700 uppercase pt-1">
                {modelConfig.axes.xLabel} →
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
