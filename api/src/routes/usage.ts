import { Router, Request, Response } from 'express';
import multer from 'multer';
import { TimeframeSchema } from '../models/types.js';
import * as usageController from '../controllers/usageController.js';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/json' || file.originalname.endsWith('.json') || file.originalname.endsWith('.ndjson')) {
      cb(null, true);
    } else {
      cb(new Error('Only JSON and NDJSON files are allowed'));
    }
  },
});

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
 *           enum: [7, 14, 28, 90]
 *           default: 28
 *         description: Number of days to include
 *     responses:
 *       200:
 *         description: Dashboard summary data
 */
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const timeframe = TimeframeSchema.parse(req.query.timeframe || '28');
    const summary = await usageController.getDashboardSummary(timeframe);
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
 *           enum: [7, 14, 28, 90]
 *           default: 28
 *     responses:
 *       200:
 *         description: Daily active users data points
 */
router.get('/daily-active-users', async (req: Request, res: Response) => {
  try {
    const timeframe = TimeframeSchema.parse(req.query.timeframe || '28');
    const data = await usageController.getDailyActiveUsers(timeframe);
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
 *           enum: [7, 14, 28, 90]
 *           default: 28
 *     responses:
 *       200:
 *         description: Weekly active users data points
 */
router.get('/weekly-active-users', async (req: Request, res: Response) => {
  try {
    const timeframe = TimeframeSchema.parse(req.query.timeframe || '28');
    const data = await usageController.getWeeklyActiveUsers(timeframe);
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
 *           enum: [7, 14, 28, 90]
 *           default: 28
 *     responses:
 *       200:
 *         description: Average chat requests per user data points
 */
router.get('/avg-chat-requests', async (req: Request, res: Response) => {
  try {
    const timeframe = TimeframeSchema.parse(req.query.timeframe || '28');
    const data = await usageController.getAverageChatRequestsPerUser(timeframe);
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
 *           enum: [7, 14, 28, 90]
 *           default: 28
 *     responses:
 *       200:
 *         description: Chat mode requests stacked data
 */
router.get('/chat-mode-requests', async (req: Request, res: Response) => {
  try {
    const timeframe = TimeframeSchema.parse(req.query.timeframe || '28');
    const data = await usageController.getChatModeRequests(timeframe);
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
 *           enum: [7, 14, 28, 90]
 *           default: 28
 *     responses:
 *       200:
 *         description: Code generation statistics
 */
router.get('/code-generation', async (req: Request, res: Response) => {
  try {
    const timeframe = TimeframeSchema.parse(req.query.timeframe || '28');
    const data = await usageController.getCodeGenerationStats(timeframe);
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
 *           enum: [7, 14, 28, 90]
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
router.get('/user-details', async (req: Request, res: Response) => {
  try {
    const timeframe = TimeframeSchema.parse(req.query.timeframe || '28');
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const search = (req.query.search as string) || '';
    const data = await usageController.getUserUsageDetails(timeframe, page, limit, search);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: 'Invalid parameters' });
  }
});

/**
 * @openapi
 * /api/usage/ide-usage:
 *   get:
 *     summary: Get IDE usage statistics
 *     tags: [Usage]
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [7, 14, 28, 90]
 *           default: 28
 *     responses:
 *       200:
 *         description: IDE usage breakdown with user counts and interactions
 */
router.get('/ide-usage', (req: Request, res: Response) => {
  try {
    const timeframe = TimeframeSchema.parse(req.query.timeframe || '28');
    const data = usageController.getIDEUsageStats(timeframe);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: 'Invalid timeframe parameter' });
  }
});

/**
 * @openapi
 * /api/usage/ide-weekly-active-users:
 *   get:
 *     summary: Get IDE weekly active users breakdown
 *     tags: [Usage]
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [7, 14, 28, 90]
 *           default: 28
 *     responses:
 *       200:
 *         description: IDE weekly active users data
 */
router.get('/ide-weekly-active-users', (req: Request, res: Response) => {
  try {
    const timeframe = TimeframeSchema.parse(req.query.timeframe || '28');
    const data = usageController.getIDEWeeklyActiveUsers(timeframe);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: 'Invalid timeframe parameter' });
  }
});

/**
 * @openapi
 * /api/usage/model-distribution:
 *   get:
 *     summary: Get model usage distribution for donut chart
 *     tags: [Usage]
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [7, 14, 28, 90]
 *           default: 28
 *     responses:
 *       200:
 *         description: Model usage distribution with percentages
 */
router.get('/model-distribution', async (req: Request, res: Response) => {
  try {
    const timeframe = TimeframeSchema.parse(req.query.timeframe || '28');
    const data = await usageController.getModelUsageDistribution(timeframe);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: 'Invalid timeframe parameter' });
  }
});

/**
 * @openapi
 * /api/usage/model-usage-per-day:
 *   get:
 *     summary: Get daily model usage for multi-line chart
 *     tags: [Usage]
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [7, 14, 28, 90]
 *           default: 28
 *     responses:
 *       200:
 *         description: Daily model usage data
 */
router.get('/model-usage-per-day', async (req: Request, res: Response) => {
  try {
    const timeframe = TimeframeSchema.parse(req.query.timeframe || '28');
    const data = await usageController.getModelUsagePerDay(timeframe);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: 'Invalid timeframe parameter' });
  }
});

/**
 * @openapi
 * /api/usage/language-usage-per-day:
 *   get:
 *     summary: Get daily language usage as percentages
 *     tags: [Usage]
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [7, 14, 28, 90]
 *           default: 28
 *     responses:
 *       200:
 *         description: Daily language usage percentages
 */
router.get('/language-usage-per-day', async (req: Request, res: Response) => {
  try {
    const timeframe = TimeframeSchema.parse(req.query.timeframe || '28');
    const data = await usageController.getLanguageUsagePerDay(timeframe);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: 'Invalid timeframe parameter' });
  }
});

/**
 * @openapi
 * /api/usage/model-usage-per-language:
 *   get:
 *     summary: Get model usage per programming language
 *     tags: [Usage]
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [7, 14, 28, 90]
 *           default: 28
 *     responses:
 *       200:
 *         description: Model usage by language
 */
router.get('/model-usage-per-language', async (req: Request, res: Response) => {
  try {
    const timeframe = TimeframeSchema.parse(req.query.timeframe || '28');
    const data = await usageController.getModelUsagePerLanguage(timeframe);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: 'Invalid timeframe parameter' });
  }
});

/**
 * @openapi
 * /api/usage/model-usage-per-chat-mode:
 *   get:
 *     summary: Get model usage per chat mode
 *     tags: [Usage]
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [7, 14, 28, 90]
 *           default: 28
 *     responses:
 *       200:
 *         description: Model usage by chat mode
 */
router.get('/model-usage-per-chat-mode', async (req: Request, res: Response) => {
  try {
    const timeframe = TimeframeSchema.parse(req.query.timeframe || '28');
    const data = await usageController.getModelUsagePerChatMode(timeframe);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: 'Invalid timeframe parameter' });
  }
});

