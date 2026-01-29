import { getDatabase } from '../models/database.js';
import type { Timeframe } from '../models/types.js';

export interface QueryIntent {
  type: 'top_users' | 'ide_stats' | 'feature_adoption' | 'language_stats' | 'model_usage' | 'time_trends' | 'unknown';
  parameters: {
    metric?: 'suggestions' | 'accepted' | 'chat_requests' | 'agent_requests';
    limit?: number;
    timeframe?: Timeframe;
  };
}

export interface ChatResponse {
  response: string;
  data?: any[];
  suggestedFollowups?: string[];
}

// Rule-based keyword matching for query intent recognition
export function recognizeIntent(message: string): QueryIntent {
  const lowerMessage = message.toLowerCase();

  // Top users queries
  if (
    (lowerMessage.includes('top') || lowerMessage.includes('most') || lowerMessage.includes('best')) &&
    (lowerMessage.includes('user') || lowerMessage.includes('developer') || lowerMessage.includes('people'))
  ) {
    const limit = extractNumber(lowerMessage) || 10;
    let metric: 'suggestions' | 'accepted' | 'chat_requests' | 'agent_requests' = 'suggestions';
    
    if (lowerMessage.includes('accept') || lowerMessage.includes('generation')) {
      metric = 'accepted';
    } else if (lowerMessage.includes('chat')) {
      metric = 'chat_requests';
    } else if (lowerMessage.includes('agent')) {
      metric = 'agent_requests';
    }

    return {
      type: 'top_users',
      parameters: { limit, metric, timeframe: '28' },
    };
  }

  // IDE stats queries
  if (lowerMessage.includes('ide') || lowerMessage.includes('editor') || lowerMessage.includes('environment')) {
    return {
      type: 'ide_stats',
      parameters: { timeframe: '28' },
    };
  }

  // Feature adoption queries
  if (
    (lowerMessage.includes('adoption') || lowerMessage.includes('usage')) &&
    (lowerMessage.includes('agent') || lowerMessage.includes('chat') || lowerMessage.includes('feature'))
  ) {
    return {
      type: 'feature_adoption',
      parameters: { timeframe: '28' },
    };
  }

  // Language stats queries
  if (lowerMessage.includes('language') || lowerMessage.includes('programming')) {
    return {
      type: 'language_stats',
      parameters: { timeframe: '28' },
    };
  }

  // Model usage queries
  if (lowerMessage.includes('model') || lowerMessage.includes('gpt') || lowerMessage.includes('ai')) {
    return {
      type: 'model_usage',
      parameters: { timeframe: '28' },
    };
  }

  // Time trends queries
  if (
    lowerMessage.includes('trend') ||
    lowerMessage.includes('over time') ||
    lowerMessage.includes('daily') ||
    lowerMessage.includes('weekly')
  ) {
    return {
      type: 'time_trends',
      parameters: { timeframe: '28' },
    };
  }

  return {
    type: 'unknown',
    parameters: {},
  };
}

