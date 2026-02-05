const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '..', '..', 'hrms.db');
const db = new Database(dbPath);

// Create employees table
db.exec(`
  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    department TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create attendance table
db.exec(`
  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id TEXT NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('Present', 'Absent')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, date),
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
  )
`);

// Create indexes for better query performance
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance(employee_id);
  CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
`);

console.log('Database initialized successfully at:', dbPath);
db.close();
