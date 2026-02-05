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
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(circle_at_top,_#1e293b,_#020617)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl overflow-hidden backdrop-blur">
          {/* Sidebar */}
          <aside className="md:w-64 bg-slate-950/60 border-b md:border-b-0 md:border-r border-slate-800 p-6 flex flex-col gap-8">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">HR Dashboard</p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-50">HRMS Lite</h1>
              <p className="mt-1 text-sm text-slate-400">Manage people, presence & performance.</p>
            </div>

            <nav className="flex md:flex-col gap-2 text-sm font-medium">
              {PAGES.map((p) => {
                const isActive = activePage === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setActivePage(p.id)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                      isActive
                        ? 'bg-indigo-500 text-white shadow-[0_0_0_1px_rgba(129,140,248,0.5)]'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <span>{p.label}</span>
                    {isActive && (
                      <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="mt-auto hidden md:block">
              <p className="text-xs text-slate-500">
                Tip: Start on the <span className="text-slate-300 font-medium">Dashboard</span> to see a quick summary
                of your workforce.
              </p>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 bg-slate-900/40 p-6 md:p-8 overflow-auto">
            <PageComponent />
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