function extractNumber(text: string): number | null {
  const match = text.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

function getDateRange(days: number): { startDate: string; endDate: string } {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
}

export function processQuery(message: string, timeframe: Timeframe = '28'): ChatResponse {
  const intent = recognizeIntent(message);
  const db = getDatabase();
  const days = parseInt(timeframe);
  const { startDate, endDate } = getDateRange(days);

  switch (intent.type) {
    case 'top_users': {
      // Since we don't have a user_usage_details table, we'll provide a mock response
      // In a real implementation, this would query actual user data
      const limit = intent.parameters.limit || 10;
      const metric = intent.parameters.metric || 'suggestions';
      
      return {
        response: `Here are the top ${limit} users by ${metric.replace('_', ' ')}:\n\n` +
          `Note: This is a demo response. In a production environment, this would query actual user data from the database.\n\n` +
          `The system tracks daily usage patterns including:\n` +
          `- Total suggestions made\n` +
          `- Accepted suggestions\n` +
          `- Chat requests\n` +
          `- Agent requests`,
        data: [],
        suggestedFollowups: [
          'Show acceptance rates',
          'Compare to last month',
          'Show IDE usage breakdown',
        ],
      };
    }

    case 'ide_stats': {
      // Get active users from daily usage as a proxy for IDE stats
      const row = db.prepare(`
        SELECT active_users FROM daily_usage 
        WHERE date BETWEEN ? AND ? 
        ORDER BY date DESC LIMIT 1
      `).get(startDate, endDate) as { active_users: number } | undefined;

      const activeUsers = row?.active_users || 0;

      return {
        response: `IDE Usage Statistics (Last ${days} days):\n\n` +
          `📊 Active IDE Users: ${activeUsers}\n\n` +
          `The system tracks IDE-level activity including:\n` +
          `- Daily active users across all IDEs\n` +
          `- Code suggestions and acceptances\n` +
          `- Chat and agent interactions\n\n` +
          `*Note: Detailed per-IDE breakdown requires additional data tables.*`,
        data: [{ activeUsers }],
        suggestedFollowups: [
          'Show daily trends',
          'Compare timeframes',
          'Show most active users',
        ],
      };
    }

    case 'feature_adoption': {
      const agentRow = db.prepare(`
        SELECT total_active_users, agent_users 
        FROM agent_adoption 
        WHERE date BETWEEN ? AND ? 
        ORDER BY date DESC LIMIT 1
      `).get(startDate, endDate) as { total_active_users: number; agent_users: number } | undefined;

      const totalUsers = agentRow?.total_active_users || 0;
      const agentUsers = agentRow?.agent_users || 0;
      const percentage = totalUsers > 0 ? Math.round((agentUsers / totalUsers) * 100) : 0;

      return {
        response: `Feature Adoption Statistics (Last ${days} days):\n\n` +
          `🤖 Agent Adoption Rate: ${percentage}%\n` +
          `👥 Agent Users: ${agentUsers} out of ${totalUsers} total users\n\n` +
          `Agent features represent advanced Copilot capabilities including:\n` +
          `- Code generation assistance\n` +
          `- Context-aware suggestions\n` +
          `- Interactive coding support`,
        data: [{ totalUsers, agentUsers, percentage }],
        suggestedFollowups: [
          'Show adoption trends over time',
          'Compare chat vs agent usage',
          'Show model usage statistics',
        ],
      };
    }

    case 'language_stats': {
      return {
        response: `Programming Language Statistics:\n\n` +
          `The system tracks language-specific usage patterns including:\n` +
          `- Code suggestions by language\n` +
          `- Acceptance rates per language\n` +
          `- Most active languages\n\n` +
          `*Note: Detailed language breakdown requires the user_usage_by_language_feature table.*`,
        data: [],
        suggestedFollowups: [
          'Show overall usage trends',
          'Show IDE statistics',
          'Show top users',
        ],
      };
    }

    case 'model_usage': {
      const rows = db.prepare(`
        SELECT model_name, SUM(requests) as total_requests 
        FROM model_usage 
        WHERE date BETWEEN ? AND ? 
        GROUP BY model_name 
        ORDER BY total_requests DESC
      `).all(startDate, endDate) as { model_name: string; total_requests: number }[];

      if (rows.length === 0) {
        return {
          response: `No model usage data available for the selected timeframe.`,
          data: [],
          suggestedFollowups: ['Show overall statistics', 'Show feature adoption'],
        };
      }

      const total = rows.reduce((sum, row) => sum + row.total_requests, 0);
      let response = `AI Model Usage Statistics (Last ${days} days):\n\n`;
      
      rows.forEach((row, index) => {
        const percentage = total > 0 ? Math.round((row.total_requests / total) * 100) : 0;
        response += `${index + 1}. ${row.model_name}: ${row.total_requests.toLocaleString()} requests (${percentage}%)\n`;
      });

      response += `\n📊 Total Requests: ${total.toLocaleString()}`;

      return {
        response,
        data: rows,
        suggestedFollowups: [
          'Show daily trends',
          'Compare to previous period',
          'Show chat mode breakdown',
        ],
      };
    }

    case 'time_trends': {
      const rows = db.prepare(`
        SELECT date, active_users, total_suggestions, accepted_suggestions, chat_requests, agent_requests
        FROM daily_usage 
        WHERE date BETWEEN ? AND ? 
        ORDER BY date DESC
        LIMIT 7
      `).all(startDate, endDate) as Array<{
        date: string;
        active_users: number;
        total_suggestions: number;
        accepted_suggestions: number;
        chat_requests: number;
        agent_requests: number;
      }>;

      if (rows.length === 0) {
        return {
          response: `No trend data available for the selected timeframe.`,
          data: [],
          suggestedFollowups: ['Show current statistics', 'Show model usage'],
        };
      }

      let response = `Usage Trends (Last 7 days):\n\n`;
      
      rows.reverse().forEach((row) => {
        const acceptanceRate = row.total_suggestions > 0 
          ? Math.round((row.accepted_suggestions / row.total_suggestions) * 100) 
          : 0;
        
        response += `📅 ${row.date}:\n`;
        response += `  • Active Users: ${row.active_users}\n`;
        response += `  • Suggestions: ${row.total_suggestions} (${acceptanceRate}% accepted)\n`;
        response += `  • Chat: ${row.chat_requests} | Agent: ${row.agent_requests}\n\n`;
      });

      return {
        response,
        data: rows,
        suggestedFollowups: [
          'Show weekly summary',
          'Compare to last month',
          'Show top users',
        ],
      };
    }

    default: {
      return {
        response: `I'm not sure how to answer that question. Here are some things you can ask me:\n\n` +
          `• "Who are the top 10 users?"\n` +
          `• "What are the most used IDEs?"\n` +
          `• "Show agent adoption statistics"\n` +
          `• "What models are being used?"\n` +
          `• "Show usage trends"\n` +
          `• "What are the language statistics?"\n\n` +
          `Try rephrasing your question or use one of the suggested queries above.`,
        data: [],
        suggestedFollowups: [
          'Show daily usage summary',
          'Top 10 active users',
          'Model usage statistics',
        ],
      };
    }
  }
}
