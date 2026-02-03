import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import { getDatabase } from '../models/database.js';
import { NDJSONRecordSchema, type NDJSONRecord } from '../models/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RAW_DIR = path.join(__dirname, '../../data/raw');
const PROCESSED_DIR = path.join(__dirname, '../../data/processed');

interface IngestionStats {
  filesProcessed: number;
  recordsProcessed: number;
  recordsSkipped: number;
  errors: string[];
}

/**
 * Find all JSON files in the raw directory
 */
function findJsonFiles(): string[] {
  if (!fs.existsSync(RAW_DIR)) {
    console.error(`❌ Raw directory not found: ${RAW_DIR}`);
    return [];
  }

  const files = fs.readdirSync(RAW_DIR);
  return files
    .filter(file => file.endsWith('.json'))
    .map(file => path.join(RAW_DIR, file));
}

/**
 * Process a single NDJSON file
 */
async function processFile(filePath: string, db: any): Promise<{ records: number; skipped: number; errors: string[] }> {
  const stats = {
    records: 0,
    skipped: 0,
    errors: [] as string[],
  };

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let lineNumber = 0;

  for await (const line of rl) {
    lineNumber++;
    
    // Skip empty lines
    if (!line.trim()) {
      continue;
    }

    try {
      // Parse JSON
      const rawData = JSON.parse(line);
      
      // Validate with Zod
      const record = NDJSONRecordSchema.parse(rawData);
      
      // Insert or update the record
      await upsertRecord(db, record);
      
      stats.records++;
    } catch (error) {
      stats.skipped++;
      const errorMsg = `Line ${lineNumber}: ${error instanceof Error ? error.message : String(error)}`;
      stats.errors.push(errorMsg);
      console.warn(`⚠️  ${errorMsg}`);
    }
  }

  return stats;
}

/**
 * Upsert a single record with all nested arrays
 */
