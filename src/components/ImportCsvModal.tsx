import { useState, type ChangeEvent } from 'react';
import { Download, Upload, X } from 'lucide-react';
import { Employee } from '../types/talent';
import { parseEmployeesCsv } from '../utils/nineBox';

interface ImportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (employees: Employee[], mode: 'append' | 'replace') => void;
}

const SAMPLE_CSV = `Nombre,Cargo,Departamento,Líder Directo,Antigüedad (años),Desempeño (1-3),Potencial (1-3),Puntaje Desempeño,Puntaje Potencial,Riesgo de Fuga,Disponibilidad Sucesión,Notas
Laura Méndez,Product Manager,Producto,Santiago Herrera,2.4,3,3,4.7,4.8,Bajo,Listo ahora,Lideró lanzamiento de app móvil
Diego Paredes,Ingeniero DevOps,Ingeniería,Valeria Mendoza,3.1,2,3,4.0,4.5,Medio,En 1-2 años,Automatizó despliegues CI/CD`;

export function ImportCsvModal({
  isOpen,
  onClose,
  onImport,
}: ImportCsvModalProps) {
  const [csvText, setCsvText] = useState('');
  const [mode, setMode] = useState<'append' | 'replace'>('append');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCsvText(reader.result);
        setErrorMsg(null);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'plantilla_talento_9box.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleConfirm = () => {
    if (!csvText.trim()) {
      setErrorMsg('Sube un archivo CSV o pega los datos antes de importar.');
      return;
    }
    const { employees, skippedRows } = parseEmployeesCsv(csvText);
    if (employees.length === 0) {
      setErrorMsg(
        'No se detectaron filas válidas. Verifica que la primera fila sea el encabezado y las siguientes tengan Nombre y Cargo.'
      );
      return;
    }
    if (skippedRows > 0 && employees.length === 0) {
      setErrorMsg('Todas las filas tenían datos incompletos.');
      return;
    }
    onImport(employees, mode);
    setCsvText('');
    setErrorMsg(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-csv-title"
    >
      <div
        className="fixed inset-0 bg-slate-900/45"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-xl bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2
              id="import-csv-title"
              className="font-display text-base font-bold text-slate-900"
            >
              Importar Colaboradores desde CSV
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Carga tu nómina o evaluación desde Excel/Google Sheets en formato CSV
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Cerrar importador CSV"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Seleccionar archivo .csv</span>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>

            <button
              type="button"
              onClick={handleDownloadSample}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Descargar plantilla de ejemplo</span>
            </button>
          </div>

          <div>
            <label
              htmlFor="csv-paste-area"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              O pega el contenido CSV aquí
            </label>
            <textarea
              id="csv-paste-area"
              rows={6}
              value={csvText}
              onChange={(e) => {
                setCsvText(e.target.value);
                setErrorMsg(null);
              }}
              placeholder={SAMPLE_CSV}
              className="w-full p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
            />
          </div>

          <div className="flex items-center gap-4 text-xs">
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="import-mode"
                checked={mode === 'append'}
                onChange={() => setMode('append')}
                className="accent-blue-700"
              />
              <span className="font-medium text-slate-800">
                Sumar a la lista actual
              </span>
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="import-mode"
                checked={mode === 'replace'}
                onChange={() => setMode('replace')}
                className="accent-blue-700"
              />
              <span className="font-medium text-slate-800">
                Reemplazar lista completa
              </span>
            </label>
          </div>

          {errorMsg && (
            <p className="text-xs font-medium text-rose-600">{errorMsg}</p>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200/70 rounded-lg"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
          >
            Importar datos
          </button>
        </div>
      </div>
    </div>
  );
}
