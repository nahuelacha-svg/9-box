import { useEffect, useMemo, useState } from 'react';
import { AddEmployeeModal } from './components/AddEmployeeModal';
import { DynamicDashboard } from './components/DynamicDashboard';
import { EmployeeDirectory } from './components/EmployeeDirectory';
import { EmployeeDrawer } from './components/EmployeeDrawer';
import { FilterBar } from './components/FilterBar';
import { ImportCsvModal } from './components/ImportCsvModal';
import { ModelCustomizer } from './components/ModelCustomizer';
import { NineBoxMatrix } from './components/NineBoxMatrix';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { DEFAULT_MODEL_CONFIG, SEED_EMPLOYEES } from './data/presets';
import {
  Employee,
  EmployeeInput,
  LevelScore,
  MatrixDensity,
  NineBoxModelConfig,
  TalentFilterState,
  ViewTab,
} from './types/talent';
import {
  defaultRatingForLevel,
  employeesToCsv,
  filterEmployees,
} from './utils/nineBox';
import {
  loadEmployees,
  loadModelConfig,
  saveEmployees,
  saveModelConfig,
} from './utils/storage';

const INITIAL_FILTERS: TalentFilterState = {
  search: '',
  department: 'all',
  flightRisk: 'all',
  readiness: 'all',
};

