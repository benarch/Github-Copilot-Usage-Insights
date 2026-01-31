import { createDatabase } from '../models/database.js';

// Generate realistic looking usage data
function generateSeedData() {
  const db = createDatabase();
  
  // Clear existing data
  db.exec(`
    DELETE FROM daily_usage;
    DELETE FROM weekly_usage;
    DELETE FROM chat_mode_requests;
    DELETE FROM model_usage;
    DELETE FROM agent_adoption;
    DELETE FROM user_usage_details;
    DELETE FROM user_usage_by_language_model;
    DELETE FROM user_usage_by_model_feature;
    DELETE FROM user_usage_by_ide;
    DELETE FROM user_usage_by_feature;
    DELETE FROM user_usage_by_language_feature;
  `);

  const today = new Date();
  const modes = ['edit', 'ask', 'agent', 'custom', 'inline'] as const;
  const features = ['code_completion', 'chat', 'agent', 'edit'] as const;
  const models = ['Claude Sonnet 4.5', 'GPT-4o', 'Claude Opus 4', 'Gemini Pro'];
  const languages = ['Python', 'TypeScript', 'JavaScript', 'C#', 'Java', 'Go', 'Rust', 'TSX', 'Ruby', 'PHP'];

  // Sample user logins for user_usage_details
  const userLogins = [
    'alice-dev', 'bob-engineer', 'charlie-ops', 'diana-sre', 'eve-frontend',
    'frank-backend', 'grace-fullstack', 'henry-devops', 'iris-data', 'jack-ml',
    'kate-security', 'leo-platform', 'maya-mobile', 'nick-architect', 'olivia-qa',
    'peter-lead', 'quinn-intern', 'rachel-senior', 'sam-junior', 'tina-manager',
    'uma-consultant', 'victor-contractor', 'wendy-staff', 'xander-principal', 'yuki-designer'
  ];
  const ides = ['VS Code', 'IntelliJ IDEA', 'PyCharm', 'WebStorm', 'Visual Studio', 'Neovim'];
  const ideVersions = ['1.85.0', '1.86.0', '1.87.0', '2023.3', '2024.1', '17.8'];
  const pluginVersions = ['1.150.0', '1.151.0', '1.152.0', '1.153.0'];

  // Generate 60 days of data
  for (let i = 59; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();
    
    // Weekend dip pattern (lower on Sat/Sun)
    const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.3 : 1;
    
    // Base active users with some variance
    const baseUsers = 100 + Math.floor(Math.random() * 50);
    const activeUsers = Math.floor(baseUsers * weekendMultiplier + (Math.random() * 20));
    
    // Suggestions with ~30% acceptance rate
    const totalSuggestions = activeUsers * (15 + Math.floor(Math.random() * 10));
    const acceptedSuggestions = Math.floor(totalSuggestions * (0.28 + Math.random() * 0.08));
    
    // Chat and agent requests
    const chatRequests = activeUsers * (10 + Math.floor(Math.random() * 15));
    const agentRequests = Math.floor(chatRequests * (0.3 + Math.random() * 0.2));

    // Insert daily usage
    db.prepare(`
      INSERT INTO daily_usage (date, active_users, total_suggestions, accepted_suggestions, chat_requests, agent_requests)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(dateStr, activeUsers, totalSuggestions, acceptedSuggestions, chatRequests, agentRequests);

    // Insert chat mode requests
    for (const mode of modes) {
      let requests: number;
      switch (mode) {
        case 'agent':
          requests = Math.floor(chatRequests * (0.35 + Math.random() * 0.1));
          break;
        case 'ask':
          requests = Math.floor(chatRequests * (0.25 + Math.random() * 0.1));
          break;
        case 'edit':
          requests = Math.floor(chatRequests * (0.15 + Math.random() * 0.05));
          break;
        case 'custom':
          requests = Math.floor(chatRequests * (0.1 + Math.random() * 0.05));
          break;
        case 'inline':
          requests = Math.floor(chatRequests * (0.08 + Math.random() * 0.05));
          break;
      }
      
      db.prepare(`
        INSERT INTO chat_mode_requests (date, mode, requests)
        VALUES (?, ?, ?)
      `).run(dateStr, mode, requests);
    }

    // Insert model usage
    for (const model of models) {
      let requests: number;
      if (model === 'Claude Sonnet 4.5') {
        requests = Math.floor(chatRequests * (0.45 + Math.random() * 0.1));
      } else if (model === 'GPT-4o') {
        requests = Math.floor(chatRequests * (0.25 + Math.random() * 0.1));
      } else if (model === 'Claude Opus 4') {
        requests = Math.floor(chatRequests * (0.15 + Math.random() * 0.1));
      } else {
        requests = Math.floor(chatRequests * (0.08 + Math.random() * 0.05));
      }
      
      db.prepare(`
        INSERT INTO model_usage (date, model_name, requests)
        VALUES (?, ?, ?)
      `).run(dateStr, model, requests);
    }

    // Insert agent adoption
    const agentUsers = Math.floor(activeUsers * (0.88 + Math.random() * 0.08));
    db.prepare(`
      INSERT INTO agent_adoption (date, total_active_users, agent_users)
      VALUES (?, ?, ?)
    `).run(dateStr, activeUsers, agentUsers);

    // Insert user-level usage details (only for last 28 days)
    if (i < 28) {
      const reportStartDay = new Date(today);
      reportStartDay.setDate(reportStartDay.getDate() - 27);
      const reportEndDay = today;

      for (const userLogin of userLogins) {
        const userId = `u-${Math.random().toString(36).substr(2, 8)}`;
        const enterpriseId = 'ent-copilot-insights';
        const usedAgent = Math.random() > 0.15 ? 1 : 0;
        const usedChat = Math.random() > 0.1 ? 1 : 0;
        const ide = ides[Math.floor(Math.random() * ides.length)];
        const ideVersion = ideVersions[Math.floor(Math.random() * ideVersions.length)];
        const pluginVersion = pluginVersions[Math.floor(Math.random() * pluginVersions.length)];

        db.prepare(`
          INSERT OR REPLACE INTO user_usage_details (
            report_start_day, report_end_day, day, enterprise_id, user_id, user_login,
            user_initiated_interaction_count, code_generation_activity_count, code_acceptance_activity_count,
            used_agent, used_chat, loc_suggested_to_add_sum, loc_suggested_to_delete_sum,
            loc_added_sum, loc_deleted_sum, primary_ide, primary_ide_version, primary_plugin_version
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          reportStartDay.toISOString().split('T')[0],
          reportEndDay.toISOString().split('T')[0],
          dateStr,
          enterpriseId,
          userId,
          userLogin,
          Math.floor(Math.random() * 50) + 5,
          Math.floor(Math.random() * 100) + 10,
          Math.floor(Math.random() * 80) + 5,
          usedAgent,
          usedChat,
          Math.floor(Math.random() * 500) + 50,
          Math.floor(Math.random() * 100) + 10,
          Math.floor(Math.random() * 400) + 40,
          Math.floor(Math.random() * 80) + 5,
          ide,
          ideVersion,
          pluginVersion
        );

        // Get the last inserted user_usage_details id
        const lastId = db.prepare('SELECT last_insert_rowid() as id').get() as { id: number };
        const userUsageId = lastId.id;

        // Insert user_usage_by_language_model data
        const userLanguages = languages.slice(0, 3 + Math.floor(Math.random() * 4));
        for (const lang of userLanguages) {
          for (const model of models) {
            // Weight models differently - Claude Sonnet 4.5 most popular
            let baseCount = Math.floor(Math.random() * 20) + 1;
            if (model === 'Claude Sonnet 4.5') baseCount *= 3;
            else if (model === 'GPT-4o') baseCount *= 2;
            else if (model === 'Claude Opus 4') baseCount *= 1.5;
            
            if (baseCount > 0) {
              db.prepare(`
                INSERT INTO user_usage_by_language_model (user_usage_id, language, model, count)
                VALUES (?, ?, ?, ?)
              `).run(userUsageId, lang, model, Math.floor(baseCount));
            }
          }
        }

        // Insert user_usage_by_model_feature data
        for (const model of models) {
          for (const feature of features) {
            // Weight models and features differently
            let baseCount = Math.floor(Math.random() * 30) + 1;
            if (model === 'Claude Sonnet 4.5') baseCount *= 3;
            else if (model === 'GPT-4o') baseCount *= 2;
            else if (model === 'Claude Opus 4') baseCount *= 1.5;

            if (feature === 'agent') baseCount *= 2;
            else if (feature === 'chat') baseCount *= 1.5;
            
            if (baseCount > 0) {
              db.prepare(`
                INSERT INTO user_usage_by_model_feature (user_usage_id, model, feature, count)
                VALUES (?, ?, ?, ?)
              `).run(userUsageId, model, feature, Math.floor(baseCount));
            }
          }
        }
      }
    }
  }

  // Generate weekly data
  for (let i = 8; i >= 0; i--) {
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay());
    const weekStartStr = weekStart.toISOString().split('T')[0];
    
    const activeUsers = 130 + Math.floor(Math.random() * 40);
    const totalSuggestions = activeUsers * (100 + Math.floor(Math.random() * 50));
    const acceptedSuggestions = Math.floor(totalSuggestions * 0.32);
    const chatRequests = activeUsers * (60 + Math.floor(Math.random() * 40));
    const agentRequests = Math.floor(chatRequests * 0.4);

    db.prepare(`
      INSERT OR REPLACE INTO weekly_usage (week_start, active_users, total_suggestions, accepted_suggestions, chat_requests, agent_requests)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(weekStartStr, activeUsers, totalSuggestions, acceptedSuggestions, chatRequests, agentRequests);
  }

  console.log('✅ Database seeded successfully!');
  db.close();
}

generateSeedData();
