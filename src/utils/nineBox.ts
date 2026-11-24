import {
  BoxColorKey,
  BoxDefinition,
  BoxId,
  Employee,
  EmployeeInput,
  FlightRisk,
  LevelScore,
  NineBoxModelConfig,
  SuccessionReadiness,
  TalentFilterState,
} from '../types/talent';

export const BOX_COLOR_STYLES: Record<
  BoxColorKey,
  {
    label: string;
    cellBg: string;
    cellBorder: string;
    headerText: string;
    accentBar: string;
    dot: string;
    softChip: string;
  }
> = {
  emerald: {
    label: 'Esmeralda',
    cellBg: 'bg-emerald-50/75',
    cellBorder: 'border-emerald-200',
    headerText: 'text-emerald-950',
    accentBar: 'bg-emerald-600',
    dot: 'bg-emerald-600',
    softChip: 'bg-emerald-100/80 text-emerald-900',
  },
  teal: {
    label: 'Verde Azulado',
    cellBg: 'bg-teal-50/75',
    cellBorder: 'border-teal-200',
    headerText: 'text-teal-950',
    accentBar: 'bg-teal-600',
    dot: 'bg-teal-600',
    softChip: 'bg-teal-100/80 text-teal-900',
  },
  indigo: {
    label: 'Índigo',
    cellBg: 'bg-indigo-50/70',
    cellBorder: 'border-indigo-200',
    headerText: 'text-indigo-950',
    accentBar: 'bg-indigo-600',
    dot: 'bg-indigo-600',
    softChip: 'bg-indigo-100/80 text-indigo-900',
  },
  sky: {
    label: 'Azul Cielo',
    cellBg: 'bg-sky-50/75',
    cellBorder: 'border-sky-200',
    headerText: 'text-sky-950',
    accentBar: 'bg-sky-600',
    dot: 'bg-sky-600',
    softChip: 'bg-sky-100/80 text-sky-900',
  },
  amber: {
    label: 'Ámbar',
    cellBg: 'bg-amber-50/75',
    cellBorder: 'border-amber-200',
    headerText: 'text-amber-950',
    accentBar: 'bg-amber-500',
    dot: 'bg-amber-500',
    softChip: 'bg-amber-100/80 text-amber-950',
  },
  orange: {
    label: 'Terracota',
    cellBg: 'bg-orange-50/75',
    cellBorder: 'border-orange-200',
    headerText: 'text-orange-950',
    accentBar: 'bg-orange-500',
    dot: 'bg-orange-500',
    softChip: 'bg-orange-100/80 text-orange-950',
  },
  rose: {
    label: 'Coral',
    cellBg: 'bg-rose-50/75',
    cellBorder: 'border-rose-200',
    headerText: 'text-rose-950',
    accentBar: 'bg-rose-600',
    dot: 'bg-rose-600',
    softChip: 'bg-rose-100/80 text-rose-950',
  },
  slate: {
    label: 'Pizarra',
    cellBg: 'bg-slate-100/80',
    cellBorder: 'border-slate-300',
    headerText: 'text-slate-900',
    accentBar: 'bg-slate-600',
    dot: 'bg-slate-600',
    softChip: 'bg-slate-200/80 text-slate-900',
  },
};

/**
 * Grid row order (top to bottom): Potential 3 -> 2 -> 1
 * Grid column order (left to right): Performance 1 -> 2 -> 3
 */
export const MATRIX_ROW_ORDER: LevelScore[] = [3, 2, 1];
export const MATRIX_COL_ORDER: LevelScore[] = [1, 2, 3];

export function getBoxId(performance: LevelScore, potential: LevelScore): BoxId {
  return `${performance}-${potential}` as BoxId;
}

export function parseBoxId(boxId: BoxId): { performance: LevelScore; potential: LevelScore } {
  const [perfStr, potStr] = boxId.split('-');
  return {
    performance: Number(perfStr) as LevelScore,
    potential: Number(potStr) as LevelScore,
  };
}

export function getBoxDefinition(
  config: NineBoxModelConfig,
  performance: LevelScore,
  potential: LevelScore
): BoxDefinition {
  return config.boxes[getBoxId(performance, potential)];
}

