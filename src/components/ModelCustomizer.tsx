import { useState } from 'react';
import { Check, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { MODEL_PRESETS } from '../data/presets';
import {
  BoxColorKey,
  BoxDefinition,
  BoxId,
  NineBoxModelConfig,
} from '../types/talent';
import {
  BOX_COLOR_STYLES,
  MATRIX_COL_ORDER,
  MATRIX_ROW_ORDER,
  getBoxId,
} from '../utils/nineBox';

interface ModelCustomizerProps {
  modelConfig: NineBoxModelConfig;
  onUpdateConfig: (next: NineBoxModelConfig) => void;
  onResetDemoData: () => void;
}

const COLOR_KEYS = Object.keys(BOX_COLOR_STYLES) as BoxColorKey[];

export function ModelCustomizer({
  modelConfig,
  onUpdateConfig,
  onResetDemoData,
}: ModelCustomizerProps) {
  const [selectedBoxId, setSelectedBoxId] = useState<BoxId>('3-3');
  const [newDepartment, setNewDepartment] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  const selectedBox = modelConfig.boxes[selectedBoxId];

  const updateBox = (patch: Partial<BoxDefinition>) => {
    onUpdateConfig({
      ...modelConfig,
      boxes: {
        ...modelConfig.boxes,
        [selectedBoxId]: {
          ...selectedBox,
          ...patch,
        },
      },
    });
  };

  const handleApplyPreset = (presetId: string) => {
    const preset = MODEL_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    onUpdateConfig({
      ...preset.config,
      departments: modelConfig.departments,
    });
  };

  const handleAddDepartment = () => {
    const trimmed = newDepartment.trim();
    if (!trimmed) return;
    if (modelConfig.departments.includes(trimmed)) {
      setNewDepartment('');
      return;
    }
    onUpdateConfig({
      ...modelConfig,
      departments: [...modelConfig.departments, trimmed],
    });
    setNewDepartment('');
  };

  const handleRemoveDepartment = (dept: string) => {
    if (modelConfig.departments.length <= 1) return;
    onUpdateConfig({
      ...modelConfig,
      departments: modelConfig.departments.filter((d) => d !== dept),
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Expert Presets */}
      <section className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900">
              Plantillas de Metodología 9-Box
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Elige una estructura base recomendada por expertos y ajústala a tu cultura organizacional
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Restaurar datos demo</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onResetDemoData();
                    setConfirmReset(false);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
                >
                  Confirmar restauración
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {MODEL_PRESETS.map((preset) => {
            const isActive = modelConfig.presetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset.id)}
                className={`text-left p-4 rounded-xl border transition-colors ${
                  isActive
                    ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-sm font-bold text-slate-900">
                    {preset.name}
                  </span>
                  {isActive && (
                    <Check className="w-4 h-4 text-blue-700 shrink-0" aria-hidden="true" />
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {preset.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Interactive Box Editor */}
      <section className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="mb-4">
          <h2 className="font-display text-base font-bold text-slate-900">
            Personalizar los 9 Cuadrantes
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Selecciona un cuadrante en la grilla izquierda para cambiar su nombre, color y plan de acción recomendado
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Mini 3x3 Selector */}
          <div className="lg:col-span-5">
            <div className="grid grid-cols-3 gap-2">
              {MATRIX_ROW_ORDER.map((pot) =>
                MATRIX_COL_ORDER.map((perf) => {
                  const id = getBoxId(perf, pot);
                  const box = modelConfig.boxes[id];
                  const style = BOX_COLOR_STYLES[box.color];
                  const isSelected = selectedBoxId === id;

                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSelectedBoxId(id)}
                      className={`p-3 rounded-xl border text-left transition-all min-h-[88px] flex flex-col justify-between ${
                        style.cellBg
                      } ${
                        isSelected
                          ? 'border-blue-700 ring-2 ring-blue-600/25'
                          : style.cellBorder
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`w-2.5 h-2.5 rounded-xs ${style.dot}`}
                          aria-hidden="true"
                        />
                        <span className="text-[10px] font-mono-nums text-slate-500">
                          D{perf}·P{pot}
                        </span>
                      </div>
                      <div className={`text-xs font-bold leading-tight mt-2 ${style.headerText}`}>
                        {box.title}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-slate-500 px-1">
              <span>← {modelConfig.axes.xScales[1]}</span>
              <span>{modelConfig.axes.xLabel}</span>
              <span>{modelConfig.axes.xScales[3]} →</span>
            </div>
          </div>

          {/* Box Form */}
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="custom-box-title"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Nombre del cuadrante
                </label>
                <input
                  id="custom-box-title"
                  type="text"
                  value={selectedBox.title}
                  onChange={(e) => updateBox({ title: e.target.value })}
                  className="w-full h-9 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div>
                <label
                  htmlFor="custom-box-group"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Grupo estratégico en tablero
                </label>
                <select
                  id="custom-box-group"
                  value={selectedBox.strategicGroup}
                  onChange={(e) =>
                    updateBox({
                      strategicGroup: e.target.value as BoxDefinition['strategicGroup'],
                    })
                  }
                  className="w-full h-9 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
                >
                  <option value="Estrella y Alto Potencial">Estrella y Alto Potencial</option>
                  <option value="Talento Clave y Sólido">Talento Clave y Sólido</option>
                  <option value="Desarrollo y Atención">Desarrollo y Atención</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="custom-box-subtitle"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Descripción breve del perfil
              </label>
              <input
                id="custom-box-subtitle"
                type="text"
                value={selectedBox.subtitle}
                onChange={(e) => updateBox({ subtitle: e.target.value })}
                className="w-full h-9 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
              />
            </div>

            <div>
              <label
                htmlFor="custom-box-action"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Plan de acción RRHH recomendado
              </label>
              <textarea
                id="custom-box-action"
                rows={3}
                value={selectedBox.actionPlan}
                onChange={(e) => updateBox({ actionPlan: e.target.value })}
                className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
              />
            </div>

            <div>
              <div className="block text-xs font-semibold text-slate-700 mb-2">
                Paleta visual del cuadrante
              </div>
              <div className="flex flex-wrap gap-2">
                {COLOR_KEYS.map((colorKey) => {
                  const style = BOX_COLOR_STYLES[colorKey];
                  const active = selectedBox.color === colorKey;
                  return (
                    <button
                      key={colorKey}
                      type="button"
                      onClick={() => updateBox({ color: colorKey })}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                        active
                          ? 'border-blue-700 bg-blue-50 text-blue-900'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className={`w-3 h-3 rounded-xs ${style.dot}`}
                        aria-hidden="true"
                      />
                      <span>{style.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Axes, Scales & Departments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900">
              Ejes y Escalas del Modelo
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Personaliza cómo se nombran los ejes X e Y en tu organización
            </p>
          </div>

          <div>
            <label
              htmlFor="model-name-input"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Nombre del modelo
            </label>
            <input
              id="model-name-input"
              type="text"
              value={modelConfig.modelName}
              onChange={(e) =>
                onUpdateConfig({ ...modelConfig, modelName: e.target.value })
              }
              className="w-full h-9 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div className="space-y-2.5">
              <label
                htmlFor="axis-x-label"
                className="block text-xs font-semibold text-slate-700"
              >
                Nombre Eje X (Horizontal)
              </label>
              <input
                id="axis-x-label"
                type="text"
                value={modelConfig.axes.xLabel}
                onChange={(e) =>
                  onUpdateConfig({
                    ...modelConfig,
                    axes: { ...modelConfig.axes, xLabel: e.target.value },
                  })
                }
                className="w-full h-9 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
              />
              {([1, 2, 3] as const).map((lvl) => (
                <div key={lvl} className="flex items-center gap-2">
                  <span className="text-xs font-mono-nums text-slate-500 w-12 shrink-0">
                    Nivel {lvl}
                  </span>
                  <input
                    type="text"
                    aria-label={`Etiqueta nivel ${lvl} eje X`}
                    value={modelConfig.axes.xScales[lvl]}
                    onChange={(e) =>
                      onUpdateConfig({
                        ...modelConfig,
                        axes: {
                          ...modelConfig.axes,
                          xScales: {
                            ...modelConfig.axes.xScales,
                            [lvl]: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full h-8 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-2.5">
              <label
                htmlFor="axis-y-label"
                className="block text-xs font-semibold text-slate-700"
              >
                Nombre Eje Y (Vertical)
              </label>
              <input
                id="axis-y-label"
                type="text"
                value={modelConfig.axes.yLabel}
                onChange={(e) =>
                  onUpdateConfig({
                    ...modelConfig,
                    axes: { ...modelConfig.axes, yLabel: e.target.value },
                  })
                }
                className="w-full h-9 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
              />
              {([1, 2, 3] as const).map((lvl) => (
                <div key={lvl} className="flex items-center gap-2">
                  <span className="text-xs font-mono-nums text-slate-500 w-12 shrink-0">
                    Nivel {lvl}
                  </span>
                  <input
                    type="text"
                    aria-label={`Etiqueta nivel ${lvl} eje Y`}
                    value={modelConfig.axes.yScales[lvl]}
                    onChange={(e) =>
                      onUpdateConfig({
                        ...modelConfig,
                        axes: {
                          ...modelConfig.axes,
                          yScales: {
                            ...modelConfig.axes.yScales,
                            [lvl]: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full h-8 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900">
              Áreas y Departamentos
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 mb-4">
              Administra la lista de áreas disponibles al evaluar o filtrar colaboradores
            </p>

            <div className="flex gap-2 mb-4">
              <label htmlFor="new-dept-input" className="sr-only">
                Nombre del nuevo departamento
              </label>
              <input
                id="new-dept-input"
                type="text"
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddDepartment();
                  }
                }}
                placeholder="Ej: Inteligencia Artificial, Legal..."
                className="flex-1 h-9 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
              />
              <button
                type="button"
                onClick={handleAddDepartment}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>Añadir área</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
              {modelConfig.departments.map((dept) => (
                <div
                  key={dept}
                  className="flex items-center justify-between px-3 py-2 bg-white text-sm"
                >
                  <span className="font-medium text-slate-800">{dept}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDepartment(dept)}
                    disabled={modelConfig.departments.length <= 1}
                    aria-label={`Eliminar área ${dept}`}
                    className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-500 mt-4">
            Todos los cambios se guardan automáticamente en este navegador.
          </p>
        </section>
      </div>
    </div>
  );
}