/**
 * @openapi
 * /api/usage/code-completions:
 *   get:
 *     summary: Get code completions (suggested vs accepted) data
 *     tags: [Usage]
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [7, 14, 28, 90]
 *           default: 28
 *     responses:
 *       200:
 *         description: Daily code completions data
 */
router.get('/code-completions', async (req: Request, res: Response) => {
  try {
    const timeframe = TimeframeSchema.parse(req.query.timeframe || '28');
    const data = await usageController.getCodeCompletions(timeframe);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: 'Invalid timeframe parameter' });
  }
});

/**
 * @openapi
 * /api/usage/acceptance-rate:
 *   get:
 *     summary: Get code completions acceptance rate over time
 *     tags: [Usage]
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [7, 14, 28, 90]
 *           default: 28
 *     responses:
 *       200:
 *         description: Daily acceptance rate data
 */
router.get('/acceptance-rate', async (req: Request, res: Response) => {
  try {
    const timeframe = TimeframeSchema.parse(req.query.timeframe || '28');
    const data = await usageController.getAcceptanceRate(timeframe);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: 'Invalid timeframe parameter' });
  }
});

/**
 * @openapi
 * /api/usage/seat-info:
 *   get:
 *     summary: Get Copilot seat utilization information
 *     tags: [Usage]
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [7, 14, 28, 90]
 *           default: 28
 *     responses:
 *       200:
 *         description: Seat information including total, active, and unused seats
 */
router.get('/seat-info', async (req: Request, res: Response) => {
  try {
    const timeframe = TimeframeSchema.parse(req.query.timeframe || '28');
    const data = await usageController.getSeatInfo(timeframe);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: 'Invalid timeframe parameter' });
  }
});

// Code Generation LOC endpoints
router.get('/code-gen-summary', async (req: Request, res: Response) => {
  try {
    const timeframe = TimeframeSchema.parse(req.query.timeframe || '28');
    const data = await usageController.getCodeGenSummary(timeframe);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: 'Invalid timeframe parameter' });
  }
});

