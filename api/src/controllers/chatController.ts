import { processQuery, type ChatResponse } from '../services/chatAgent.js';
import type { Timeframe } from '../models/types.js';

export interface ChatRequest {
  message: string;
  context?: {
    timeframe?: Timeframe;
  };
}

export function handleChatMessage(request: ChatRequest): ChatResponse {
  const { message, context } = request;
  const timeframe = context?.timeframe || '28';
  
  return processQuery(message, timeframe);
}
