/**
 * Direct JSON File Reader Service
 * Reads NDJSON files directly from the raw folder without requiring SQLite ingestion.
 * This is useful for quick demos or when you don't want to run the ingestion step.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RAW_DIR = path.join(__dirname, '../../data/raw');

export interface NDJSONRecord {
  report_start_day: string;
  report_end_day: string;
  day: string;
  enterprise_id: string;
  user_id: number;
  user_login: string;
  user_initiated_interaction_count: number;
  code_generation_activity_count: number;
  code_acceptance_activity_count: number;
  used_agent: boolean;
  used_chat: boolean;
  loc_suggested_to_add_sum: number;
  loc_suggested_to_delete_sum: number;
  loc_added_sum: number;
  loc_deleted_sum: number;
  totals_by_ide: Array<{
    ide: string;
    code_generation_activity_count: number;
    code_acceptance_activity_count: number;
    loc_suggested_to_add_sum: number;
    loc_added_sum: number;
  }>;
  totals_by_feature: Array<{
    feature: string;
    user_initiated_interaction_count: number;
    code_generation_activity_count: number;
    code_acceptance_activity_count: number;
  }>;
  totals_by_model_feature?: Array<{
    model: string;
    feature: string;
    count: number;
  }>;
  totals_by_language_model?: Array<{
    language: string;
    model: string;
    count: number;
  }>;
}

let cachedRecords: NDJSONRecord[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL_MS = 60000; // 1 minute cache

/**
 * Find all JSON files in the raw directory
 */
function findJsonFiles(): string[] {
  if (!fs.existsSync(RAW_DIR)) {
    return [];
  }

  const files = fs.readdirSync(RAW_DIR);
  return files
    .filter(file => file.endsWith('.json'))
    .map(file => path.join(RAW_DIR, file));
}

/**
 * Read all records from JSON files (with caching)
 */
export async function getAllRecords(): Promise<NDJSONRecord[]> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (cachedRecords && (now - cacheTimestamp) < CACHE_TTL_MS) {
    return cachedRecords;
  }

  const files = findJsonFiles();
  const allRecords: NDJSONRecord[] = [];

  for (const file of files) {
    const fileStream = fs.createReadStream(file);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      if (!line.trim()) continue;
      try {
        const record = JSON.parse(line) as NDJSONRecord;
        allRecords.push(record);
      } catch {
        // Skip invalid lines
      }
    }
  }

  // Update cache
  cachedRecords = allRecords;
  cacheTimestamp = now;

  return allRecords;
}

/**
 * Clear the cache (useful when new files are added)
 */
export function clearCache(): void {
  cachedRecords = null;
  cacheTimestamp = 0;
}

/**
 * Check if any JSON files exist in the raw folder
 */
export function hasJsonFiles(): boolean {
  return findJsonFiles().length > 0;
}

/**
 * Filter records by date range
 */
export function filterByDateRange(records: NDJSONRecord[], startDate: string, endDate: string): NDJSONRecord[] {
  return records.filter(r => r.day >= startDate && r.day <= endDate);
}

/**
 * Get dashboard summary from JSON records
 */
export function getSummaryFromRecords(records: NDJSONRecord[]): {
  ideActiveUsers: number;
  agentAdoption: { percentage: number; agentUsers: number; totalActiveUsers: number };
  mostUsedChatModel: { name: string; requests: number };
} {
  if (records.length === 0) {
    return {
      ideActiveUsers: 0,
      agentAdoption: { percentage: 0, agentUsers: 0, totalActiveUsers: 0 },
      mostUsedChatModel: { name: 'N/A', requests: 0 },
    };
  }

  // Get unique users
  const uniqueUsers = new Set(records.map(r => r.user_id));
  const agentUsers = new Set(records.filter(r => r.used_agent).map(r => r.user_id));

  return {
    ideActiveUsers: uniqueUsers.size,
    agentAdoption: {
      percentage: uniqueUsers.size > 0 ? Math.round((agentUsers.size / uniqueUsers.size) * 100) : 0,
      agentUsers: agentUsers.size,
      totalActiveUsers: uniqueUsers.size,
    },
    mostUsedChatModel: { name: 'N/A', requests: 0 }, // Model data not in NDJSON
  };
}

/**
 * Get daily active users from JSON records
 */
