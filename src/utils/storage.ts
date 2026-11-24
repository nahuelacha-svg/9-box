import { DEFAULT_MODEL_CONFIG, SEED_EMPLOYEES } from '../data/presets';
import { Employee, NineBoxModelConfig } from '../types/talent';

const EMPLOYEES_STORAGE_KEY = 'talento9.employees.v1';
const MODEL_STORAGE_KEY = 'talento9.modelConfig.v1';

export function loadEmployees(): Employee[] {
  if (typeof window === 'undefined') return SEED_EMPLOYEES;
  try {
    const raw = window.localStorage.getItem(EMPLOYEES_STORAGE_KEY);
    if (!raw) return SEED_EMPLOYEES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return SEED_EMPLOYEES;
  } catch {
    return SEED_EMPLOYEES;
  }
}

export function saveEmployees(employees: Employee[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(employees));
  } catch {
    // Ignore quota errors gracefully
  }
}

export function loadModelConfig(): NineBoxModelConfig {
  if (typeof window === 'undefined') return DEFAULT_MODEL_CONFIG;
  try {
    const raw = window.localStorage.getItem(MODEL_STORAGE_KEY);
    if (!raw) return DEFAULT_MODEL_CONFIG;
    const parsed = JSON.parse(raw) as NineBoxModelConfig;
    if (parsed && parsed.boxes && parsed.axes && parsed.boxes['3-3']) {
      return parsed;
    }
    return DEFAULT_MODEL_CONFIG;
  } catch {
    return DEFAULT_MODEL_CONFIG;
  }
}

export function saveModelConfig(config: NineBoxModelConfig): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(MODEL_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Ignore quota errors gracefully
  }
}