async function upsertRecord(db: any, record: NDJSONRecord): Promise<void> {
  const transaction = db.transaction(() => {
    // Check if record exists
    const existing = db.prepare(
      'SELECT id FROM user_usage_details WHERE user_id = ? AND day = ?'
    ).get(record.user_id, record.day);

    let userUsageId: number;

    if (existing) {
      // Update existing record
      db.prepare(`
        UPDATE user_usage_details SET
          report_start_day = ?,
          report_end_day = ?,
          enterprise_id = ?,
          user_login = ?,
          user_initiated_interaction_count = ?,
          code_generation_activity_count = ?,
          code_acceptance_activity_count = ?,
          used_agent = ?,
          used_chat = ?,
          loc_suggested_to_add_sum = ?,
          loc_suggested_to_delete_sum = ?,
          loc_added_sum = ?,
          loc_deleted_sum = ?
        WHERE id = ?
      `).run(
        record.report_start_day,
        record.report_end_day,
        record.enterprise_id,
        record.user_login,
        record.user_initiated_interaction_count,
        record.code_generation_activity_count,
        record.code_acceptance_activity_count,
        record.used_agent ? 1 : 0,
        record.used_chat ? 1 : 0,
        record.loc_suggested_to_add_sum,
        record.loc_suggested_to_delete_sum,
        record.loc_added_sum,
        record.loc_deleted_sum,
        existing.id
      );

      userUsageId = existing.id;

      // Delete existing child records
      db.prepare('DELETE FROM user_usage_by_ide WHERE user_usage_id = ?').run(userUsageId);
      db.prepare('DELETE FROM user_usage_by_feature WHERE user_usage_id = ?').run(userUsageId);
      db.prepare('DELETE FROM user_usage_by_language_feature WHERE user_usage_id = ?').run(userUsageId);
      db.prepare('DELETE FROM user_usage_by_language_model WHERE user_usage_id = ?').run(userUsageId);
      db.prepare('DELETE FROM user_usage_by_model_feature WHERE user_usage_id = ?').run(userUsageId);
    } else {
      // Insert new record
      const result = db.prepare(`
        INSERT INTO user_usage_details (
          report_start_day, report_end_day, day, enterprise_id, user_id, user_login,
          user_initiated_interaction_count, code_generation_activity_count,
          code_acceptance_activity_count, used_agent, used_chat,
          loc_suggested_to_add_sum, loc_suggested_to_delete_sum,
          loc_added_sum, loc_deleted_sum
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        record.report_start_day,
        record.report_end_day,
        record.day,
        record.enterprise_id,
        record.user_id,
        record.user_login,
        record.user_initiated_interaction_count,
        record.code_generation_activity_count,
        record.code_acceptance_activity_count,
        record.used_agent ? 1 : 0,
        record.used_chat ? 1 : 0,
        record.loc_suggested_to_add_sum,
        record.loc_suggested_to_delete_sum,
        record.loc_added_sum,
        record.loc_deleted_sum
      );

      userUsageId = result.lastInsertRowid as number;
    }

    // Insert child records
    const insertIde = db.prepare(`
      INSERT INTO user_usage_by_ide (user_usage_id, ide, code_gen_count, acceptance_count, loc_suggested, loc_added)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const ide of record.totals_by_ide) {
      insertIde.run(
        userUsageId,
        ide.ide,
        ide.code_generation_activity_count,
        ide.code_acceptance_activity_count,
        ide.loc_suggested_to_add_sum,
        ide.loc_added_sum
      );
    }

    const insertFeature = db.prepare(`
      INSERT INTO user_usage_by_feature (user_usage_id, feature, interaction_count, activity_count, acceptance_count)
      VALUES (?, ?, ?, ?, ?)
    `);
    for (const feature of record.totals_by_feature) {
      insertFeature.run(
        userUsageId,
        feature.feature,
        feature.user_initiated_interaction_count,
        feature.code_generation_activity_count,
        feature.code_acceptance_activity_count
      );
    }

    const insertLanguageFeature = db.prepare(`
      INSERT INTO user_usage_by_language_feature (user_usage_id, language, feature, count)
      VALUES (?, ?, ?, ?)
    `);
    for (const lf of record.totals_by_language_feature) {
      insertLanguageFeature.run(userUsageId, lf.language, lf.feature, lf.count);
    }

    const insertLanguageModel = db.prepare(`
      INSERT INTO user_usage_by_language_model (user_usage_id, language, model, count)
      VALUES (?, ?, ?, ?)
    `);
    for (const lm of record.totals_by_language_model) {
      // Use code_generation_activity_count if count is 0 or missing
      const count = (lm as any).code_generation_activity_count || lm.count || 0;
      insertLanguageModel.run(userUsageId, lm.language, lm.model, count);
    }

    const insertModelFeature = db.prepare(`
      INSERT INTO user_usage_by_model_feature (user_usage_id, model, feature, count)
      VALUES (?, ?, ?, ?)
    `);
    for (const mf of record.totals_by_model_feature) {
      insertModelFeature.run(userUsageId, mf.model, mf.feature, mf.count);
    }
  });

  transaction();
}

/**
 * Rebuild aggregation tables from user_usage_details
 */
function rebuildAggregations(db: any): void {
  console.log('\n📊 Rebuilding aggregation tables...');

  const transaction = db.transaction(() => {
    // Rebuild daily_usage
    db.exec(`
      DELETE FROM daily_usage;
      
      INSERT INTO daily_usage (date, active_users, total_suggestions, accepted_suggestions, chat_requests, agent_requests)
      SELECT 
        day as date,
        COUNT(DISTINCT user_id) as active_users,
        SUM(code_generation_activity_count) as total_suggestions,
        SUM(code_acceptance_activity_count) as accepted_suggestions,
        SUM(user_initiated_interaction_count) as chat_requests,
        SUM(CASE WHEN used_agent = 1 THEN user_initiated_interaction_count ELSE 0 END) as agent_requests
      FROM user_usage_details
      GROUP BY day
      ORDER BY day;
    `);

    // Rebuild model_usage from user_usage_by_model_feature
    db.exec(`
      DELETE FROM model_usage;
      
      INSERT INTO model_usage (date, model_name, requests)
      SELECT 
        u.day as date,
        mf.model as model_name,
        SUM(mf.count) as requests
      FROM user_usage_by_model_feature mf
      JOIN user_usage_details u ON mf.user_usage_id = u.id
      GROUP BY u.day, mf.model
      ORDER BY u.day, mf.model;
    `);

    // Rebuild chat_mode_requests from user_usage_by_feature
    db.exec(`
      DELETE FROM chat_mode_requests;
      
      INSERT INTO chat_mode_requests (date, mode, requests)
      SELECT 
        u.day as date,
        CASE 
          WHEN f.feature = 'code_completion' THEN 'inline'
          WHEN f.feature = 'chat' THEN 'ask'
          WHEN f.feature = 'agent' THEN 'agent'
          WHEN f.feature = 'edit' THEN 'edit'
          ELSE 'custom'
        END as mode,
        SUM(f.interaction_count) as requests
      FROM user_usage_by_feature f
      JOIN user_usage_details u ON f.user_usage_id = u.id
      WHERE f.feature IN ('code_completion', 'chat', 'agent', 'edit')
      GROUP BY u.day, mode
      ORDER BY u.day, mode;
    `);

    // Rebuild agent_adoption
    db.exec(`
      DELETE FROM agent_adoption;
      
      INSERT INTO agent_adoption (date, total_active_users, agent_users)
      SELECT 
        day as date,
        COUNT(DISTINCT user_id) as total_active_users,
        COUNT(DISTINCT CASE WHEN used_agent = 1 THEN user_id END) as agent_users
      FROM user_usage_details
      GROUP BY day
      ORDER BY day;
    `);
  });

  transaction();
  console.log('✅ Aggregation tables rebuilt successfully!');
}

/**
 * Move processed file to processed directory
 */
function moveToProcessed(filePath: string): void {
  const fileName = path.basename(filePath);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const newFileName = `${timestamp}-${fileName}`;
  const newPath = path.join(PROCESSED_DIR, newFileName);

  fs.renameSync(filePath, newPath);
  console.log(`📦 Moved to: ${newPath}`);
}

/**
 * Main ingestion function
 */
async function ingest(): Promise<void> {
  console.log('🚀 Starting NDJSON ingestion...\n');

  const stats: IngestionStats = {
    filesProcessed: 0,
    recordsProcessed: 0,
    recordsSkipped: 0,
    errors: [],
  };

  // Ensure processed directory exists
  if (!fs.existsSync(PROCESSED_DIR)) {
    fs.mkdirSync(PROCESSED_DIR, { recursive: true });
  }

  const files = findJsonFiles();

  if (files.length === 0) {
    console.log('ℹ️  No JSON files found in raw directory.');
    return;
  }

  console.log(`📁 Found ${files.length} file(s) to process\n`);

  const db = getDatabase();

  for (const file of files) {
    const fileName = path.basename(file);
    console.log(`\n📄 Processing: ${fileName}`);

    try {
      const fileStats = await processFile(file, db);
      
      stats.filesProcessed++;
      stats.recordsProcessed += fileStats.records;
      stats.recordsSkipped += fileStats.skipped;
      stats.errors.push(...fileStats.errors);

      console.log(`✅ Processed ${fileStats.records} records (${fileStats.skipped} skipped)`);

      // Move to processed directory
      moveToProcessed(file);
    } catch (error) {
      console.error(`❌ Failed to process ${fileName}:`, error);
      stats.errors.push(`File ${fileName}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Rebuild aggregations
  if (stats.recordsProcessed > 0) {
    rebuildAggregations(db);
  }

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📈 Ingestion Summary');
  console.log('='.repeat(50));
  console.log(`Files processed: ${stats.filesProcessed}`);
  console.log(`Records imported: ${stats.recordsProcessed}`);
  console.log(`Records skipped: ${stats.recordsSkipped}`);
  console.log(`Errors: ${stats.errors.length}`);

  if (stats.errors.length > 0 && stats.errors.length <= 10) {
    console.log('\n⚠️  Errors:');
    stats.errors.forEach(err => console.log(`  - ${err}`));
  } else if (stats.errors.length > 10) {
    console.log(`\n⚠️  ${stats.errors.length} errors occurred (showing first 10):`);
    stats.errors.slice(0, 10).forEach(err => console.log(`  - ${err}`));
  }

  console.log('\n✅ Ingestion complete!');
}

// Run ingestion
ingest().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
