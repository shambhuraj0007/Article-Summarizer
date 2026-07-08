const express = require('express');
const router = express.Router();
const ensureAuthenticated = require('../Middlewares/Auth');
const {
  generateAISummary,
  createSummary,
  getAllSummaries,
  getSummaryById,
  updateSummary,
  deleteSummary,
  getSummaryStats,
  queueSummarization,
  getJobStatus,
  getQueueStats,
  summarizeFromURL
} = require('../Controllers/SummaryController');

// Test route (no auth required for debugging)
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Summary routes are working!',
    availableRoutes: [
      'POST /summaries/generate',
      'POST /summaries/generate/url',
      'POST /summaries/queue',
      'GET /summaries/job/:jobId',
      'GET /summaries',
      'POST /summaries',
      'GET /summaries/:id',
      'PUT /summaries/:id',
      'DELETE /summaries/:id'
    ]
  });
});

// All routes below require authentication
router.use(ensureAuthenticated);

// AI summarization routes (specific routes MUST come before generic ones)
router.post('/generate/url', summarizeFromURL);     // Summarize from URL
router.post('/generate', generateAISummary);        // Sync AI summary generation
router.post('/queue', queueSummarization);          // Async job queue
router.get('/job/:jobId', getJobStatus);            // Get job status
router.get('/queue/stats', getQueueStats);          // Queue statistics

// Summary CRUD routes
router.post('/', createSummary);
router.get('/', getAllSummaries);
router.get('/stats', getSummaryStats);
router.get('/:id', getSummaryById);
router.put('/:id', updateSummary);
router.delete('/:id', deleteSummary);

module.exports = router;
