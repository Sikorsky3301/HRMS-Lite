const express = require('express');
const db = require('../db/database');

const router = express.Router();

// Date validation (YYYY-MM-DD)
function isValidDate(dateStr) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date) && dateStr === date.toISOString().split('T')[0];
}

// Validation middleware for marking attendance
function validateAttendance(req, res, next) {
  const { employee_id, date, status } = req.body;
  const errors = [];

  if (!employee_id || typeof employee_id !== 'string') {
    errors.push('Employee ID is required');
  }

  if (!date || typeof date !== 'string') {
    errors.push('Date is required');
  } else if (!isValidDate(date)) {
    errors.push('Date must be in YYYY-MM-DD format');
  }

  if (!status || !['Present', 'Absent'].includes(status)) {
    errors.push('Status must be either Present or Absent');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation Error', messages: errors });
  }

  req.validatedAttendance = {
    employee_id: employee_id.trim(),
    date: date.trim(),
    status: status
  };
  next();
}

// GET /api/attendance - List all attendance (optional: ?employee_id=xxx&date=yyyy-mm-dd)
router.get('/', async (req, res) => {
  const { employee_id, date } = req.query;

  try {
    let query = `
      SELECT a.id, a.employee_id, e.full_name, a.date, a.status, a.created_at
      FROM attendance a
      LEFT JOIN employees e ON a.employee_id = e.employee_id
      WHERE 1=1
    `;
    const params = [];

    if (employee_id) {
      query += ' AND a.employee_id = ?';
      params.push(employee_id);
    }
    if (date) {
      query += ' AND a.date = ?';
      params.push(date);
    }

    query += ' ORDER BY a.date DESC, a.created_at DESC';

    const records = await db.prepare(query).all(...params);
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch attendance' });
  }
});

// GET /api/attendance/employee/:employeeId - Get attendance for a specific employee
router.get('/employee/:employeeId', async (req, res) => {
  const { employeeId } = req.params;
  const { date } = req.query;

  try {
    let query = `
      SELECT a.id, a.employee_id, e.full_name, a.date, a.status, a.created_at
      FROM attendance a
      LEFT JOIN employees e ON a.employee_id = e.employee_id
      WHERE a.employee_id = ?
    `;
    const params = [employeeId];

    if (date) {
      query += ' AND a.date = ?';
      params.push(date);
    }

    query += ' ORDER BY a.date DESC';

    const records = await db.prepare(query).all(...params);
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch attendance' });
  }
});

// GET /api/attendance/stats/:employeeId - Get total present days for an employee (bonus)
router.get('/stats/:employeeId', async (req, res) => {
  const { employeeId } = req.params;

  try {
    const stats = await db.prepare(`
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent_days
      FROM attendance
      WHERE employee_id = ?
    `).get(employeeId);

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch stats' });
  }
});

// POST /api/attendance - Mark attendance
router.post('/', validateAttendance, async (req, res) => {
  const { employee_id, date, status } = req.validatedAttendance;

  try {
    // Verify employee exists
    const employee = await db.prepare('SELECT id FROM employees WHERE employee_id = ?').get(employee_id);
    if (!employee) {
      return res.status(404).json({ error: 'Not Found', message: 'Employee not found' });
    }

    await db.prepare(`
      INSERT INTO attendance (employee_id, date, status)
      VALUES (?, ?, ?)
      ON CONFLICT(employee_id, date) DO UPDATE SET status = excluded.status
    `).run(employee_id, date, status);

    const record = await db.prepare(`
      SELECT a.id, a.employee_id, e.full_name, a.date, a.status, a.created_at
      FROM attendance a
      LEFT JOIN employees e ON a.employee_id = e.employee_id
      WHERE a.employee_id = ? AND a.date = ?
    `).get(employee_id, date);

    res.status(201).json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to mark attendance' });
  }
});

module.exports = router;
