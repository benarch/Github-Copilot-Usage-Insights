import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createDatabase(inMemory = false): Database.Database {
  const dbPath = inMemory ? ':memory:' : path.join(__dirname, '../data/app.db');
  const db = new Database(dbPath);
  
  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL');
  
  // Create tables
  db.exec(`
    -- Daily usage statistics
    CREATE TABLE IF NOT EXISTS daily_usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      active_users INTEGER NOT NULL DEFAULT 0,
      total_suggestions INTEGER NOT NULL DEFAULT 0,
      accepted_suggestions INTEGER NOT NULL DEFAULT 0,
      chat_requests INTEGER NOT NULL DEFAULT 0,
      agent_requests INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Weekly usage aggregates
    CREATE TABLE IF NOT EXISTS weekly_usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      week_start TEXT NOT NULL UNIQUE,
      active_users INTEGER NOT NULL DEFAULT 0,
      total_suggestions INTEGER NOT NULL DEFAULT 0,
      accepted_suggestions INTEGER NOT NULL DEFAULT 0,
      chat_requests INTEGER NOT NULL DEFAULT 0,
      agent_requests INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Chat mode requests breakdown
    CREATE TABLE IF NOT EXISTS chat_mode_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      mode TEXT NOT NULL CHECK(mode IN ('edit', 'ask', 'agent', 'custom', 'inline')),
      requests INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(date, mode)
    );

    -- Model usage statistics
    CREATE TABLE IF NOT EXISTS model_usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      model_name TEXT NOT NULL,
      requests INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(date, model_name)
    );

    -- Agent adoption tracking
    CREATE TABLE IF NOT EXISTS agent_adoption (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      total_active_users INTEGER NOT NULL DEFAULT 0,
      agent_users INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Indexes for better query performance
    CREATE INDEX IF NOT EXISTS idx_daily_usage_date ON daily_usage(date);
    CREATE INDEX IF NOT EXISTS idx_weekly_usage_week_start ON weekly_usage(week_start);
    CREATE INDEX IF NOT EXISTS idx_chat_mode_requests_date ON chat_mode_requests(date);
    CREATE INDEX IF NOT EXISTS idx_model_usage_date ON model_usage(date);
    CREATE INDEX IF NOT EXISTS idx_agent_adoption_date ON agent_adoption(date);
  `);

  return db;
}

let dbInstance: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!dbInstance) {
    dbInstance = createDatabase(process.env.NODE_ENV === 'test');
  }
  return dbInstance;
}

export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
