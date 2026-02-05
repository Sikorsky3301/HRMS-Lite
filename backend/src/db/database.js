const path = require('path');

const usePostgres = Boolean(process.env.DATABASE_URL);

let db;

if (usePostgres) {
  const pg = require('./pg');
  db = {
    prepare: (sql) => pg.createPrepared(sql),
    isAsync: true,
    ready: pg.initSchema().then(() => {
      console.log('PostgreSQL schema ready');
    }),
  };
} else {
  const Database = require('better-sqlite3');
  const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '..', '..', 'hrms.db');
  const sqlite = new Database(dbPath);
  sqlite.pragma('foreign_keys = ON');

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      department TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id TEXT NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('Present', 'Absent')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(employee_id, date),
      FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance(employee_id);
    CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
  `);

  db = {
    prepare: (sql) => {
      const stmt = sqlite.prepare(sql);
      return {
        all: (...params) => Promise.resolve(stmt.all(...params)),
        get: (...params) => Promise.resolve(stmt.get(...params)),
        run: (...params) => Promise.resolve(stmt.run(...params)),
      };
    },
    isAsync: true,
    ready: Promise.resolve(),
  };
}

module.exports = db;
