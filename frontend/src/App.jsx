import { useState } from 'react';
import { EmployeeManagement } from './pages/EmployeeManagement';
import { AttendanceManagement } from './pages/AttendanceManagement';
import { Dashboard } from './pages/Dashboard';

const PAGES = [
  { id: 'dashboard', label: 'Dashboard', component: Dashboard },
  { id: 'employees', label: 'Employees', component: EmployeeManagement },
  { id: 'attendance', label: 'Attendance', component: AttendanceManagement },
];

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const PageComponent = PAGES.find((p) => p.id === activePage)?.component || Dashboard;

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-indigo-700">HRMS Lite</h1>
            <nav className="flex gap-1">
              {PAGES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActivePage(p.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activePage === p.id
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageComponent />
      </main>
    </div>
  );
}

export default App;
