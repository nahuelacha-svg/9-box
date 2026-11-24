import { useEffect, useState } from 'react';
import { Trash2, X } from 'lucide-react';
import {
  Employee,
  FlightRisk,
  LevelScore,
  NineBoxModelConfig,
  SuccessionReadiness,
} from '../types/talent';
import {
  BOX_COLOR_STYLES,
  MATRIX_COL_ORDER,
  MATRIX_ROW_ORDER,
  defaultRatingForLevel,
  getBoxDefinition,
  getBoxId,
  getInitials,
  validateEmployeeInput,
  type ValidationErrors,
} from '../utils/nineBox';

interface EmployeeDrawerProps {
  employee: Employee | null;
  modelConfig: NineBoxModelConfig;
  onClose: () => void;
  onSave: (updated: Employee) => void;
  onDelete: (employeeId: string) => void;
}

export function EmployeeDrawer({
  employee,
  modelConfig,
  onClose,
  onSave,
  onDelete,
}: EmployeeDrawerProps) {
  const [draft, setDraft] = useState<Employee | null>(employee);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setDraft(employee);
    setErrors({});
    setConfirmDelete(false);
  }, [employee]);

  if (!employee || !draft) return null;

  const currentBox = getBoxDefinition(modelConfig, draft.performance, draft.potential);
  const currentStyle = BOX_COLOR_STYLES[currentBox.color];

  const handleBoxClick = (perf: LevelScore, pot: LevelScore) => {
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            performance: perf,
            potential: pot,
            performanceRating: defaultRatingForLevel(perf),
            potentialRating: defaultRatingForLevel(pot),
          }
        : prev
    );
  };

  const handleSave = () => {
    const valErrors = validateEmployeeInput(draft);
    if (Object.keys(valErrors).length > 0) {
      setErrors(valErrors);
      return;
    }
    onSave({
      ...draft,
      name: draft.name.trim(),
      role: draft.role.trim(),
      manager: draft.manager.trim() || 'Sin asignar',
      updatedAt: new Date().toISOString().slice(0, 10),
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-employee-title"
    >
      <div
        className="fixed inset-0 bg-slate-900/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-lg bg-white h-full shadow-xl border-l border-slate-200 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={`w-10 h-10 rounded-xl text-sm font-bold flex items-center justify-center shrink-0 ${currentStyle.softChip}`}
            >
              {getInitials(draft.name)}
            </span>
            <div className="min-w-0">
              <h2
                id="drawer-employee-title"
                className="font-display text-base font-bold text-slate-900 truncate"
              >
                {draft.name || 'Colaborador'}
              </h2>
              <p className="text-xs text-slate-500 truncate">
                {currentBox.title} · Actualizado {draft.updatedAt}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Cerrar ficha de colaborador"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick 9-Box Matrix Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800">
                Ubicación en Matriz 9-Box (clic para mover)
              </span>
              <span className="text-xs font-semibold text-blue-700">
                {currentBox.title}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {MATRIX_ROW_ORDER.map((pot) =>
                MATRIX_COL_ORDER.map((perf) => {
                  const id = getBoxId(perf, pot);
                  const box = modelConfig.boxes[id];
                  const style = BOX_COLOR_STYLES[box.color];
                  const isActive =
                    draft.performance === perf && draft.potential === pot;

                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleBoxClick(perf, pot)}
                      className={`p-2 rounded-lg border text-left transition-all ${
                        style.cellBg
                      } ${
                        isActive
                          ? 'border-blue-700 ring-2 ring-blue-600/30'
                          : `${style.cellBorder} opacity-80 hover:opacity-100`
                      }`}
                    >
                      <div className="text-[11px] font-bold text-slate-900 leading-tight truncate">
                        {box.title}
                      </div>
                      <div className="text-[10px] text-slate-600 mt-0.5 font-mono-nums">
                        D{perf} · P{pot}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
            <div className="mt-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
              <span className="font-bold text-slate-900">Plan sugerido RRHH: </span>
              {currentBox.actionPlan}
            </div>
          </div>

          {/* Numeric Calibration Ratings */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label
                htmlFor="drawer-perf-rating"
                className="flex justify-between text-xs font-semibold text-slate-700 mb-1"
              >
                <span>{modelConfig.axes.xLabel}</span>
                <span className="font-mono-nums text-blue-700">
                  {draft.performanceRating.toFixed(1)} / 5.0
                </span>
              </label>
              <input
                id="drawer-perf-rating"
                type="range"
                min="1"
                max="5"
                step="0.1"
                value={draft.performanceRating}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  const level: LevelScore = val >= 3.7 ? 3 : val >= 2.5 ? 2 : 1;
                  setDraft({
                    ...draft,
                    performanceRating: val,
                    performance: level,
                  });
                }}
                className="w-full accent-blue-700"
              />
            </div>

            <div>
              <label
                htmlFor="drawer-pot-rating"
                className="flex justify-between text-xs font-semibold text-slate-700 mb-1"
              >
                <span>{modelConfig.axes.yLabel}</span>
                <span className="font-mono-nums text-blue-700">
                  {draft.potentialRating.toFixed(1)} / 5.0
                </span>
              </label>
              <input
                id="drawer-pot-rating"
                type="range"
                min="1"
                max="5"
                step="0.1"
                value={draft.potentialRating}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  const level: LevelScore = val >= 3.7 ? 3 : val >= 2.5 ? 2 : 1;
                  setDraft({
                    ...draft,
                    potentialRating: val,
                    potential: level,
                  });
                }}
                className="w-full accent-blue-700"
              />
            </div>
          </div>

          {/* Profile Fields */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div>
              <label
                htmlFor="drawer-name"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Nombre completo
              </label>
              <input
                id="drawer-name"
                type="text"
                value={draft.name}
                onChange={(e) => {
                  setDraft({ ...draft, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                className="w-full h-9 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
              />
              {errors.name && (
                <p className="text-xs text-rose-600 mt-1">{errors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="drawer-role"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Cargo / Puesto
                </label>
                <input
                  id="drawer-role"
                  type="text"
                  value={draft.role}
                  onChange={(e) => {
                    setDraft({ ...draft, role: e.target.value });
                    if (errors.role) setErrors({ ...errors, role: undefined });
                  }}
                  className="w-full h-9 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
                />
                {errors.role && (
                  <p className="text-xs text-rose-600 mt-1">{errors.role}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="drawer-department"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Área / Departamento
                </label>
                <select
                  id="drawer-department"
                  value={draft.department}
                  onChange={(e) =>
                    setDraft({ ...draft, department: e.target.value })
                  }
                  className="w-full h-9 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
                >
                  {!modelConfig.departments.includes(draft.department) && (
                    <option value={draft.department}>{draft.department}</option>
                  )}
                  {modelConfig.departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="drawer-manager"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Líder directo
                </label>
                <input
                  id="drawer-manager"
                  type="text"
                  value={draft.manager}
                  onChange={(e) =>
                    setDraft({ ...draft, manager: e.target.value })
                  }
                  className="w-full h-9 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div>
                <label
                  htmlFor="drawer-tenure"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Antigüedad (años)
                </label>
                <input
                  id="drawer-tenure"
                  type="number"
                  min="0"
                  max="60"
                  step="0.1"
                  value={draft.tenureYears}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      tenureYears: Number(e.target.value),
                    })
                  }
                  className="w-full h-9 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono-nums focus:outline-none focus:bg-white focus:border-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="drawer-risk"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Riesgo de fuga
                </label>
                <select
                  id="drawer-risk"
                  value={draft.flightRisk}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      flightRisk: e.target.value as FlightRisk,
                    })
                  }
                  className="w-full h-9 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
                >
                  <option value={FlightRisk.Low}>Bajo</option>
                  <option value={FlightRisk.Medium}>Medio</option>
                  <option value={FlightRisk.High}>Alto</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="drawer-readiness"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Disponibilidad sucesión
                </label>
                <select
                  id="drawer-readiness"
                  value={draft.readiness}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      readiness: e.target.value as SuccessionReadiness,
                    })
                  }
                  className="w-full h-9 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
                >
                  <option value={SuccessionReadiness.ReadyNow}>Listo ahora</option>
                  <option value={SuccessionReadiness.In1To2Years}>En 1-2 años</option>
                  <option value={SuccessionReadiness.Developing}>En desarrollo</option>
                  <option value={SuccessionReadiness.NotApplicable}>No aplica</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="drawer-notes"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Notas de calibración y plan individual
              </label>
              <textarea
                id="drawer-notes"
                rows={3}
                value={draft.notes}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                placeholder="Acuerdos del comité de talento, próximos pasos, mentoría..."
                className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <div>
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Eliminar</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onDelete(employee.id);
                    onClose();
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
                >
                  Confirmar baja
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200/70 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
            >
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