export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function filterEmployees(
  employees: Employee[],
  filters: TalentFilterState
): Employee[] {
  const query = filters.search.trim().toLowerCase();

  return employees.filter((emp) => {
    if (query) {
      const haystack = `${emp.name} ${emp.role} ${emp.department} ${emp.manager}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    if (filters.department !== 'all' && emp.department !== filters.department) {
      return false;
    }
    if (filters.flightRisk !== 'all' && emp.flightRisk !== filters.flightRisk) {
      return false;
    }
    if (filters.readiness !== 'all' && emp.readiness !== filters.readiness) {
      return false;
    }
    return true;
  });
}

export interface QuadrantSummary {
  box: BoxDefinition;
  count: number;
  percentage: number;
  highRiskCount: number;
}

export interface DepartmentSummary {
  department: string;
  total: number;
  starAndHighPotCount: number;
  coreCount: number;
  attentionCount: number;
  avgPerformance: number;
  avgPotential: number;
  highRiskCount: number;
}

export interface TalentAnalytics {
  total: number;
  starAndHighPotCount: number;
  starAndHighPotPct: number;
  readyNowCount: number;
  readyNowPct: number;
  highFlightRiskCount: number;
  criticalRetentionCount: number;
  avgPerformanceRating: number;
  avgPotentialRating: number;
  quadrants: QuadrantSummary[];
  departments: DepartmentSummary[];
  criticalRetentionList: Employee[];
  readySuccessionList: Employee[];
}

export function computeAnalytics(
  employees: Employee[],
  config: NineBoxModelConfig
): TalentAnalytics {
  const total = employees.length;

  const orderedBoxIds: BoxId[] = [
    '3-3',
    '2-3',
    '3-2',
    '1-3',
    '2-2',
    '3-1',
    '1-2',
    '2-1',
    '1-1',
  ];

  const byBox = new Map<BoxId, Employee[]>();
  orderedBoxIds.forEach((id) => byBox.set(id, []));

  let starAndHighPotCount = 0;
  let readyNowCount = 0;
  let highFlightRiskCount = 0;
  let perfSum = 0;
  let potSum = 0;

  const deptMap = new Map<string, Employee[]>();
  const criticalRetentionList: Employee[] = [];
  const readySuccessionList: Employee[] = [];

  for (const emp of employees) {
    const boxId = getBoxId(emp.performance, emp.potential);
    const boxDef = config.boxes[boxId];
    const bucket = byBox.get(boxId);
    if (bucket) bucket.push(emp);

    if (boxDef.strategicGroup === 'Estrella y Alto Potencial') {
      starAndHighPotCount += 1;
    }
    if (emp.readiness === SuccessionReadiness.ReadyNow) {
      readyNowCount += 1;
      readySuccessionList.push(emp);
    }
    if (emp.flightRisk === FlightRisk.High) {
      highFlightRiskCount += 1;
      if (emp.performance >= 2 || emp.potential >= 2) {
        criticalRetentionList.push(emp);
      }
    }

    perfSum += emp.performanceRating;
    potSum += emp.potentialRating;

    const deptGroup = deptMap.get(emp.department) ?? [];
    deptGroup.push(emp);
    deptMap.set(emp.department, deptGroup);
  }

  const quadrants: QuadrantSummary[] = orderedBoxIds.map((id) => {
    const list = byBox.get(id) ?? [];
    return {
      box: config.boxes[id],
      count: list.length,
      percentage: total > 0 ? Math.round((list.length / total) * 100) : 0,
      highRiskCount: list.filter((e) => e.flightRisk === FlightRisk.High).length,
    };
  });

  const departments: DepartmentSummary[] = Array.from(deptMap.entries())
    .map(([department, list]) => {
      let stars = 0;
      let core = 0;
      let attention = 0;
      let dPerf = 0;
      let dPot = 0;
      let risks = 0;

      for (const e of list) {
        const def = config.boxes[getBoxId(e.performance, e.potential)];
        if (def.strategicGroup === 'Estrella y Alto Potencial') stars += 1;
        else if (def.strategicGroup === 'Talento Clave y Sólido') core += 1;
        else attention += 1;

        dPerf += e.performanceRating;
        dPot += e.potentialRating;
        if (e.flightRisk === FlightRisk.High) risks += 1;
      }

      return {
        department,
        total: list.length,
        starAndHighPotCount: stars,
        coreCount: core,
        attentionCount: attention,
        avgPerformance: Number((dPerf / list.length).toFixed(1)),
        avgPotential: Number((dPot / list.length).toFixed(1)),
        highRiskCount: risks,
      };
    })
    .sort((a, b) => b.total - a.total);

  return {
    total,
    starAndHighPotCount,
    starAndHighPotPct: total > 0 ? Math.round((starAndHighPotCount / total) * 100) : 0,
    readyNowCount,
    readyNowPct: total > 0 ? Math.round((readyNowCount / total) * 100) : 0,
    highFlightRiskCount,
    criticalRetentionCount: criticalRetentionList.length,
    avgPerformanceRating: total > 0 ? Number((perfSum / total).toFixed(1)) : 0,
    avgPotentialRating: total > 0 ? Number((potSum / total).toFixed(1)) : 0,
    quadrants,
    departments,
    criticalRetentionList,
    readySuccessionList,
  };
}

export interface ValidationErrors {
  name?: string;
  role?: string;
  department?: string;
  tenureYears?: string;
}

export function validateEmployeeInput(input: Partial<EmployeeInput>): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!input.name || input.name.trim().length < 2) {
    errors.name = 'Ingresa el nombre completo del colaborador (mínimo 2 caracteres).';
  }
  if (!input.role || input.role.trim().length < 2) {
    errors.role = 'Especifica el cargo o puesto actual.';
  }
  if (!input.department || input.department.trim().length === 0) {
    errors.department = 'Selecciona un área o departamento.';
  }
  if (
    input.tenureYears !== undefined &&
    (Number.isNaN(input.tenureYears) || input.tenureYears < 0 || input.tenureYears > 60)
  ) {
    errors.tenureYears = 'La antigüedad debe estar entre 0 y 60 años.';
  }

  return errors;
}

export function defaultRatingForLevel(level: LevelScore): number {
  if (level === 3) return 4.6;
  if (level === 2) return 3.6;
  return 2.3;
}

function escapeCsvCell(value: string | number): string {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function employeesToCsv(employees: Employee[], config: NineBoxModelConfig): string {
  const headers = [
    'Nombre',
    'Cargo',
    'Departamento',
    'Líder Directo',
    'Antigüedad (años)',
    'Desempeño (1-3)',
    'Potencial (1-3)',
    'Puntaje Desempeño',
    'Puntaje Potencial',
    'Cuadrante 9-Box',
    'Riesgo de Fuga',
    'Disponibilidad Sucesión',
    'Notas de Calibración',
  ];

  const rows = employees.map((emp) => {
    const box = getBoxDefinition(config, emp.performance, emp.potential);
    return [
      emp.name,
      emp.role,
      emp.department,
      emp.manager,
      emp.tenureYears,
      emp.performance,
      emp.potential,
      emp.performanceRating,
      emp.potentialRating,
      box.title,
      emp.flightRisk,
      emp.readiness,
      emp.notes,
    ]
      .map(escapeCsvCell)
      .join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function clampLevel(val: string | undefined): LevelScore {
  const n = Number(val);
  if (n >= 3) return 3;
  if (n <= 1) return 1;
  return 2;
}

function parseFlightRisk(val: string | undefined): FlightRisk {
  const lower = (val ?? '').toLowerCase();
  if (lower.includes('alt') || lower === 'high') return FlightRisk.High;
  if (lower.includes('med') || lower === 'medium') return FlightRisk.Medium;
  return FlightRisk.Low;
}

function parseReadiness(val: string | undefined): SuccessionReadiness {
  const lower = (val ?? '').toLowerCase();
  if (lower.includes('ahora') || lower.includes('ready')) return SuccessionReadiness.ReadyNow;
  if (lower.includes('1-2') || lower.includes('1 a 2')) return SuccessionReadiness.In1To2Years;
  if (lower.includes('desarroll')) return SuccessionReadiness.Developing;
  return SuccessionReadiness.NotApplicable;
}

export interface CsvParseResult {
  employees: Employee[];
  skippedRows: number;
}

export function parseEmployeesCsv(csvText: string): CsvParseResult {
  const lines = csvText
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return { employees: [], skippedRows: 0 };
  }

  const parsed: Employee[] = [];
  let skippedRows = 0;
  const today = new Date().toISOString().slice(0, 10);

  for (let idx = 1; idx < lines.length; idx += 1) {
    const cols = splitCsvLine(lines[idx]);
    const name = cols[0];
    const role = cols[1];
    const department = cols[2] || 'General';

    if (!name || name.length < 2 || !role || role.length < 2) {
      skippedRows += 1;
      continue;
    }

    const manager = cols[3] || 'Sin asignar';
    const tenureRaw = Number(cols[4]);
    const tenureYears = Number.isFinite(tenureRaw) && tenureRaw >= 0 ? tenureRaw : 1;
    const performance = clampLevel(cols[5]);
    const potential = clampLevel(cols[6]);
    const perfRatingRaw = Number(cols[7]);
    const potRatingRaw = Number(cols[8]);
    const performanceRating =
      Number.isFinite(perfRatingRaw) && perfRatingRaw >= 1 && perfRatingRaw <= 5
        ? perfRatingRaw
        : defaultRatingForLevel(performance);
    const potentialRating =
      Number.isFinite(potRatingRaw) && potRatingRaw >= 1 && potRatingRaw <= 5
        ? potRatingRaw
        : defaultRatingForLevel(potential);

    // Support both full 13-col export and simpler 10-col template
    const flightRiskCol = cols.length >= 12 ? cols[10] : cols[9];
    const readinessCol = cols.length >= 12 ? cols[11] : cols[10];
    const notesCol = cols.length >= 13 ? cols[12] : cols[11] ?? '';

    parsed.push({
      id: `imp-${Date.now()}-${idx}`,
      name,
      role,
      department,
      manager,
      tenureYears,
      performance,
      potential,
      performanceRating,
      potentialRating,
      flightRisk: parseFlightRisk(flightRiskCol),
      readiness: parseReadiness(readinessCol),
      notes: notesCol,
      updatedAt: today,
    });
  }

  return { employees: parsed, skippedRows };
}