router.get('/daily-lines', async (req: Request, res: Response) => {
  try {
    const timeframe = TimeframeSchema.parse(req.query.timeframe || '28');
    const data = await usageController.getDailyLines(timeframe);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: 'Invalid timeframe parameter' });
  }
});

router.get('/user-code-changes-by-mode', async (req: Request, res: Response) => {
  try {
    const timeframe = TimeframeSchema.parse(req.query.timeframe || '28');
    const data = await usageController.getUserCodeChangesByMode(timeframe);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: 'Invalid timeframe parameter' });
  }
});

router.get('/agent-code-changes', async (req: Request, res: Response) => {
  try {
    const timeframe = TimeframeSchema.parse(req.query.timeframe || '28');
    const data = await usageController.getAgentCodeChanges(timeframe);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: 'Invalid timeframe parameter' });
  }
});

router.get('/user-code-changes-by-model', async (req: Request, res: Response) => {
  try {
    const timeframe = TimeframeSchema.parse(req.query.timeframe || '28');
    const data = await usageController.getUserCodeChangesByModel(timeframe);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: 'Invalid timeframe parameter' });
  }
});

router.get('/agent-code-changes-by-model', async (req: Request, res: Response) => {
  try {
    const timeframe = TimeframeSchema.parse(req.query.timeframe || '28');
    const data = await usageController.getAgentCodeChangesByModel(timeframe);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: 'Invalid timeframe parameter' });
  }
});

router.get('/user-code-changes-by-language', async (req: Request, res: Response) => {
  try {
    const timeframe = TimeframeSchema.parse(req.query.timeframe || '28');
    const data = await usageController.getUserCodeChangesByLanguage(timeframe);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: 'Invalid timeframe parameter' });
  }
});

router.get('/agent-code-changes-by-language', async (req: Request, res: Response) => {
  try {
    const timeframe = TimeframeSchema.parse(req.query.timeframe || '28');
    const data = await usageController.getAgentCodeChangesByLanguage(timeframe);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: 'Invalid timeframe parameter' });
  }
});

/**
 * @openapi
 * /api/usage/upload:
 *   post:
 *     summary: Upload a JSON/NDJSON file for analysis
 *     tags: [Usage]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded and processed successfully
 *       400:
 *         description: Invalid file or processing error
 */
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const result = await usageController.processUploadedFile(req.file.buffer, req.file.originalname);
    res.json(result);
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to process file' 
    });
  }
});

/**
 * @openapi
 * /api/usage/clear:
 *   delete:
 *     summary: Clear all data from the database
 *     tags: [Usage]
 *     responses:
 *       200:
 *         description: Data cleared successfully
 */
router.delete('/clear', (req: Request, res: Response) => {
  try {
    usageController.clearAllData();
    res.json({ success: true, message: 'All data cleared successfully' });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to clear data' 
    });
  }
});

/**
 * @openapi
 * /api/usage/users:
 *   get:
 *     summary: Get list of unique users
 *     tags: [Usage]
 *     parameters:
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by user login, enterprise ID, or user ID
 *     responses:
 *       200:
 *         description: Users list with pagination
 */
router.get('/users', (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const search = (req.query.search as string) || '';
    const data = usageController.getUsersList(page, limit, search);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch users' });
  }
});

/**
 * @openapi
 * /api/usage/search:
 *   get:
 *     summary: Global search across all data types
 *     tags: [Usage]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Search results grouped by type
 */
router.get('/search', (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string) || '';
    const limit = parseInt(req.query.limit as string) || 20;
    const data = usageController.globalSearch(query, limit);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: 'Search failed' });
  }
});

/**
 * @openapi
 * /api/usage/counts:
 *   get:
 *     summary: Get counts for navigation tabs
 *     tags: [Usage]
 *     responses:
 *       200:
 *         description: People and teams counts
 */
router.get('/counts', (req: Request, res: Response) => {
  try {
    const data = usageController.getCounts();
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: 'Failed to get counts' });
  }
});

/**
 * @openapi
 * /api/usage/export:
 *   get:
 *     summary: Get all user usage data for export
 *     tags: [Usage]
 *     responses:
 *       200:
 *         description: All user usage data with specified fields
 */
router.get('/export', (req: Request, res: Response) => {
  try {
    const data = usageController.getExportData();
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: 'Failed to get export data' });
  }
});

export default router;