export default function App() {
  const [employees, setEmployees] = useState<Employee[]>(() => loadEmployees());
  const [modelConfig, setModelConfig] = useState<NineBoxModelConfig>(() =>
    loadModelConfig()
  );
  const [activeTab, setActiveTab] = useState<ViewTab>('matrix');
  const [filters, setFilters] = useState<TalentFilterState>(INITIAL_FILTERS);
  const [density, setDensity] = useState<MatrixDensity>('cards');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null
  );
  const [addModalState, setAddModalState] = useState<{
    isOpen: boolean;
    performance: LevelScore;
    potential: LevelScore;
  }>({
    isOpen: false,
    performance: 2,
    potential: 2,
  });
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  useEffect(() => {
    saveEmployees(employees);
  }, [employees]);

  useEffect(() => {
    saveModelConfig(modelConfig);
  }, [modelConfig]);

  const allDepartments = useMemo(() => {
    const set = new Set<string>(modelConfig.departments);
    employees.forEach((e) => set.add(e.department));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [modelConfig.departments, employees]);

  const filteredEmployees = useMemo(
    () => filterEmployees(employees, filters),
    [employees, filters]
  );

  const selectedEmployee = useMemo(
    () => employees.find((e) => e.id === selectedEmployeeId) ?? null,
    [employees, selectedEmployeeId]
  );

  const handleMoveEmployee = (
    employeeId: string,
    performance: LevelScore,
    potential: LevelScore
  ) => {
    const today = new Date().toISOString().slice(0, 10);
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === employeeId
          ? {
              ...emp,
              performance,
              potential,
              performanceRating: defaultRatingForLevel(performance),
              potentialRating: defaultRatingForLevel(potential),
              updatedAt: today,
            }
          : emp
      )
    );
  };

  const handleSaveEmployee = (updated: Employee) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === updated.id ? updated : emp))
    );
  };

  const handleQuickUpdate = (
    employeeId: string,
    patch: Partial<Pick<Employee, 'performance' | 'potential' | 'flightRisk'>>
  ) => {
    const today = new Date().toISOString().slice(0, 10);
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id !== employeeId) return emp;
        return {
          ...emp,
          ...patch,
          performanceRating:
            patch.performance !== undefined
              ? defaultRatingForLevel(patch.performance)
              : emp.performanceRating,
          potentialRating:
            patch.potential !== undefined
              ? defaultRatingForLevel(patch.potential)
              : emp.potentialRating,
          updatedAt: today,
        };
      })
    );
  };

  const handleAddEmployee = (input: EmployeeInput) => {
    const newEmployee: Employee = {
      ...input,
      id: `emp-${Date.now()}`,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setEmployees((prev) => [newEmployee, ...prev]);
  };

  const handleDeleteEmployee = (employeeId: string) => {
    setEmployees((prev) => prev.filter((emp) => emp.id !== employeeId));
    if (selectedEmployeeId === employeeId) {
      setSelectedEmployeeId(null);
    }
  };

  const handleExportCsv = () => {
    const csv = employeesToCsv(filteredEmployees, modelConfig);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `talento9_matriz_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportEmployees = (
    imported: Employee[],
    mode: 'append' | 'replace'
  ) => {
    if (mode === 'replace') {
      setEmployees(imported);
    } else {
      setEmployees((prev) => [...imported, ...prev]);
    }
    // Ensure any newly imported departments are selectable in filters/customizer
    const extraDepts = imported
      .map((e) => e.department)
      .filter((d) => !modelConfig.departments.includes(d));
    if (extraDepts.length > 0) {
      setModelConfig((prev) => ({
        ...prev,
        departments: Array.from(new Set([...prev.departments, ...extraDepts])),
      }));
    }
  };

  const handleResetDemoData = () => {
    setEmployees(SEED_EMPLOYEES);
    setModelConfig(DEFAULT_MODEL_CONFIG);
    setFilters(INITIAL_FILTERS);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        modelConfig={modelConfig}
        totalEmployees={employees.length}
        filteredCount={filteredEmployees.length}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onOpenImport={() => setIsImportModalOpen(true)}
        onExportCsv={handleExportCsv}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar
          activeTab={activeTab}
          search={filters.search}
          onSearchChange={(search) => setFilters((prev) => ({ ...prev, search }))}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenAddEmployee={() =>
            setAddModalState({ isOpen: true, performance: 2, potential: 2 })
          }
        />

        <main className="flex-1 p-4 sm:p-6 max-w-[1440px] w-full mx-auto space-y-5">
          {activeTab !== 'customizer' && (
            <FilterBar
              filters={filters}
              departments={allDepartments}
              onChange={setFilters}
              onReset={() => setFilters(INITIAL_FILTERS)}
              density={density}
              onDensityChange={setDensity}
              showDensityToggle={activeTab === 'matrix'}
            />
          )}

          {activeTab === 'matrix' && (
            <NineBoxMatrix
              employees={filteredEmployees}
              totalEmployees={employees.length}
              modelConfig={modelConfig}
              density={density}
              onSelectEmployee={(emp) => setSelectedEmployeeId(emp.id)}
              onMoveEmployee={handleMoveEmployee}
              onAddInBox={(performance, potential) =>
                setAddModalState({ isOpen: true, performance, potential })
              }
              onResetFilters={() => setFilters(INITIAL_FILTERS)}
            />
          )}

          {activeTab === 'dashboard' && (
            <DynamicDashboard
              employees={filteredEmployees}
              modelConfig={modelConfig}
              onSelectEmployee={(emp) => setSelectedEmployeeId(emp.id)}
              onGoToMatrix={() => setActiveTab('matrix')}
            />
          )}

          {activeTab === 'directory' && (
            <EmployeeDirectory
              employees={filteredEmployees}
              modelConfig={modelConfig}
              onSelectEmployee={(emp) => setSelectedEmployeeId(emp.id)}
              onQuickUpdate={handleQuickUpdate}
              onOpenImport={() => setIsImportModalOpen(true)}
              onExportCsv={handleExportCsv}
            />
          )}

          {activeTab === 'customizer' && (
            <ModelCustomizer
              modelConfig={modelConfig}
              onUpdateConfig={setModelConfig}
              onResetDemoData={handleResetDemoData}
            />
          )}
        </main>
      </div>

      <EmployeeDrawer
        employee={selectedEmployee}
        modelConfig={modelConfig}
        onClose={() => setSelectedEmployeeId(null)}
        onSave={handleSaveEmployee}
        onDelete={handleDeleteEmployee}
      />

      <AddEmployeeModal
        isOpen={addModalState.isOpen}
        initialPerformance={addModalState.performance}
        initialPotential={addModalState.potential}
        modelConfig={modelConfig}
        onClose={() =>
          setAddModalState((prev) => ({ ...prev, isOpen: false }))
        }
        onAdd={handleAddEmployee}
      />

      <ImportCsvModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportEmployees}
      />
    </div>
  );
}
