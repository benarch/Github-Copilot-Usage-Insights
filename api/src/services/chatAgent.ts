import { getDatabase } from '../models/database.js';
import type { Timeframe } from '../models/types.js';

export interface QueryIntent {
  type: 'top_users' | 'ide_stats' | 'feature_adoption' | 'language_stats' | 'model_usage' | 'time_trends' | 'search_user' | 'list_users' | 'user_count' | 'unknown';
  parameters: {
    metric?: 'suggestions' | 'accepted' | 'chat_requests' | 'agent_requests' | 'interactions';
    limit?: number;
    timeframe?: Timeframe;
    searchTerm?: string;
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

  // User search queries (e.g., "find user john", "search alice")
  const searchMatch = lowerMessage.match(/(?:find|search|look up|show)\s+(?:user\s+)?(\w+)/);
  if (searchMatch && !lowerMessage.includes('top') && !lowerMessage.includes('all')) {
    return {
      type: 'search_user',
      parameters: { searchTerm: searchMatch[1], timeframe: '28' },
    };
  }

  // User count queries
  if (
    (lowerMessage.includes('how many') || lowerMessage.includes('count') || lowerMessage.includes('total')) &&
    (lowerMessage.includes('user') || lowerMessage.includes('people') || lowerMessage.includes('member'))
  ) {
    return {
      type: 'user_count',
      parameters: { timeframe: '28' },
    };
  }

  // List users queries
  if (
    (lowerMessage.includes('list') || lowerMessage.includes('show all') || lowerMessage.includes('all users')) &&
    (lowerMessage.includes('user') || lowerMessage.includes('people') || lowerMessage.includes('member'))
  ) {
    const limit = extractNumber(lowerMessage) || 20;
    return {
      type: 'list_users',
      parameters: { limit, timeframe: '28' },
    };
  }

  // Top users queries
  if (
    (lowerMessage.includes('top') || lowerMessage.includes('most') || lowerMessage.includes('best') || lowerMessage.includes('active')) &&
    (lowerMessage.includes('user') || lowerMessage.includes('developer') || lowerMessage.includes('people'))
  ) {
    const limit = extractNumber(lowerMessage) || 10;
    let metric: 'suggestions' | 'accepted' | 'chat_requests' | 'agent_requests' | 'interactions' = 'interactions';
    
    if (lowerMessage.includes('accept') || lowerMessage.includes('generation')) {
      metric = 'accepted';
    } else if (lowerMessage.includes('chat')) {
      metric = 'chat_requests';
    } else if (lowerMessage.includes('agent')) {
      metric = 'agent_requests';
    } else if (lowerMessage.includes('suggestion')) {
      metric = 'suggestions';
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
      const limit = intent.parameters.limit || 10;
      const metric = intent.parameters.metric || 'interactions';
      
      // Query real user data from user_usage_details
      let orderByColumn = 'interactions';
      let metricLabel = 'interactions';
      
      switch (metric) {
        case 'accepted':
          orderByColumn = 'accepted';
          metricLabel = 'code acceptances';
          break;
        case 'suggestions':
          orderByColumn = 'suggestions';
          metricLabel = 'code suggestions';
          break;
        case 'interactions':
        default:
          orderByColumn = 'interactions';
          metricLabel = 'interactions';
          break;
      }
      
      const topUsers = db.prepare(`
        SELECT 
          user_login,
          user_id,
          enterprise_id,
          primary_ide,
          SUM(user_initiated_interaction_count) as interactions,
          SUM(code_generation_activity_count) as suggestions,
          SUM(code_acceptance_activity_count) as accepted,
          SUM(loc_added_sum) as lines_added
        FROM user_usage_details
        GROUP BY user_id
        ORDER BY ${orderByColumn} DESC
        LIMIT ?
      `).all(limit) as Array<{
        user_login: string;
        user_id: number;
        enterprise_id: string;
        primary_ide: string | null;
        interactions: number;
        suggestions: number;
        accepted: number;
        lines_added: number;
      }>;

      if (topUsers.length === 0) {
        return {
          response: 'No user data available. Please upload a JSON file first.',
          data: [],
          suggestedFollowups: ['Show IDE statistics', 'Show model usage'],
        };
      }

      let response = `🏆 Top ${topUsers.length} Users by ${metricLabel}:\n\n`;
      
      topUsers.forEach((user, index) => {
        const acceptRate = user.suggestions > 0 ? Math.round((user.accepted / user.suggestions) * 100) : 0;
        response += `${index + 1}. **${user.user_login}** (ID: ${user.user_id})\n`;
        response += `   • Interactions: ${user.interactions.toLocaleString()}\n`;
        response += `   • Suggestions: ${user.suggestions.toLocaleString()} (${acceptRate}% accepted)\n`;
        response += `   • Lines Added: ${user.lines_added.toLocaleString()}\n`;
        response += `   • IDE: ${user.primary_ide || 'Unknown'}\n\n`;
      });

      return {
        response,
        data: topUsers,
        suggestedFollowups: [
          'Show IDE usage breakdown',
          'Show language statistics',
          'How many total users?',
        ],
      };
    }

    case 'ide_stats': {
      // Get IDE stats from user_usage_by_ide joined with user_usage_details
      const ideStats = db.prepare(`
        SELECT 
          i.ide,
          SUM(i.code_gen_count) as suggestions,
          SUM(i.acceptance_count) as accepted,
          SUM(i.loc_added) as lines_added,
          COUNT(DISTINCT u.user_id) as user_count
        FROM user_usage_by_ide i
        JOIN user_usage_details u ON i.user_usage_id = u.id
        GROUP BY i.ide
        ORDER BY suggestions DESC
      `).all() as Array<{
        ide: string;
        suggestions: number;
        accepted: number;
        lines_added: number;
        user_count: number;
      }>;

      if (ideStats.length === 0) {
        // Fallback to primary_ide from user_usage_details
        const primaryIdeStats = db.prepare(`
          SELECT 
            primary_ide as ide,
            COUNT(DISTINCT user_id) as user_count,
            SUM(code_generation_activity_count) as suggestions,
            SUM(code_acceptance_activity_count) as accepted,
            SUM(loc_added_sum) as lines_added
          FROM user_usage_details
          WHERE primary_ide IS NOT NULL AND primary_ide != ''
          GROUP BY primary_ide
          ORDER BY user_count DESC
        `).all() as Array<{
          ide: string;
          user_count: number;
          suggestions: number;
          accepted: number;
          lines_added: number;
        }>;

        if (primaryIdeStats.length === 0) {
          return {
            response: 'No IDE usage data available. Please upload a JSON file first.',
            data: [],
            suggestedFollowups: ['Show top users', 'Show model usage'],
          };
        }

        const total = primaryIdeStats.reduce((sum, row) => sum + row.user_count, 0);
        let response = `💻 IDE Usage Statistics:\n\n`;
        
        primaryIdeStats.forEach((row, index) => {
          const percentage = total > 0 ? Math.round((row.user_count / total) * 100) : 0;
          const acceptRate = row.suggestions > 0 ? Math.round((row.accepted / row.suggestions) * 100) : 0;
          response += `${index + 1}. **${row.ide}**\n`;
          response += `   • Users: ${row.user_count} (${percentage}%)\n`;
          response += `   • Suggestions: ${row.suggestions.toLocaleString()} (${acceptRate}% accepted)\n`;
          response += `   • Lines Added: ${row.lines_added.toLocaleString()}\n\n`;
        });

        response += `\n📊 Total Users: ${total}`;

        return {
          response,
          data: primaryIdeStats,
          suggestedFollowups: [
            'Show top users',
            'Show language statistics',
            'Show model usage',
          ],
        };
      }

      const total = ideStats.reduce((sum, row) => sum + row.user_count, 0);
      let response = `💻 IDE Usage Statistics:\n\n`;
      
      ideStats.forEach((row, index) => {
        const percentage = total > 0 ? Math.round((row.user_count / total) * 100) : 0;
        const acceptRate = row.suggestions > 0 ? Math.round((row.accepted / row.suggestions) * 100) : 0;
        response += `${index + 1}. **${row.ide}**\n`;
        response += `   • Users: ${row.user_count} (${percentage}%)\n`;
        response += `   • Suggestions: ${row.suggestions.toLocaleString()} (${acceptRate}% accepted)\n`;
        response += `   • Lines Added: ${row.lines_added.toLocaleString()}\n\n`;
      });

      response += `\n📊 Total Users: ${total}`;

      return {
        response,
        data: ideStats,
        suggestedFollowups: [
          'Show top users',
          'Show language statistics',
          'Show model usage',
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
      // Get language stats from user_usage_by_language_model
      const langStats = db.prepare(`
        SELECT 
          language,
          SUM(count) as usage_count,
          COUNT(DISTINCT user_usage_id) as user_count
        FROM user_usage_by_language_model
        GROUP BY language
        ORDER BY usage_count DESC
        LIMIT 15
      `).all() as Array<{
        language: string;
        usage_count: number;
        user_count: number;
      }>;

      if (langStats.length === 0) {
        return {
          response: 'No language usage data available. Please upload a JSON file first.',
          data: [],
          suggestedFollowups: ['Show top users', 'Show IDE statistics'],
        };
      }

      const total = langStats.reduce((sum, row) => sum + row.usage_count, 0);
      let response = `📝 Programming Language Statistics:\n\n`;
      
      langStats.forEach((row, index) => {
        const percentage = total > 0 ? Math.round((row.usage_count / total) * 100) : 0;
        response += `${index + 1}. **${row.language}**\n`;
        response += `   • Requests: ${row.usage_count.toLocaleString()} (${percentage}%)\n`;
        response += `   • Users: ${row.user_count}\n\n`;
      });

      response += `\n📊 Total Requests: ${total.toLocaleString()}`;

      return {
        response,
        data: langStats,
        suggestedFollowups: [
          'Show top users',
          'Show model usage',
          'Show IDE statistics',
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

    case 'search_user': {
      const searchTerm = intent.parameters.searchTerm || '';
      const searchPattern = `%${searchTerm}%`;
      
      const users = db.prepare(`
        SELECT 
          user_login,
          user_id,
          enterprise_id,
          primary_ide,
          SUM(user_initiated_interaction_count) as interactions,
          SUM(code_generation_activity_count) as suggestions,
          SUM(code_acceptance_activity_count) as accepted,
          SUM(loc_added_sum) as lines_added
        FROM user_usage_details
        WHERE user_login LIKE ? OR CAST(user_id AS TEXT) LIKE ?
        GROUP BY user_id
        ORDER BY interactions DESC
        LIMIT 10
      `).all(searchPattern, searchPattern) as Array<{
        user_login: string;
        user_id: number;
        enterprise_id: string;
        primary_ide: string | null;
        interactions: number;
        suggestions: number;
        accepted: number;
        lines_added: number;
      }>;

      if (users.length === 0) {
        return {
          response: `No users found matching "${searchTerm}".`,
          data: [],
          suggestedFollowups: ['List all users', 'Show top users', 'How many users?'],
        };
      }

      let response = `🔍 Search Results for "${searchTerm}":\n\n`;
      
      users.forEach((user, index) => {
        const acceptRate = user.suggestions > 0 ? Math.round((user.accepted / user.suggestions) * 100) : 0;
        response += `${index + 1}. **${user.user_login}** (ID: ${user.user_id})\n`;
        response += `   • Enterprise: ${user.enterprise_id}\n`;
        response += `   • Interactions: ${user.interactions.toLocaleString()}\n`;
        response += `   • Suggestions: ${user.suggestions.toLocaleString()} (${acceptRate}% accepted)\n`;
        response += `   • Lines Added: ${user.lines_added.toLocaleString()}\n`;
        response += `   • IDE: ${user.primary_ide || 'Unknown'}\n\n`;
      });

      return {
        response,
        data: users,
        suggestedFollowups: [
          'Show top users',
          'Show IDE statistics',
          'Show language statistics',
        ],
      };
    }

    case 'list_users': {
      const limit = intent.parameters.limit || 20;
      
      const users = db.prepare(`
        SELECT 
          user_login,
          user_id,
          enterprise_id,
          primary_ide,
          SUM(user_initiated_interaction_count) as interactions,
          SUM(code_generation_activity_count) as suggestions,
          SUM(code_acceptance_activity_count) as accepted
        FROM user_usage_details
        GROUP BY user_id
        ORDER BY user_login ASC
        LIMIT ?
      `).all(limit) as Array<{
        user_login: string;
        user_id: number;
        enterprise_id: string;
        primary_ide: string | null;
        interactions: number;
        suggestions: number;
        accepted: number;
      }>;

      if (users.length === 0) {
        return {
          response: 'No users found. Please upload a JSON file first.',
          data: [],
          suggestedFollowups: ['Show model usage', 'Show IDE statistics'],
        };
      }

      let response = `👥 Users List (${users.length} shown):\n\n`;
      
      users.forEach((user, index) => {
        response += `${index + 1}. **${user.user_login}** (ID: ${user.user_id}) - ${user.interactions} interactions, IDE: ${user.primary_ide || 'Unknown'}\n`;
      });

      const totalCount = db.prepare('SELECT COUNT(DISTINCT user_id) as count FROM user_usage_details').get() as { count: number };
      response += `\n📊 Total Users in Database: ${totalCount.count}`;

      return {
        response,
        data: users,
        suggestedFollowups: [
          'Show top users',
          'Find user <name>',
          'Show IDE statistics',
        ],
      };
    }

    case 'user_count': {
      const counts = db.prepare(`
        SELECT 
          COUNT(DISTINCT user_id) as total_users,
          COUNT(DISTINCT enterprise_id) as total_enterprises,
          COUNT(DISTINCT primary_ide) as total_ides
        FROM user_usage_details
      `).get() as { total_users: number; total_enterprises: number; total_ides: number };

      const agentUsers = db.prepare(`
        SELECT COUNT(DISTINCT user_id) as count FROM user_usage_details WHERE used_agent = 1
      `).get() as { count: number };

      const chatUsers = db.prepare(`
        SELECT COUNT(DISTINCT user_id) as count FROM user_usage_details WHERE used_chat = 1
      `).get() as { count: number };

      return {
        response: `📊 User Statistics:\n\n` +
          `👥 **Total Users:** ${counts.total_users}\n` +
          `🏢 **Enterprises:** ${counts.total_enterprises}\n` +
          `💻 **Different IDEs:** ${counts.total_ides}\n` +
          `🤖 **Agent Users:** ${agentUsers.count} (${Math.round((agentUsers.count / counts.total_users) * 100)}%)\n` +
          `💬 **Chat Users:** ${chatUsers.count} (${Math.round((chatUsers.count / counts.total_users) * 100)}%)`,
        data: [{ ...counts, agent_users: agentUsers.count, chat_users: chatUsers.count }],
        suggestedFollowups: [
          'Show top users',
          'List all users',
          'Show IDE statistics',
        ],
      };
    }

    default: {
      return {
        response: `I'm not sure how to answer that question. Here are some things you can ask me:\n\n` +
          `• "Who are the top 10 users?"\n` +
          `• "How many users?"\n` +
          `• "Find user alice"\n` +
          `• "List all users"\n` +
          `• "What are the most used IDEs?"\n` +
          `• "Show language statistics"\n` +
          `• "What models are being used?"\n` +
          `• "Show usage trends"\n\n` +
          `Try rephrasing your question or use one of the suggested queries above.`,
        data: [],
        suggestedFollowups: [
          'Top 10 active users',
          'How many users?',
          'Show IDE statistics',
        ],
      };
    }
  }
}
