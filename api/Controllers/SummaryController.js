const Summary = require('../Models/Summary');
const aiService = require('../Services/aiService');
const queueService = require('../Services/queueService');
const extractionService = require('../Services/extractionService'); // Only for URL extraction

// Generate AI Summary with comprehensive error handling
const generateAISummary = async (req, res) => {
  try {
    const { text, maxLength, style } = req.body;

    // Validation
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Text is required for summarization'
      });
    }

    const wordCount = text.trim().split(/\s+/).length;
    
    if (wordCount < 10) {
      return res.status(400).json({
        success: false,
        message: 'Text is too short. Please provide at least 10 words.'
      });
    }

    if (wordCount < 50) {
      return res.status(400).json({
        success: false,
        message: 'For best results, please provide at least 50 words of text.'
      });
    }

    if (wordCount > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Text is too long. Please limit to 5000 words.'
      });
    }

    console.log(`\n📝 Summarization request from user: ${req.user.email}`);
    console.log(`   Word count: ${wordCount}`);
    console.log(`   Style: ${style || 'concise'}`);
    console.log(`   Max length: ${maxLength || 200}`);



    // Check AI service status
    const serviceStatus = aiService.getStatus();
    console.log('   AI Service Status:', serviceStatus);

    if (!serviceStatus.apiKeyPresent) {
      return res.status(503).json({
        success: false,
        message: 'AI service is not configured. Please contact the administrator.'
      });
    }

    if (!serviceStatus.apiKeyValid) {
      return res.status(503).json({
        success: false,
        message: 'AI service configuration is invalid. Please contact the administrator.'
      });
    }

    // Generate summary
    const result = await aiService.generateSummary(text, { 
      maxLength: maxLength || 200, 
      style: style || 'concise' 
    });

    if (!result.success) {
      console.error('❌ Summarization failed:', result.error);
      return res.status(500).json({
        success: false,
        message: result.error
      });
    }

    console.log('✅ Summarization successful');

    // Cache the result
    const responseData = {
      summary: result.summary,
      statistics: {
        originalWords: result.originalLength,
        summaryWords: result.summaryLength,
        compressionRatio: ((result.summaryLength / result.originalLength) * 100).toFixed(2)
      }
    };



    res.status(200).json({
      success: true,
      ...responseData,
      cached: false
    });

  } catch (error) {
    console.error('❌ Controller Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating summary',
      error: error.message
    });
  }
};

// Create new summary with AI generation option
const createSummary = async (req, res) => {
  try {
    const { title, originalText, summarizedText, useAI, maxLength, style } = req.body;

    if (!title || !originalText) {
      return res.status(400).json({
        success: false,
        message: 'Title and original text are required'
      });
    }

    let finalSummary = summarizedText;

    // If useAI is true and no summarizedText provided, generate with AI
    if (useAI && !summarizedText) {
      const aiResult = await aiService.generateSummary(originalText, { maxLength, style });
      
      if (!aiResult.success) {
        return res.status(500).json({
          success: false,
          message: 'AI summary generation failed',
          error: aiResult.error
        });
      }
      
      finalSummary = aiResult.summary;
    }

    if (!finalSummary) {
      return res.status(400).json({
        success: false,
        message: 'Summarized text is required'
      });
    }

    const summary = new Summary({
      title,
      originalText,
      summarizedText: finalSummary,
      createdBy: req.user._id
    });

    await summary.save();

    res.status(201).json({
      success: true,
      message: 'Summary created successfully',
      summary
    });
  } catch (error) {
    console.error('Create summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create summary',
      error: error.message
    });
  }
};

// Get all summaries for logged-in user
const getAllSummaries = async (req, res) => {
  try {
    const summaries = await Summary.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      count: summaries.length,
      summaries
    });
  } catch (error) {
    console.error('Get summaries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch summaries',
      error: error.message
    });
  }
};

// Get single summary by ID
const getSummaryById = async (req, res) => {
  try {
    const { id } = req.params;

    const summary = await Summary.findById(id)
      .populate('createdBy', 'name email');

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: 'Summary not found'
      });
    }

    if (summary.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    res.status(200).json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch summary',
      error: error.message
    });
  }
};

