import { useEffect, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import {
  EmployeeInput,
  FlightRisk,
  LevelScore,
  NineBoxModelConfig,
  SuccessionReadiness,
} from '../types/talent';
import {
  defaultRatingForLevel,
  getBoxDefinition,
  validateEmployeeInput,
  type ValidationErrors,
} from '../utils/nineBox';

interface AddEmployeeModalProps {
  isOpen: boolean;
  initialPerformance?: LevelScore;
  initialPotential?: LevelScore;
  modelConfig: NineBoxModelConfig;
  onClose: () => void;
  onAdd: (input: EmployeeInput) => void;
}

export function AddEmployeeModal({
  isOpen,
  initialPerformance = 2,
  initialPotential = 2,
  modelConfig,
  onClose,
  onAdd,
}: AddEmployeeModalProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState(
    modelConfig.departments[0] ?? 'Ingeniería'
  );
  const [manager, setManager] = useState('');
  const [tenureYears, setTenureYears] = useState('1.5');
  const [performance, setPerformance] = useState<LevelScore>(initialPerformance);
  const [potential, setPotential] = useState<LevelScore>(initialPotential);
  const [flightRisk, setFlightRisk] = useState<FlightRisk>(FlightRisk.Low);
  const [readiness, setReadiness] = useState<SuccessionReadiness>(
    SuccessionReadiness.Developing
  );
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    if (isOpen) {
      setName('');
      setRole('');
      setDepartment(modelConfig.departments[0] ?? 'Ingeniería');
      setManager('');
      setTenureYears('1.5');
      setPerformance(initialPerformance);
      setPotential(initialPotential);
      setFlightRisk(FlightRisk.Low);
      setReadiness(SuccessionReadiness.Developing);
      setNotes('');
      setErrors({});
    }
  }, [isOpen, initialPerformance, initialPotential, modelConfig.departments]);

  if (!isOpen) return null;

  const targetBox = getBoxDefinition(modelConfig, performance, potential);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const numericTenure = Number(tenureYears);
    const input: EmployeeInput = {
      name: name.trim(),
      role: role.trim(),
      department,
      manager: manager.trim() || 'Sin asignar',
      tenureYears: Number.isFinite(numericTenure) ? numericTenure : 0,
      performance,
      potential,
      performanceRating: defaultRatingForLevel(performance),
      potentialRating: defaultRatingForLevel(potential),
      flightRisk,
      readiness,
      notes: notes.trim(),
    };

    const validationErrors = validateEmployeeInput(input);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onAdd(input);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-employee-modal-title"
    >
      <div
        className="fixed inset-0 bg-slate-900/45"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-xl bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2
              id="add-employee-modal-title"
              className="font-display text-base font-bold text-slate-900"
            >
              Agregar Colaborador al 9-Box
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cuadrante destino: <span className="font-semibold text-slate-800">{targetBox.title}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="add-emp-name"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Nombre completo *
              </label>
              <input
                id="add-emp-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                placeholder="Ej: Sofía Morales"
                className="w-full h-9 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
              />
              {errors.name && (
                <p className="text-xs text-rose-600 mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="add-emp-role"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Cargo / Puesto *
              </label>
              <input
                id="add-emp-role"
                type="text"
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  if (errors.role) setErrors({ ...errors, role: undefined });
                }}
                placeholder="Ej: Analista de Producto"
                className="w-full h-9 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
              />
              {errors.role && (
                <p className="text-xs text-rose-600 mt-1">{errors.role}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="add-emp-dept"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Área *
              </label>
              <select
                id="add-emp-dept"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full h-9 px-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
              >
                {modelConfig.departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="add-emp-manager"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Líder directo
              </label>
              <input
                id="add-emp-manager"
                type="text"
                value={manager}
                onChange={(e) => setManager(e.target.value)}
                placeholder="Ej: Martín Salgado"
                className="w-full h-9 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
              />
            </div>

            <div>
              <label
                htmlFor="add-emp-tenure"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Antigüedad (años)
              </label>
              <input
                id="add-emp-tenure"
                type="number"
                min="0"
                max="60"
                step="0.1"
                value={tenureYears}
                onChange={(e) => setTenureYears(e.target.value)}
                className="w-full h-9 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono-nums focus:outline-none focus:bg-white focus:border-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label
                htmlFor="add-emp-perf"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                {modelConfig.axes.xLabel}
              </label>
              <select
                id="add-emp-perf"
                value={performance}
                onChange={(e) => setPerformance(Number(e.target.value) as LevelScore)}
                className="w-full h-9 px-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
              >
                <option value={1}>1 · {modelConfig.axes.xScales[1]}</option>
                <option value={2}>2 · {modelConfig.axes.xScales[2]}</option>
                <option value={3}>3 · {modelConfig.axes.xScales[3]}</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="add-emp-pot"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                {modelConfig.axes.yLabel}
              </label>
              <select
                id="add-emp-pot"
                value={potential}
                onChange={(e) => setPotential(Number(e.target.value) as LevelScore)}
                className="w-full h-9 px-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
              >
                <option value={1}>1 · {modelConfig.axes.yScales[1]}</option>
                <option value={2}>2 · {modelConfig.axes.yScales[2]}</option>
                <option value={3}>3 · {modelConfig.axes.yScales[3]}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="add-emp-risk"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Riesgo de fuga
              </label>
              <select
                id="add-emp-risk"
                value={flightRisk}
                onChange={(e) => setFlightRisk(e.target.value as FlightRisk)}
                className="w-full h-9 px-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
              >
                <option value={FlightRisk.Low}>Bajo</option>
                <option value={FlightRisk.Medium}>Medio</option>
                <option value={FlightRisk.High}>Alto</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="add-emp-readiness"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Disponibilidad sucesión
              </label>
              <select
                id="add-emp-readiness"
                value={readiness}
                onChange={(e) => setReadiness(e.target.value as SuccessionReadiness)}
                className="w-full h-9 px-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
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
              htmlFor="add-emp-notes"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Notas de evaluación
            </label>
            <textarea
              id="add-emp-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Logros recientes, áreas de oportunidad..."
              className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
            >
              Guardar colaborador
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
