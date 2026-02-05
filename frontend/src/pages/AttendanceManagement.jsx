import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Loading } from '../components/Loading';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';

export function AttendanceManagement() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 10));
  const [filterEmployeeId, setFilterEmployeeId] = useState('');
  const [markForm, setMarkForm] = useState({
    employee_id: '',
    date: new Date().toISOString().slice(0, 10),
    status: 'Present',
  });
  const [markErrors, setMarkErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchEmployees = async () => {
    const data = await api.employees.list();
    setEmployees(data);
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (filterDate?.trim()) params.date = filterDate.trim();
      if (filterEmployeeId?.trim()) params.employee_id = filterEmployeeId.trim();
      const data = await api.attendance.list(params);
      setAttendance(data);
    } catch (err) {
      setError(err.data?.message || err.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [filterDate, filterEmployeeId]);

  const handleMarkChange = (e) => {
    const { name, value } = e.target;
    setMarkForm((prev) => ({ ...prev, [name]: value }));
    if (markErrors[name]) setMarkErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateMark = () => {
    const err = {};
    if (!markForm.employee_id?.trim()) err.employee_id = 'Select an employee';
    if (!markForm.date?.trim()) err.date = 'Date is required';
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(markForm.date)) err.date = 'Use YYYY-MM-DD format';
    setMarkErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleMarkSubmit = async (e) => {
    e.preventDefault();
    if (!validateMark()) return;
    try {
      setSubmitting(true);
      setError(null);
      await api.attendance.mark(markForm);
      setMarkForm((prev) => ({ ...prev, status: 'Present' }));
      setMarkErrors({});
      await fetchAttendance();
    } catch (err) {
      setError(err.data?.message || err.message || 'Failed to mark attendance');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Attendance Management</h1>
        <p className="text-slate-600 mt-1">Mark and view daily attendance</p>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      <Card title="Mark Attendance">
        <form onSubmit={handleMarkSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Employee</label>
            <select
              name="employee_id"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                markErrors.employee_id ? 'border-red-500' : 'border-slate-300'
              }`}
              value={markForm.employee_id}
              onChange={handleMarkChange}
            >
              <option value="">Select employee...</option>
              {employees.map((e) => (
                <option key={e.id} value={e.employee_id}>
                  {e.employee_id} - {e.full_name}
                </option>
              ))}
            </select>
            {markErrors.employee_id && (
              <p className="mt-1 text-sm text-red-600">{markErrors.employee_id}</p>
            )}
          </div>
          <Input
            label="Date"
            name="date"
            type="date"
            value={markForm.date}
            onChange={handleMarkChange}
            error={markErrors.date}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              name="status"
              value={markForm.status}
              onChange={handleMarkChange}
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
          </div>
          <div className="md:col-span-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Mark Attendance'}
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Attendance Records">
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Filter by date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Filter by employee</label>
            <input
              type="text"
              value={filterEmployeeId}
              onChange={(e) => setFilterEmployeeId(e.target.value)}
              placeholder="Employee ID"
              className="px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="secondary"
              onClick={() => {
                setFilterDate('');
                setFilterEmployeeId('');
              }}
            >
              Clear filters
            </Button>
          </div>
        </div>

        {loading ? (
          <Loading message="Loading attendance..." />
        ) : attendance.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No attendance records"
            description={
              filterDate || filterEmployeeId
                ? 'No records match your filters. Try adjusting them.'
                : 'Mark attendance using the form above to see records here.'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-slate-600 border-b border-slate-200">
                  <th className="pb-3 font-medium">Employee ID</th>
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="py-3 font-mono text-sm">{r.employee_id}</td>
                    <td className="py-3">{r.full_name}</td>
                    <td className="py-3 text-slate-600">{r.date}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-sm font-medium ${
                          r.status === 'Present'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
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
