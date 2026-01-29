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
  `);

  const today = new Date();
  const modes = ['edit', 'ask', 'agent', 'custom', 'inline'] as const;
  const models = ['Claude Sonnet 4.5', 'GPT-4o', 'Claude Opus 4', 'Gemini Pro'];

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