// Update summary
const updateSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, originalText, summarizedText } = req.body;

    const summary = await Summary.findById(id);

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: 'Summary not found'
      });
    }

    if (summary.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this summary'
      });
    }

    if (title) summary.title = title;
    if (originalText) summary.originalText = originalText;
    if (summarizedText) summary.summarizedText = summarizedText;

    await summary.save();

    res.status(200).json({
      success: true,
      message: 'Summary updated successfully',
      summary
    });
  } catch (error) {
    console.error('Update summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update summary',
      error: error.message
    });
  }
};

// Delete summary
const deleteSummary = async (req, res) => {
  try {
    const { id } = req.params;

    const summary = await Summary.findById(id);

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: 'Summary not found'
      });
    }

    if (summary.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this summary'
      });
    }

    await Summary.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Summary deleted successfully'
    });
  } catch (error) {
    console.error('Delete summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete summary',
      error: error.message
    });
  }
};

// Get summary statistics
const getSummaryStats = async (req, res) => {
  try {
    const totalSummaries = await Summary.countDocuments({ createdBy: req.user._id });
    
    const summaries = await Summary.find({ createdBy: req.user._id });
    
    let totalOriginalWords = 0;
    let totalSummaryWords = 0;
    
    summaries.forEach(summary => {
      totalOriginalWords += summary.wordCount.original || 0;
      totalSummaryWords += summary.wordCount.summary || 0;
    });

    const avgCompressionRatio = totalOriginalWords > 0 
      ? ((totalSummaryWords / totalOriginalWords) * 100).toFixed(2)
      : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalSummaries,
        totalOriginalWords,
        totalSummaryWords,
        avgCompressionRatio: parseFloat(avgCompressionRatio)
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

// Queue async summarization job
const queueSummarization = async (req, res) => {
  try {
    const { text, maxLength, style, title } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Text is required for summarization'
      });
    }

    const wordCount = text.trim().split(/\s+/).length;
    
    if (wordCount < 50) {
      return res.status(400).json({
        success: false,
        message: 'For best results, please provide at least 50 words of text.'
      });
    }

    // Add job to queue
    const result = await queueService.addSummarizationJob({
      text,
      maxLength: maxLength || 200,
      style: style || 'concise',
      userId: req.user._id,
      title: title || `Summary ${new Date().toLocaleDateString()}`
    });

    if (result.success) {
      res.status(202).json({
        success: true,
        jobId: result.jobId,
        message: 'Summarization job queued. Check status using the job ID.'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to queue summarization job',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Queue summarization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to queue summarization',
      error: error.message
    });
  }
};

// Get job status
const getJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const result = await queueService.getJobStatus(jobId);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Get job status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get job status',
      error: error.message
    });
  }
};

// Get queue statistics
const getQueueStats = async (req, res) => {
  try {
    const result = await queueService.getQueueStats();
    res.status(200).json(result);
  } catch (error) {
    console.error('Get queue stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get queue statistics',
      error: error.message
    });
  }
};

// Extract text from URL and summarize
const summarizeFromURL = async (req, res) => {
  try {
    const { url, maxLength, style } = req.body;

    if (!url || !url.trim()) {
      return res.status(400).json({
        success: false,
        message: 'URL is required'
      });
    }

    console.log(`\n🔗 URL summarization request: ${url}`);

    // Extract text from URL
    const extraction = await extractionService.extractTextFromURL(url);

    if (!extraction.success) {
      return res.status(400).json({
        success: false,
        message: extraction.error
      });
    }

    const text = extraction.text;
    const wordCount = text.trim().split(/\s+/).length;

    console.log(`   Extracted ${wordCount} words from URL`);

    if (wordCount < 50) {
      return res.status(400).json({
        success: false,
        message: 'Extracted text is too short (minimum 50 words)'
      });
    }

    // Generate summary using AI
    const result = await aiService.generateSummary(text, {
      maxLength: maxLength || 200,
      style: style || 'concise'
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error
      });
    }

    console.log('✅ URL summarization successful');

    res.status(200).json({
      success: true,
      summary: result.summary,
      statistics: {
        originalWords: result.originalLength,
        summaryWords: result.summaryLength,
        compressionRatio: ((result.summaryLength / result.originalLength) * 100).toFixed(2)
      },
      source: url,
      extractedText: text
    });

  } catch (error) {
    console.error('❌ URL summarization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to summarize URL content',
      error: error.message
    });
  }
};

module.exports = {
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
};
