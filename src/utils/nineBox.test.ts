import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_MODEL_CONFIG, SEED_EMPLOYEES } from '../data/presets';
import { FlightRisk, SuccessionReadiness } from '../types/talent';
import {
  computeAnalytics,
  employeesToCsv,
  filterEmployees,
  getBoxDefinition,
  getBoxId,
  getInitials,
  parseBoxId,
  parseEmployeesCsv,
  validateEmployeeInput,
} from './nineBox';

test('getBoxId and parseBoxId map performance and potential symmetrically', () => {
  assert.equal(getBoxId(3, 3), '3-3');
  assert.equal(getBoxId(1, 3), '1-3');
  assert.equal(getBoxId(2, 1), '2-1');

  assert.deepEqual(parseBoxId('3-2'), { performance: 3, potential: 2 });
  assert.deepEqual(parseBoxId('1-3'), { performance: 1, potential: 3 });

  const starBox = getBoxDefinition(DEFAULT_MODEL_CONFIG, 3, 3);
  assert.equal(starBox.title, 'Estrella Consistente');
});

test('getInitials extracts clean uppercase initials', () => {
  assert.equal(getInitials('Valeria Mendoza'), 'VM');
  assert.equal(getInitials('Santiago'), 'SA');
  assert.equal(getInitials('  '), '??');
});

test('filterEmployees filters by search, department, flightRisk, and readiness', () => {
  const byExactName = filterEmployees(SEED_EMPLOYEES, {
    search: 'navarro',
    department: 'all',
    flightRisk: 'all',
    readiness: 'all',
  });
  assert.equal(byExactName.length, 1);
  assert.equal(byExactName[0].id, 'emp-08');

  const byManagerOrName = filterEmployees(SEED_EMPLOYEES, {
    search: 'valeria',
    department: 'all',
    flightRisk: 'all',
    readiness: 'all',
  });
  assert.equal(byManagerOrName.length, 3);

  const byDeptAndRisk = filterEmployees(SEED_EMPLOYEES, {
    search: '',
    department: 'Ingeniería',
    flightRisk: FlightRisk.High,
    readiness: 'all',
  });
  assert.equal(byDeptAndRisk.length, 1);
  assert.equal(byDeptAndRisk[0].name, 'Andrés Castellanos');
});

test('computeAnalytics calculates totals, quadrants, departments, and retention alerts accurately', () => {
  const analytics = computeAnalytics(SEED_EMPLOYEES, DEFAULT_MODEL_CONFIG);
  assert.equal(analytics.total, SEED_EMPLOYEES.length);

  const sumQuadrantCounts = analytics.quadrants.reduce((acc, q) => acc + q.count, 0);
  assert.equal(sumQuadrantCounts, SEED_EMPLOYEES.length);

  const sumDeptCounts = analytics.departments.reduce((acc, d) => acc + d.total, 0);
  assert.equal(sumDeptCounts, SEED_EMPLOYEES.length);

  // Critical retention only includes high flight risk with performance >= 2 or potential >= 2
  assert.ok(analytics.criticalRetentionList.every((e) => e.flightRisk === FlightRisk.High));
  assert.ok(
    analytics.criticalRetentionList.every((e) => e.performance >= 2 || e.potential >= 2)
  );
  // Hernán Duarte (1,1, High risk) is low/low so excluded from critical retention
  assert.equal(
    analytics.criticalRetentionList.some((e) => e.id === 'emp-15'),
    false
  );
  assert.equal(
    analytics.readySuccessionList.every((e) => e.readiness === SuccessionReadiness.ReadyNow),
    true
  );
});

test('validateEmployeeInput rejects empty required fields', () => {
  const invalid = validateEmployeeInput({
    name: '',
    role: 'A',
    department: '',
    tenureYears: -2,
  });
  assert.ok(invalid.name);
  assert.ok(invalid.role);
  assert.ok(invalid.department);
  assert.ok(invalid.tenureYears);

  const valid = validateEmployeeInput({
    name: 'Laura Méndez',
    role: 'Product Designer',
    department: 'Producto',
    tenureYears: 2.5,
  });
  assert.deepEqual(valid, {});
});

test('employeesToCsv and parseEmployeesCsv round-trip data cleanly', () => {
  const sample = SEED_EMPLOYEES.slice(0, 3);
  const csv = employeesToCsv(sample, DEFAULT_MODEL_CONFIG);
  const { employees, skippedRows } = parseEmployeesCsv(csv);

  assert.equal(skippedRows, 0);
  assert.equal(employees.length, 3);
  assert.equal(employees[0].name, sample[0].name);
  assert.equal(employees[0].performance, sample[0].performance);
  assert.equal(employees[0].potential, sample[0].potential);
  assert.equal(employees[2].flightRisk, sample[2].flightRisk);
});
