import { Router, Request, Response } from 'express';
import * as chatController from '../controllers/chatController.js';
import type { ChatRequest } from '../controllers/chatController.js';

const router = Router();

/**
 * @openapi
 * /api/chat:
 *   post:
 *     summary: Send a chat message to the AI agent
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: Natural language query from the user
 *                 example: "Who are the top 5 users by code generation?"
 *               context:
 *                 type: object
 *                 properties:
 *                   timeframe:
 *                     type: string
 *                     enum: [7, 14, 28]
 *                     default: 28
 *                     description: Number of days to include in the query
 *     responses:
 *       200:
 *         description: Chat response with answer and suggested follow-ups
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                   description: Natural language response
 *                 data:
 *                   type: array
 *                   description: Optional structured data
 *                 suggestedFollowups:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Suggested follow-up questions
 *       400:
 *         description: Invalid request body
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const request = req.body as ChatRequest;
    
    if (!request.message || typeof request.message !== 'string') {
      return res.status(400).json({ error: 'Message is required and must be a string' });
    }

    const response = chatController.handleChatMessage(request);
    res.json(response);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'An error occurred while processing your message',
      response: 'Sorry, I encountered an error processing your request. Please try again.',
      suggestedFollowups: ['Show daily usage summary', 'Show model usage statistics'],
    });
  }
});

export default router;
