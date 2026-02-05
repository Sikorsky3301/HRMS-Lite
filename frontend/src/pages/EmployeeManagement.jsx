import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Loading } from '../components/Loading';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';

export function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    full_name: '',
    email: '',
    department: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.employees.list();
      setEmployees(data);
    } catch (err) {
      setError(err.data?.message || err.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const err = {};
    if (!formData.employee_id?.trim()) err.employee_id = 'Employee ID is required';
    if (!formData.full_name?.trim()) err.full_name = 'Full name is required';
    if (!formData.email?.trim()) err.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) err.email = 'Invalid email format';
    if (!formData.department?.trim()) err.department = 'Department is required';
    setFormErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSubmitting(true);
      setError(null);
      await api.employees.create(formData);
      setFormData({ employee_id: '', full_name: '', email: '', department: '' });
      setFormErrors({});
      await fetchEmployees();
    } catch (err) {
      setError(err.data?.message || err.message || 'Failed to add employee');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, employeeId) => {
    if (!confirm(`Delete employee ${employeeId}?`)) return;
    try {
      setDeletingId(id);
      setError(null);
      await api.employees.delete(id);
      await fetchEmployees();
    } catch (err) {
      setError(err.data?.message || err.message || 'Failed to delete employee');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Employee Management</h1>
        <p className="text-slate-600 mt-1">Add and manage employee records</p>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      <Card title="Add New Employee">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Employee ID"
            name="employee_id"
            value={formData.employee_id}
            onChange={handleChange}
            placeholder="e.g. EMP001"
            error={formErrors.employee_id}
          />
          <Input
            label="Full Name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            placeholder="John Doe"
            error={formErrors.full_name}
          />
          <Input
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@company.com"
            error={formErrors.email}
          />
          <Input
            label="Department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            placeholder="e.g. Engineering"
            error={formErrors.department}
          />
          <div className="md:col-span-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Employee'}
            </Button>
          </div>
        </form>
      </Card>

      <Card title="All Employees">
        {loading ? (
          <Loading message="Loading employees..." />
        ) : employees.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No employees yet"
            description="Add your first employee using the form above."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-slate-600 border-b border-slate-200">
                  <th className="pb-3 font-medium">Employee ID</th>
                  <th className="pb-3 font-medium">Full Name</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Department</th>
                  <th className="pb-3 font-medium w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="py-3 font-mono text-sm">{emp.employee_id}</td>
                    <td className="py-3">{emp.full_name}</td>
                    <td className="py-3 text-slate-600">{emp.email}</td>
                    <td className="py-3">{emp.department}</td>
                    <td className="py-3">
                      <Button
                        variant="danger"
                        className="text-sm py-1 px-2"
                        disabled={deletingId === emp.id}
                        onClick={() => handleDelete(emp.id, emp.employee_id)}
                      >
                        {deletingId === emp.id ? '...' : 'Delete'}
                      </Button>
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
