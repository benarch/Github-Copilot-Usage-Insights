import { Router, Request, Response } from 'express';
import { TimeframeSchema } from '../models/types.js';
import * as usageController from '../controllers/usageController.js';

const router = Router();

/**
 * @openapi
 * /api/usage/summary:
 *   get:
 *     summary: Get dashboard summary statistics
 *     tags: [Usage]
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [7, 14, 28]
 *           default: 28
 *         description: Number of days to include
 *     responses:
 *       200:
 *         description: Dashboard summary data
 */
router.get('/summary', (req: Request, res: Response) => {
  try {
    const timeframe = TimeframeSchema.parse(req.query.timeframe || '28');
    const summary = usageController.getDashboardSummary(timeframe);
    res.json(summary);
  } catch (error) {
    res.status(400).json({ error: 'Invalid timeframe parameter' });
  }
});

/**
 * @openapi
 * /api/usage/daily-active-users:
 *   get:
 *     summary: Get daily active users chart data
 *     tags: [Usage]
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [7, 14, 28]
 *           default: 28
 *     responses:
 *       200:
 *         description: Daily active users data points
 */
router.get('/daily-active-users', (req: Request, res: Response) => {
  try {
    const timeframe = TimeframeSchema.parse(req.query.timeframe || '28');
    const data = usageController.getDailyActiveUsers(timeframe);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: 'Invalid timeframe parameter' });
  }
});

/**
 * @openapi
 * /api/usage/weekly-active-users:
 *   get:
 *     summary: Get weekly active users chart data
 *     tags: [Usage]
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [7, 14, 28]
 *           default: 28
 *     responses:
 *       200:
 *         description: Weekly active users data points
 */
router.get('/weekly-active-users', (req: Request, res: Response) => {
  try {
    const timeframe = TimeframeSchema.parse(req.query.timeframe || '28');
    const data = usageController.getWeeklyActiveUsers(timeframe);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: 'Invalid timeframe parameter' });
  }
});

/**
 * @openapi
 * /api/usage/avg-chat-requests:
 *   get:
 *     summary: Get average chat requests per active user
 *     tags: [Usage]
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [7, 14, 28]
 *           default: 28
 *     responses:
 *       200:
 *         description: Average chat requests per user data points
 */
router.get('/avg-chat-requests', (req: Request, res: Response) => {
  try {
    const timeframe = TimeframeSchema.parse(req.query.timeframe || '28');
    const data = usageController.getAverageChatRequestsPerUser(timeframe);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: 'Invalid timeframe parameter' });
  }
});

/**
 * @openapi
 * /api/usage/chat-mode-requests:
 *   get:
 *     summary: Get chat mode requests breakdown
 *     tags: [Usage]
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [7, 14, 28]
 *           default: 28
 *     responses:
 *       200:
 *         description: Chat mode requests stacked data
 */
router.get('/chat-mode-requests', (req: Request, res: Response) => {
  try {
    const timeframe = TimeframeSchema.parse(req.query.timeframe || '28');
    const data = usageController.getChatModeRequests(timeframe);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: 'Invalid timeframe parameter' });
  }
});

/**
 * @openapi
 * /api/usage/code-generation:
 *   get:
 *     summary: Get code generation statistics
 *     tags: [Usage]
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [7, 14, 28]
 *           default: 28
 *     responses:
 *       200:
 *         description: Code generation statistics
 */
router.get('/code-generation', (req: Request, res: Response) => {
  try {
    const timeframe = TimeframeSchema.parse(req.query.timeframe || '28');
    const data = usageController.getCodeGenerationStats(timeframe);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: 'Invalid timeframe parameter' });
  }
});

/**
 * @openapi
 * /api/usage/user-details:
 *   get:
 *     summary: Get user-level usage details for table view
 *     tags: [Usage]
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [7, 14, 28]
 *           default: 28
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: User usage details with pagination
 */
router.get('/user-details', (req: Request, res: Response) => {
  try {
    const timeframe = TimeframeSchema.parse(req.query.timeframe || '28');
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const data = usageController.getUserUsageDetails(timeframe, page, limit);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: 'Invalid parameters' });
  }
});

export default router;
