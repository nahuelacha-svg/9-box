export type LevelScore = 1 | 2 | 3;

export type BoxId =
  | '1-1'
  | '2-1'
  | '3-1'
  | '1-2'
  | '2-2'
  | '3-2'
  | '1-3'
  | '2-3'
  | '3-3';

export enum FlightRisk {
  Low = 'Bajo',
  Medium = 'Medio',
  High = 'Alto',
}

export enum SuccessionReadiness {
  ReadyNow = 'Listo ahora',
  In1To2Years = 'En 1-2 años',
  Developing = 'En desarrollo',
  NotApplicable = 'No aplica',
}

export type BoxColorKey =
  | 'emerald'
  | 'indigo'
  | 'sky'
  | 'teal'
  | 'amber'
  | 'orange'
  | 'rose'
  | 'slate';

export interface BoxDefinition {
  id: BoxId;
  performance: LevelScore;
  potential: LevelScore;
  title: string;
  subtitle: string;
  actionPlan: string;
  color: BoxColorKey;
  strategicGroup: 'Estrella y Alto Potencial' | 'Talento Clave y Sólido' | 'Desarrollo y Atención';
}

export interface AxisScaleLabels {
  1: string;
  2: string;
  3: string;
}

export interface AxisConfig {
  xLabel: string;
  yLabel: string;
  xScales: AxisScaleLabels;
  yScales: AxisScaleLabels;
}

export interface NineBoxModelConfig {
  modelName: string;
  presetId: string;
  axes: AxisConfig;
  boxes: Record<BoxId, BoxDefinition>;
  departments: string[];
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  manager: string;
  tenureYears: number;
  performance: LevelScore;
  potential: LevelScore;
  performanceRating: number; // 1.0 - 5.0
  potentialRating: number; // 1.0 - 5.0
  flightRisk: FlightRisk;
  readiness: SuccessionReadiness;
  notes: string;
  updatedAt: string;
}

export interface EmployeeInput {
  name: string;
  role: string;
  department: string;
  manager: string;
  tenureYears: number;
  performance: LevelScore;
  potential: LevelScore;
  performanceRating: number;
  potentialRating: number;
  flightRisk: FlightRisk;
  readiness: SuccessionReadiness;
  notes: string;
}

export interface TalentFilterState {
  search: string;
  department: string;
  flightRisk: string;
  readiness: string;
}

export type ViewTab = 'matrix' | 'dashboard' | 'directory' | 'customizer';

export type MatrixDensity = 'cards' | 'compact';
