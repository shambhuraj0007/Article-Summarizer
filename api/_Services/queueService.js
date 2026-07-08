const aiService = require('./aiService');
const Summary = require('../_Models/Summary');

class QueueService {
  constructor() {
    this.jobs = {};
    console.log('✅ Queue service initialized in-memory (Redis disabled)');
  }

  // Simulate adding a job to the queue
  async addSummarizationJob(data) {
    const jobId = 'job_' + Math.random().toString(36).substr(2, 9);
    
    // Set initial job state
    this.jobs[jobId] = {
      jobId: jobId,
      state: 'active',
      progress: 10,
      timestamp: Date.now(),
      result: null,
      failedReason: null
    };

    // Run the job asynchronously in the background using the Node event loop
    this.runMockJob(jobId, data);

    return {
      success: true,
      jobId: jobId,
      message: 'Summarization job queued successfully (in-memory)'
    };
  }

  // Background processor for the mock job
  async runMockJob(jobId, data) {
    const { text, maxLength, style, userId, title } = data;
    
    try {
      this.jobs[jobId].progress = 30;

      // Call the AI Service
      const result = await aiService.generateSummary(text, { 
        maxLength: maxLength || 200, 
        style: style || 'concise' 
      });

      this.jobs[jobId].progress = 75;

      if (!result.success) {
        throw new Error(result.error || 'AI generation failed');
      }

      // Save to MongoDB database
      const summary = new Summary({
        title: title || `Summary ${new Date().toLocaleDateString()}`,
        originalText: text,
        summarizedText: result.summary,
        createdBy: userId,
      });

      await summary.save();

      this.jobs[jobId].progress = 100;
      this.jobs[jobId].state = 'completed';
      this.jobs[jobId].result = {
        success: true,
        summaryId: summary._id,
        summary: result.summary,
        statistics: {
          originalWords: result.originalLength,
          summaryWords: result.summaryLength,
          compressionRatio: ((result.summaryLength / result.originalLength) * 100).toFixed(2),
        }
      };

      console.log(`✅ Mock job ${jobId} completed successfully`);

    } catch (error) {
      console.error(`❌ Mock job ${jobId} failed:`, error.message);
      this.jobs[jobId].progress = 100;
      this.jobs[jobId].state = 'failed';
      this.jobs[jobId].failedReason = error.message;
    }
  }

  // Get job status from memory
  async getJobStatus(jobId) {
    try {
      const job = this.jobs[jobId];
      if (!job) {
        return {
          success: false,
          message: 'Job not found'
        };
      }

      return {
        success: true,
        jobId: job.jobId,
        state: job.state,
        progress: job.progress,
        result: job.result,
        failedReason: job.failedReason,
        timestamp: job.timestamp
      };
    } catch (error) {
      console.error('Failed to get job status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get current queue stats from memory
  async getQueueStats() {
    try {
      let waiting = 0;
      let active = 0;
      let completed = 0;
      let failed = 0;

      Object.values(this.jobs).forEach(job => {
        if (job.state === 'waiting') waiting++;
        else if (job.state === 'active') active++;
        else if (job.state === 'completed') completed++;
        else if (job.state === 'failed') failed++;
      });

      return {
        success: true,
        stats: {
          waiting,
          active,
          completed,
          failed,
          total: Object.keys(this.jobs).length
        }
      };
    } catch (error) {
      console.error('Failed to get queue stats:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Mock cleaning queue
  async cleanQueue() {
    this.jobs = {};
    console.log('✅ Mock queue cleared');
    return { success: true };
  }

  // Mock closing connections
  async close() {
    return;
  }
}

module.exports = new QueueService();
