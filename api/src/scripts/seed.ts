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
  
  // Chat modes for panel interactions
  const modes = ['agent', 'ask', 'edit', 'custom', 'inline'] as const;
  
  // Features/usage types - comprehensive list
  const features = [
    'code_completion',           // Inline code completions
    'chat_panel_agent_mode',     // Chat panel - agent mode
    'chat_panel_ask_mode',       // Chat panel - ask mode  
    'chat_panel_edit_mode',      // Chat panel - edit mode
    'chat_panel_custom_mode',    // Chat panel - custom instructions
    'chat_inline',               // Inline chat assistance
    'agent_edit'                 // Agent-driven code edits
  ] as const;
  
  // 30+ models - comprehensive list including all major providers
  const models = [
    // Claude models (Anthropic)
    'claude-4.5-sonnet',         // Primary - most popular
    'claude-opus-4.5',           // Premium reasoning
    'claude-4.0-sonnet',         // Previous generation
    'claude-4.5-haiku',          // Fast & efficient
    'claude-opus-4.1',           // Legacy premium
    'claude-3.5-sonnet',         // Legacy
    'claude-3.5-haiku',          // Legacy fast
    
    // GPT models (OpenAI)
    'gpt-5.2',                   // Latest flagship
    'gpt-5.2-codex',             // Latest code-optimized
    'gpt-5.1',                   // Previous flagship
    'gpt-5.1-codex',             // Previous code-optimized
    'gpt-5.1-codex-max',         // Max context version
    'gpt-5.1-codex-mini',        // Efficient version
    'gpt-5.0',                   // Earlier GPT-5
    'gpt-5-codex',               // Base GPT-5 codex
    'gpt-5-mini',                // Efficient GPT-5
    'gpt-4.1',                   // GPT-4 refresh
    'gpt-4o',                    // Omni model
    'gpt-4o-mini',               // Efficient omni
    
    // Gemini models (Google)
    'gemini-3.0-pro',            // Latest pro
    'gemini-3.0-flash',          // Fast inference
    'gemini-2.5-pro',            // Previous generation
    'gemini-2.5-flash',          // Previous fast
    'gemini-2.0-pro',            // Legacy
    
    // Grok models (xAI)
    'grok-3',                    // Latest Grok
    'grok-3-fast',               // Fast inference
    'grok-code-1',               // Code-specialized
    'grok-code-fast-1',          // Fast code model
    'grok-2',                    // Previous generation
    'grok-2-mini',               // Efficient Grok
    
    // Other/Meta
    'auto',                      // Auto model selection
    'llama-4-code',              // Meta Llama for code
    'codestral-2',               // Mistral code model
  ];
  
  // Model weights for realistic distribution
  const modelWeights: Record<string, number> = {
    // Claude (dominant ~45%)
    'claude-4.5-sonnet': 35,
    'claude-opus-4.5': 6,
    'claude-4.0-sonnet': 1.5,
    'claude-4.5-haiku': 1.2,
    'claude-opus-4.1': 0.3,
    'claude-3.5-sonnet': 0.5,
    'claude-3.5-haiku': 0.3,
    
    // GPT (~30%)
    'gpt-5.2': 8,
    'gpt-5.2-codex': 6,
    'gpt-5.1': 3,
    'gpt-5.1-codex': 4,
    'gpt-5.1-codex-max': 2,
    'gpt-5.1-codex-mini': 1,
    'gpt-5.0': 2,
    'gpt-5-codex': 1.5,
    'gpt-5-mini': 1,
    'gpt-4.1': 0.8,
    'gpt-4o': 0.5,
    'gpt-4o-mini': 0.3,
    
    // Gemini (~12%)
    'gemini-3.0-pro': 5,
    'gemini-3.0-flash': 3,
    'gemini-2.5-pro': 2,
    'gemini-2.5-flash': 1.2,
    'gemini-2.0-pro': 0.5,
    
    // Grok (~8%)
    'grok-3': 3,
    'grok-3-fast': 2,
    'grok-code-1': 1.5,
    'grok-code-fast-1': 0.8,
    'grok-2': 0.4,
    'grok-2-mini': 0.2,
    
    // Other (~5%)
    'auto': 2,
    'llama-4-code': 1.5,
    'codestral-2': 1,
  };
  
  // Programming languages - comprehensive list
  const languages = [
    'typescript', 'python', 'javascript', 'c#', 'java', 'go', 'rust', 
    'typescriptreact', 'ruby', 'php', 'kotlin', 'swift', 'scala', 'c++',
    'c', 'dart', 'lua', 'r', 'julia', 'haskell', 'elixir', 'clojure',
    'sql', 'shell', 'powershell', 'terraform', 'yaml'
  ];

  // Sample user logins for user_usage_details (expanded)
  const userLogins = [
    'alice-dev', 'bob-engineer', 'charlie-ops', 'diana-sre', 'eve-frontend',
    'frank-backend', 'grace-fullstack', 'henry-devops', 'iris-data', 'jack-ml',
    'kate-security', 'leo-platform', 'maya-mobile', 'nick-architect', 'olivia-qa',
    'peter-lead', 'quinn-intern', 'rachel-senior', 'sam-junior', 'tina-manager',
    'uma-consultant', 'victor-contractor', 'wendy-staff', 'xander-principal', 'yuki-designer',
    'zara-cloud', 'alex-infra', 'bella-api', 'carlos-db', 'dani-ui',
    'elena-systems', 'felix-network', 'gina-devsec', 'hiro-swo', 'ivan-support'
  ];
  
  // IDEs - comprehensive list
  const ides = [
    'vscode', 'IntelliJ IDEA', 'PyCharm', 'WebStorm', 'Visual Studio', 'Neovim',
    'Eclipse', 'Xcode', 'Cursor', 'Android Studio', 'GoLand', 'RubyMine', 
    'PhpStorm', 'Rider', 'CLion', 'DataGrip', 'Fleet'
  ];
  
  // IDE weights for realistic distribution (vscode is dominant)
  const ideWeights: Record<string, number> = {
    'vscode': 45,            // Most popular - dominant share
    'IntelliJ IDEA': 12,     // Popular for Java/Kotlin
    'Visual Studio': 8,      // Popular for .NET
    'PyCharm': 7,            // Popular for Python
    'Cursor': 6,             // Growing AI-focused IDE
    'WebStorm': 4,           // JavaScript/TypeScript
    'Neovim': 3,             // Terminal enthusiasts
    'Android Studio': 3,     // Android development
    'Xcode': 3,              // iOS/macOS development
    'GoLand': 2,             // Go development
    'PhpStorm': 2,           // PHP development
    'RubyMine': 1.5,         // Ruby development
    'Rider': 1.5,            // .NET cross-platform
    'Eclipse': 1,            // Legacy Java
    'CLion': 0.8,            // C/C++ development
    'DataGrip': 0.6,         // Database tool
    'Fleet': 0.4,            // JetBrains new IDE
  };
  
  // Helper function for weighted random selection
  function weightedRandomSelect<T extends string>(items: T[], weights: Record<string, number>): T {
    const totalWeight = items.reduce((sum, item) => sum + (weights[item] || 1), 0);
    let random = Math.random() * totalWeight;
    for (const item of items) {
      random -= weights[item] || 1;
      if (random <= 0) return item;
    }
    return items[0];
  }
  
  const ideVersions = ['1.85.0', '1.86.0', '1.87.0', '1.88.0', '1.89.0', '2023.3', '2024.1', '2024.2', '17.8', '17.9'];
  const pluginVersions = ['1.150.0', '1.151.0', '1.152.0', '1.153.0', '1.154.0', '1.155.0'];

  // Generate 90 days of data (3 months)
  for (let i = 89; i >= 0; i--) {
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

    // Insert model usage with realistic weighted distribution
    for (const model of models) {
      const weight = modelWeights[model] || 0.1;
      // Add some variance (±20% of weight)
      const variance = weight * 0.2 * (Math.random() - 0.5);
      const requests = Math.floor(chatRequests * (weight + variance) / 100);
      
      if (requests > 0) {
        db.prepare(`
          INSERT INTO model_usage (date, model_name, requests)
          VALUES (?, ?, ?)
        `).run(dateStr, model, requests);
      }
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
        const ide = weightedRandomSelect(ides, ideWeights);
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
        // Select a subset of models for each user (realistic - users don't use all models)
        const userModels = models.filter(() => Math.random() < 0.4).slice(0, 5 + Math.floor(Math.random() * 5));
        if (userModels.length === 0) userModels.push('claude-4.5-sonnet'); // ensure at least one
        for (const lang of userLanguages) {
          for (const model of userModels) {
            const weight = modelWeights[model] || 0.1;
            const baseCount = Math.floor(Math.random() * 20 * (weight / 10)) + 1;
            
            if (baseCount > 0) {
              db.prepare(`
                INSERT INTO user_usage_by_language_model (user_usage_id, language, model, count)
                VALUES (?, ?, ?, ?)
              `).run(userUsageId, lang, model, Math.floor(baseCount));
            }
          }
        }

        // Insert user_usage_by_model_feature data - use same subset of models
        for (const model of userModels) {
          for (const feature of features) {
            const weight = modelWeights[model] || 0.1;
            let baseCount = Math.floor(Math.random() * 30 * (weight / 10)) + 1;

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
