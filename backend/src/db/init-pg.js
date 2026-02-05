require('dotenv').config();

const { initSchema } = require('./pg');

(async () => {
  if (!process.env.DATABASE_URL) {
    console.error('Missing DATABASE_URL. Set it in backend/.env or your environment.');
    process.exit(1);
  }

  await initSchema();
  console.log('PostgreSQL schema initialized successfully.');
  process.exit(0);
})().catch((err) => {
  console.error('Failed to initialize PostgreSQL schema:', err);
  process.exit(1);
});

