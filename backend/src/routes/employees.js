const express = require('express');
const db = require('../db/database');

const router = express.Router();

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validation middleware
function validateEmployee(req, res, next) {
  const { employee_id, full_name, email, department } = req.body;
  const errors = [];

  if (!employee_id || typeof employee_id !== 'string') {
    errors.push('Employee ID is required');
  } else if (employee_id.trim().length === 0) {
    errors.push('Employee ID cannot be empty');
  }

  if (!full_name || typeof full_name !== 'string') {
    errors.push('Full name is required');
  } else if (full_name.trim().length === 0) {
    errors.push('Full name cannot be empty');
  }

  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push('Invalid email format');
  }

  if (!department || typeof department !== 'string') {
    errors.push('Department is required');
  } else if (department.trim().length === 0) {
    errors.push('Department cannot be empty');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation Error', messages: errors });
  }

  req.validatedEmployee = {
    employee_id: employee_id.trim(),
    full_name: full_name.trim(),
    email: email.trim().toLowerCase(),
    department: department.trim()
  };
  next();
}

// GET /api/employees - List all employees
router.get('/', async (req, res) => {
  try {
    const employees = await db.prepare(`
      SELECT id, employee_id, full_name, email, department, created_at
      FROM employees
      ORDER BY created_at DESC
    `).all();
    res.json(employees);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch employees' });
  }
});

// POST /api/employees - Add new employee
router.post('/', validateEmployee, async (req, res) => {
  const { employee_id, full_name, email, department } = req.validatedEmployee;

  try {
    const result = await db.prepare(`
      INSERT INTO employees (employee_id, full_name, email, department)
      VALUES (?, ?, ?, ?)
    `).run(employee_id, full_name, email, department);

    const employee = await db.prepare('SELECT * FROM employees WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(employee);
  } catch (err) {
    const isUnique = err.code === 'SQLITE_CONSTRAINT_UNIQUE' || err.code === '23505';
    if (isUnique) {
      if (err.message?.includes('employee_id') || err.constraint === 'employees_employee_id_key') {
        return res.status(409).json({ error: 'Duplicate Employee', message: 'An employee with this Employee ID already exists' });
      }
      if (err.message?.includes('email') || err.constraint === 'employees_email_key') {
        return res.status(409).json({ error: 'Duplicate Email', message: 'An employee with this email already exists' });
      }
    }
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to add employee' });
  }
});

// DELETE /api/employees/:id - Delete employee
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID', message: 'Employee ID must be a valid number' });
  }

  try {
    const result = await db.prepare('DELETE FROM employees WHERE id = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Not Found', message: 'Employee not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to delete employee' });
  }
});

module.exports = router;
