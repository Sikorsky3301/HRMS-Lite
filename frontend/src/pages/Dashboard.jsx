import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Card } from '../components/Card';
import { Loading } from '../components/Loading';
import { ErrorBanner } from '../components/ErrorBanner';

export function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [emp, att] = await Promise.all([
          api.employees.list(),
          api.attendance.list(),
        ]);
        setEmployees(emp);
        setAttendance(att);
        const presentCount = att.filter((a) => a.status === 'Present').length;
        const absentCount = att.filter((a) => a.status === 'Absent').length;
        setStats({
          totalEmployees: emp.length,
          totalRecords: att.length,
          presentToday: att.filter((a) => a.date === new Date().toISOString().slice(0, 10) && a.status === 'Present').length,
          presentCount,
          absentCount,
        });
      } catch (err) {
        setError(err.data?.message || err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <Loading message="Loading dashboard..." />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-600 mt-1">Overview of HRMS Lite</p>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <p className="text-sm text-slate-600">Total Employees</p>
            <p className="text-3xl font-bold text-indigo-600 mt-1">{stats.totalEmployees}</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-600">Total Attendance Records</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{stats.totalRecords}</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-600">Present (all time)</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{stats.presentCount}</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-600">Absent (all time)</p>
            <p className="text-3xl font-bold text-red-600 mt-1">{stats.absentCount}</p>
          </Card>
        </div>
      )}

      <Card title="Recent Attendance">
        {attendance.length === 0 ? (
          <p className="text-slate-500 py-8 text-center">No attendance records yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-slate-600 border-b border-slate-200">
                  <th className="pb-3 font-medium">Employee</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.slice(0, 10).map((r) => (
                  <tr key={r.id} className="border-b border-slate-100">
                    <td className="py-2">{r.full_name || r.employee_id}</td>
                    <td className="py-2 text-slate-600">{r.date}</td>
                    <td className="py-2">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-sm ${
                          r.status === 'Present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
