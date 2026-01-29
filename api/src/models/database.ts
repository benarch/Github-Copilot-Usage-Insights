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

    -- User-level usage details for Table View
    CREATE TABLE IF NOT EXISTS user_usage_details (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_start_day TEXT NOT NULL,
      report_end_day TEXT NOT NULL,
      day TEXT NOT NULL,
      enterprise_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      user_login TEXT NOT NULL,
      user_initiated_interaction_count INTEGER NOT NULL DEFAULT 0,
      code_generation_activity_count INTEGER NOT NULL DEFAULT 0,
      code_acceptance_activity_count INTEGER NOT NULL DEFAULT 0,
      used_agent INTEGER NOT NULL DEFAULT 0,
      used_chat INTEGER NOT NULL DEFAULT 0,
      loc_suggested_to_add_sum INTEGER NOT NULL DEFAULT 0,
      loc_suggested_to_delete_sum INTEGER NOT NULL DEFAULT 0,
      loc_added_sum INTEGER NOT NULL DEFAULT 0,
      loc_deleted_sum INTEGER NOT NULL DEFAULT 0,
      primary_ide TEXT,
      primary_ide_version TEXT,
      primary_plugin_version TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(day, user_id)
    );

    -- Indexes for better query performance
    CREATE INDEX IF NOT EXISTS idx_daily_usage_date ON daily_usage(date);
    CREATE INDEX IF NOT EXISTS idx_weekly_usage_week_start ON weekly_usage(week_start);
    CREATE INDEX IF NOT EXISTS idx_chat_mode_requests_date ON chat_mode_requests(date);
    CREATE INDEX IF NOT EXISTS idx_model_usage_date ON model_usage(date);
    CREATE INDEX IF NOT EXISTS idx_agent_adoption_date ON agent_adoption(date);
    CREATE INDEX IF NOT EXISTS idx_user_usage_details_day ON user_usage_details(day);
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
