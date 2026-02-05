require('dotenv').config();

const express = require('express');
const cors = require('cors');

const db = require('./db/database');
const employeesRouter = require('./routes/employees');
const attendanceRouter = require('./routes/attendance');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'HRMS Lite API is running' });
});

// API routes
app.use('/api/employees', employeesRouter);
app.use('/api/attendance', attendanceRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', message: `Cannot ${req.method} ${req.path}` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

db.ready
  .then(() => {
    app.listen(PORT, () => {
      console.log(`HRMS Lite API running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database not ready:', err);
    process.exit(1);
  });