export function getDailyActiveUsersFromRecords(records: NDJSONRecord[]): Array<{ date: string; value: number }> {
  const dailyUsers = new Map<string, Set<number>>();

  for (const record of records) {
    if (!dailyUsers.has(record.day)) {
      dailyUsers.set(record.day, new Set());
    }
    dailyUsers.get(record.day)!.add(record.user_id);
  }

  return Array.from(dailyUsers.entries())
    .map(([date, users]) => ({ date, value: users.size }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get code generation stats from JSON records
 */
export function getCodeGenerationFromRecords(records: NDJSONRecord[]): {
  totalSuggestions: number;
  acceptedSuggestions: number;
  acceptanceRate: number;
  dailyData: Array<{ date: string; suggestions: number; accepted: number }>;
} {
  let totalSuggestions = 0;
  let acceptedSuggestions = 0;

  const dailyStats = new Map<string, { suggestions: number; accepted: number }>();

  for (const record of records) {
    totalSuggestions += record.code_generation_activity_count;
    acceptedSuggestions += record.code_acceptance_activity_count;

    if (!dailyStats.has(record.day)) {
      dailyStats.set(record.day, { suggestions: 0, accepted: 0 });
    }
    const daily = dailyStats.get(record.day)!;
    daily.suggestions += record.code_generation_activity_count;
    daily.accepted += record.code_acceptance_activity_count;
  }

  return {
    totalSuggestions,
    acceptedSuggestions,
    acceptanceRate: totalSuggestions > 0 ? Math.round((acceptedSuggestions / totalSuggestions) * 100) : 0,
    dailyData: Array.from(dailyStats.entries())
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  };
}

/**
 * Get chat mode requests from JSON records
 */
export function getChatModeRequestsFromRecords(records: NDJSONRecord[]): Array<{
  date: string;
  edit: number;
  ask: number;
  agent: number;
  custom: number;
  inline: number;
}> {
  const dailyModes = new Map<string, { edit: number; ask: number; agent: number; custom: number; inline: number }>();

  for (const record of records) {
    if (!dailyModes.has(record.day)) {
      dailyModes.set(record.day, { edit: 0, ask: 0, agent: 0, custom: 0, inline: 0 });
    }
    const modes = dailyModes.get(record.day)!;

    for (const feature of record.totals_by_feature || []) {
      switch (feature.feature) {
        case 'code_completion':
          modes.inline += feature.user_initiated_interaction_count;
          break;
        case 'chat':
          modes.ask += feature.user_initiated_interaction_count;
          break;
        case 'agent':
          modes.agent += feature.user_initiated_interaction_count;
          break;
        case 'edit':
          modes.edit += feature.user_initiated_interaction_count;
          break;
        default:
          modes.custom += feature.user_initiated_interaction_count;
      }
    }
  }

  return Array.from(dailyModes.entries())
    .map(([date, modes]) => ({ date, ...modes }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get IDE usage stats from JSON records
 */
export function getIDEUsageFromRecords(records: NDJSONRecord[]): Array<{ ide: string; users: number; interactions: number }> {
  const ideStats = new Map<string, { users: Set<number>; interactions: number }>();

  for (const record of records) {
    for (const ide of record.totals_by_ide || []) {
      const ideName = ide.ide || 'Unknown';
      if (!ideStats.has(ideName)) {
        ideStats.set(ideName, { users: new Set(), interactions: 0 });
      }
      const stats = ideStats.get(ideName)!;
      stats.users.add(record.user_id);
      stats.interactions += record.user_initiated_interaction_count;
    }
  }

  return Array.from(ideStats.entries())
    .map(([ide, stats]) => ({ ide, users: stats.users.size, interactions: stats.interactions }))
    .sort((a, b) => b.users - a.users);
}

/**
 * Get user usage details from JSON records
 */
export function getUserDetailsFromRecords(
  records: NDJSONRecord[],
  page: number = 1,
  limit: number = 50
): {
  data: any[];
  total: number;
  page: number;
  limit: number;
} {
  const sorted = [...records].sort((a, b) => b.day.localeCompare(a.day));
  const offset = (page - 1) * limit;
  const paginated = sorted.slice(offset, offset + limit);

  return {
    data: paginated.map(r => ({
      report_start_day: r.report_start_day,
      report_end_day: r.report_end_day,
      day: r.day,
      enterprise_id: r.enterprise_id,
      user_id: String(r.user_id),
      user_login: r.user_login,
      user_initiated_interaction_count: r.user_initiated_interaction_count,
      code_generation_activity_count: r.code_generation_activity_count,
      code_acceptance_activity_count: r.code_acceptance_activity_count,
      used_agent: r.used_agent,
      used_chat: r.used_chat,
      loc_suggested_to_add_sum: r.loc_suggested_to_add_sum,
      loc_suggested_to_delete_sum: r.loc_suggested_to_delete_sum,
      loc_added_sum: r.loc_added_sum,
      loc_deleted_sum: r.loc_deleted_sum,
      primary_ide: r.totals_by_ide?.[0]?.ide || null,
      primary_ide_version: null,
      primary_plugin_version: null,
    })),
    total: records.length,
    page,
    limit,
  };
}

/**
 * Get model usage distribution for donut chart from JSON records
 */
export function getModelDistributionFromRecords(records: NDJSONRecord[]): Array<{
  name: string;
  value: number;
  percentage: number;
}> {
  const modelCounts = new Map<string, number>();

  for (const record of records) {
    for (const entry of record.totals_by_model_feature || []) {
      const model = entry.model || 'Unknown';
      modelCounts.set(model, (modelCounts.get(model) || 0) + entry.count);
    }
  }

  const sorted = Array.from(modelCounts.entries())
    .sort((a, b) => b[1] - a[1]);

  // Group models beyond top 4 as "Other models"
  const topModels = sorted.slice(0, 4);
  const otherTotal = sorted.slice(4).reduce((sum, [, count]) => sum + count, 0);
  if (otherTotal > 0) {
    topModels.push(['Other models', otherTotal]);
  }

  const total = topModels.reduce((sum, [, count]) => sum + count, 0);
  return topModels.map(([name, value]) => ({
    name,
    value,
    percentage: total > 0 ? (value / total) * 100 : 0
  }));
}

/**
 * Get model usage per day from JSON records
 */
export function getModelUsagePerDayFromRecords(records: NDJSONRecord[]): Array<{
  date: string;
  [model: string]: string | number;
}> {
  // Get all models
  const allModels = new Set<string>();
  for (const record of records) {
    for (const entry of record.totals_by_model_feature || []) {
      allModels.add(entry.model);
    }
  }

  // Group top 4 models, rest as "Other models"
  const modelTotals = new Map<string, number>();
  for (const record of records) {
    for (const entry of record.totals_by_model_feature || []) {
      modelTotals.set(entry.model, (modelTotals.get(entry.model) || 0) + entry.count);
    }
  }

  const sortedModels = Array.from(modelTotals.entries())
    .sort((a, b) => b[1] - a[1]);
  const topModels = sortedModels.slice(0, 4).map(([m]) => m);

  // Build daily data with raw counts first
  const dailyData = new Map<string, { [model: string]: number }>();
  for (const record of records) {
    if (!dailyData.has(record.day)) {
      const entry: { [model: string]: number } = {};
      for (const m of topModels) entry[m] = 0;
      entry['Other models'] = 0;
      dailyData.set(record.day, entry);
    }
    const dayData = dailyData.get(record.day)!;
    for (const entry of record.totals_by_model_feature || []) {
      const model = topModels.includes(entry.model) ? entry.model : 'Other models';
      dayData[model] = (dayData[model] || 0) + entry.count;
    }
  }

  // Convert to percentages for each day
  return Array.from(dailyData.entries())
    .map(([date, models]) => {
      const total = Object.values(models).reduce((sum, val) => sum + val, 0);
      const percentages: { [model: string]: number } = {};
      for (const [model, count] of Object.entries(models)) {
        percentages[model] = total > 0 ? Math.round((count / total) * 10000) / 100 : 0;
      }
      return { date, ...percentages };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get language usage per day from JSON records (as percentages)
 */
export function getLanguageUsagePerDayFromRecords(records: NDJSONRecord[]): Array<{
  date: string;
  [language: string]: string | number;
}> {
  // Get all languages and their totals
  const languageTotals = new Map<string, number>();
  for (const record of records) {
    for (const entry of record.totals_by_language_model || []) {
      const lang = entry.language || 'Unknown';
      const count = (entry as any).code_generation_activity_count || (entry as any).count || 0;
      languageTotals.set(lang, (languageTotals.get(lang) || 0) + count);
    }
  }

  // Get top 4 languages, rest as "Other languages"
  const sortedLanguages = Array.from(languageTotals.entries())
    .sort((a, b) => b[1] - a[1]);
  const topLanguages = sortedLanguages.slice(0, 4).map(([lang]) => lang);

  // Build daily data with raw counts first
  const dailyData = new Map<string, { [lang: string]: number }>();
  for (const record of records) {
    if (!dailyData.has(record.day)) {
      const entry: { [lang: string]: number } = {};
      for (const lang of topLanguages) entry[lang] = 0;
      entry['Other languages'] = 0;
      dailyData.set(record.day, entry);
    }
    const dayData = dailyData.get(record.day)!;
    for (const entry of record.totals_by_language_model || []) {
      const lang = entry.language || 'Unknown';
      const count = (entry as any).code_generation_activity_count || (entry as any).count || 0;
      const category = topLanguages.includes(lang) ? lang : 'Other languages';
      dayData[category] = (dayData[category] || 0) + count;
    }
  }

  // Convert to percentages for each day
  return Array.from(dailyData.entries())
    .map(([date, languages]) => {
      const total = Object.values(languages).reduce((sum, val) => sum + val, 0);
      const percentages: { [lang: string]: number } = {};
      for (const [lang, count] of Object.entries(languages)) {
        percentages[lang] = total > 0 ? Math.round((count / total) * 10000) / 100 : 0;
      }
      return { date, ...percentages };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get model usage per language from JSON records
 */
export function getModelUsagePerLanguageFromRecords(records: NDJSONRecord[]): Array<{
  language: string;
  [model: string]: string | number;
}> {
  // Aggregate by language and model
  const langModelCounts = new Map<string, Map<string, number>>();
  const languageTotals = new Map<string, number>();

  for (const record of records) {
    for (const entry of record.totals_by_language_model || []) {
      const lang = entry.language || 'Unknown';
      const model = entry.model || 'Unknown';
      
      // Use code_generation_activity_count as the count metric
      const count = (entry as any).code_generation_activity_count || (entry as any).count || 0;
      
      if (!langModelCounts.has(lang)) {
        langModelCounts.set(lang, new Map());
      }
      const models = langModelCounts.get(lang)!;
      models.set(model, (models.get(model) || 0) + count);
      
      languageTotals.set(lang, (languageTotals.get(lang) || 0) + count);
    }
  }

  // Get top 4 languages + "Other languages"
  const sortedLanguages = Array.from(languageTotals.entries())
    .sort((a, b) => b[1] - a[1]);
  const topLanguages = sortedLanguages.slice(0, 4).map(([lang]) => lang);

  // Aggregate other languages
  const result = new Map<string, Map<string, number>>();
  for (const lang of topLanguages) {
    result.set(lang, langModelCounts.get(lang)!);
  }
  
  // Combine "Other languages"
  const otherModels = new Map<string, number>();
  for (const [lang, models] of langModelCounts.entries()) {
    if (!topLanguages.includes(lang)) {
      for (const [model, count] of models.entries()) {
        otherModels.set(model, (otherModels.get(model) || 0) + count);
      }
    }
  }
  if (otherModels.size > 0) {
    result.set('Other languages', otherModels);
  }

  // Get top 4 models overall + "Other models"
  const modelTotals = new Map<string, number>();
  for (const models of result.values()) {
    for (const [model, count] of models.entries()) {
      modelTotals.set(model, (modelTotals.get(model) || 0) + count);
    }
  }
  const sortedModels = Array.from(modelTotals.entries())
    .sort((a, b) => b[1] - a[1]);
  const topModels = sortedModels.slice(0, 4).map(([m]) => m);

  // Build final result
  const finalResult: Array<{ language: string; [model: string]: string | number }> = [];
  for (const [language, models] of result.entries()) {
    const entry: { language: string; [model: string]: string | number } = { language };
    for (const m of topModels) entry[m] = 0;
    entry['Other models'] = 0;

    for (const [model, count] of models.entries()) {
      if (topModels.includes(model)) {
        entry[model] = (entry[model] as number || 0) + count;
      } else {
        entry['Other models'] = (entry['Other models'] as number || 0) + count;
      }
    }
    finalResult.push(entry);
  }

  return finalResult;
}

/**
 * Get model usage per chat mode from JSON records
 */
export function getModelUsagePerChatModeFromRecords(records: NDJSONRecord[]): Array<{
  model: string;
  edit: number;
  ask: number;
  agent: number;
  custom: number;
  inline: number;
}> {
  const featureToMode: Record<string, 'edit' | 'ask' | 'agent' | 'custom' | 'inline'> = {
    'code_completion': 'inline',
    'chat': 'ask',
    'agent': 'agent',
    'edit': 'edit',
    'chat_panel_agent_mode': 'agent',
    'chat_panel_ask_mode': 'ask',
    'chat_panel_edit_mode': 'edit',
    'chat_panel_custom_mode': 'custom',
    'chat_panel_unknown_mode': 'custom',
    'agent_edit': 'edit',
    'chat_inline': 'inline',
  };

  const modelModes = new Map<string, { edit: number; ask: number; agent: number; custom: number; inline: number }>();


  for (const record of records) {
    for (const entry of record.totals_by_model_feature || []) {
      const model = entry.model || 'Unknown';
      if (!modelModes.has(model)) {
        modelModes.set(model, { edit: 0, ask: 0, agent: 0, custom: 0, inline: 0 });
      }
      const modes = modelModes.get(model)!;
      const mode = featureToMode[entry.feature] || 'custom';
      // Use count or activity counts as the metric
      const count = (entry as any).user_initiated_interaction_count || (entry as any).code_generation_activity_count || entry.count || 0;
      modes[mode] += count;
    }
  }

  // Sort by total usage and get top 4 + "Other models"
  const sorted = Array.from(modelModes.entries())
    .map(([model, modes]) => ({
      model,
      ...modes,
      total: modes.edit + modes.ask + modes.agent + modes.custom + modes.inline
    }))
    .sort((a, b) => b.total - a.total);

  if (sorted.length <= 4) {
    return sorted.map(({ total, ...rest }) => rest);
  }

  const topModels = sorted.slice(0, 4);
  const otherModels = sorted.slice(4);
  const other = {
    model: 'Other models',
    edit: otherModels.reduce((sum, m) => sum + m.edit, 0),
    ask: otherModels.reduce((sum, m) => sum + m.ask, 0),
    agent: otherModels.reduce((sum, m) => sum + m.agent, 0),
    custom: otherModels.reduce((sum, m) => sum + m.custom, 0),
    inline: otherModels.reduce((sum, m) => sum + m.inline, 0),
  };

  return [...topModels.map(({ total, ...rest }) => rest), other];
}

/**
 * Get code completions data from JSON records
 */
export function getCodeCompletionsFromRecords(records: NDJSONRecord[]): Array<{
  date: string;
  suggested: number;
  accepted: number;
}> {
  const dailyData = new Map<string, { suggested: number; accepted: number }>();

  for (const record of records) {
    if (!dailyData.has(record.day)) {
      dailyData.set(record.day, { suggested: 0, accepted: 0 });
    }
    const data = dailyData.get(record.day)!;
    data.suggested += record.code_generation_activity_count;
    data.accepted += record.code_acceptance_activity_count;
  }

  return Array.from(dailyData.entries())
    .map(([date, stats]) => ({ date, ...stats }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get acceptance rate over time from JSON records
 */
export function getAcceptanceRateFromRecords(records: NDJSONRecord[]): Array<{
  date: string;
  rate: number;
}> {
  const dailyData = new Map<string, { suggested: number; accepted: number }>();

  for (const record of records) {
    if (!dailyData.has(record.day)) {
      dailyData.set(record.day, { suggested: 0, accepted: 0 });
    }
    const data = dailyData.get(record.day)!;
    data.suggested += record.code_generation_activity_count;
    data.accepted += record.code_acceptance_activity_count;
  }

  return Array.from(dailyData.entries())
    .map(([date, stats]) => ({
      date,
      rate: stats.suggested > 0 ? Math.round((stats.accepted / stats.suggested) * 1000) / 10 : 0
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
