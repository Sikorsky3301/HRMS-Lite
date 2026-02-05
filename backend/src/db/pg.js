const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL !== 'false' && process.env.DATABASE_URL
    ? { rejectUnauthorized: false }
    : undefined,
});

const POSTGRES_SCHEMA = `
  CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    employee_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    department TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    employee_id TEXT NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('Present', 'Absent')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, date),
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance(employee_id);
  CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
`;

async function initSchema() {
  const client = await pool.connect();
  try {
    await client.query(POSTGRES_SCHEMA);
  } finally {
    client.release();
  }
}

function toPgPlaceholders(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

function createPrepared(sql) {
  const pgSql = toPgPlaceholders(sql);
  return {
    all: async (...params) => {
      const r = await pool.query(pgSql, params);
      return r.rows;
    },
    get: async (...params) => {
      const r = await pool.query(pgSql, params);
      return r.rows[0];
    },
    run: async (...params) => {
      const isInsert = /^\s*INSERT\s+/i.test(pgSql);
      const sql = isInsert ? pgSql.replace(/;\s*$/, '').trim() + ' RETURNING id' : pgSql;
      const r = await pool.query(sql, params);
      const rowCount = r.rowCount ?? 0;
      const lastRow = r.rows[0];
      const lastInsertRowid = lastRow?.id ?? null;
      return { changes: rowCount, lastInsertRowid };
    },
  };
}

module.exports = { pool, initSchema, createPrepared };
