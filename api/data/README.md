# NDJSON Ingestion Pipeline

This directory contains the NDJSON ingestion pipeline for loading GitHub Copilot Usage API data into the database.

## Quick Start

1. **Place your NDJSON files** in `api/data/raw/`:
   ```bash
   cp your-copilot-usage-data.json api/data/raw/
   ```

2. **Run the ingestion script**:
   ```bash
   cd api
   npm run db:ingest
   ```

3. **View the results** in the dashboard at http://localhost:3000

## Features

- ✅ **Auto-discovery**: Automatically finds all `*.json` files in `api/data/raw/`
- ✅ **Validation**: Uses Zod schemas to validate NDJSON structure
- ✅ **Upsert Logic**: Updates existing records or inserts new ones based on `(user_id, day)` key
- ✅ **Nested Arrays**: Stores all 5 nested arrays (IDE, feature, language-feature, language-model, model-feature)
- ✅ **Aggregations**: Automatically rebuilds aggregation tables after ingestion
- ✅ **File Management**: Moves processed files to `api/data/processed/` with timestamp prefix

## NDJSON Format

Each line must be a valid JSON object with this structure:

```json
{
  "report_start_day": "2026-01-01",
  "report_end_day": "2026-01-29",
  "day": "2026-01-29",
  "enterprise_id": "10151",
  "user_id": 118447481,
  "user_login": "user_name",
  "user_initiated_interaction_count": 14,
  "code_generation_activity_count": 145,
  "code_acceptance_activity_count": 37,
  "used_agent": true,
  "used_chat": true,
  "loc_suggested_to_add_sum": 384,
  "loc_suggested_to_delete_sum": 0,
  "loc_added_sum": 216,
  "loc_deleted_sum": 9,
  "totals_by_ide": [{"ide": "vscode", ...}],
  "totals_by_feature": [{"feature": "code_completion", ...}],
  "totals_by_language_feature": [...],
  "totals_by_language_model": [...],
  "totals_by_model_feature": [...]
}
```

## Database Schema

### Parent Table: `user_usage_details`
Stores main usage data with UNIQUE constraint on `(user_id, day)`.

### Child Tables
1. `user_usage_by_ide` - IDE-specific metrics
2. `user_usage_by_feature` - Feature usage breakdown
3. `user_usage_by_language_feature` - Language+Feature combinations
4. `user_usage_by_language_model` - Language+Model combinations
5. `user_usage_by_model_feature` - Model+Feature combinations

### Aggregation Tables (Auto-Rebuilt)
- `daily_usage` - Daily active users and metrics
- `model_usage` - Model usage statistics by date
- `chat_mode_requests` - Chat mode breakdown by date
- `agent_adoption` - Agent adoption metrics by date

## Example Output

```
🚀 Starting NDJSON ingestion...

📁 Found 2 file(s) to process

📄 Processing: copilot-usage-2026-01.json
✅ Processed 150 records (0 skipped)
📦 Moved to: api/data/processed/2026-01-29-copilot-usage-2026-01.json

📊 Rebuilding aggregation tables...
✅ Aggregation tables rebuilt successfully!

==================================================
📈 Ingestion Summary
==================================================
Files processed: 2
Records imported: 300
Records skipped: 0
Errors: 0

✅ Ingestion complete!
```

## Troubleshooting

### No files found
- Ensure files are in `api/data/raw/`
- Files must have `.json` extension

### Validation errors
- Check NDJSON format (one JSON object per line)
- Verify all required fields are present
- Review error message for specific field issues

### Database locked
- Close any other database connections
- Wait for ongoing operations to complete
- Restart the API server if needed
