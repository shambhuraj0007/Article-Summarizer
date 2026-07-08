const mongoose = require('mongoose');

const summarySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  originalText: {
    type: String,
    required: [true, 'Original text is required']
  },
  summarizedText: {
    type: String,
    required: [true, 'Summarized text is required']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  wordCount: {
    original: {
      type: Number,
      default: 0
    },
    summary: {
      type: Number,
      default: 0
    }
  },
  compressionRatio: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published'
  }
}, { 
  timestamps: true 
});

// Calculate word counts and compression ratio before saving
summarySchema.pre('save', function(next) {
  if (this.originalText) {
    this.wordCount.original = this.originalText.trim().split(/\s+/).length;
  }
  if (this.summarizedText) {
    this.wordCount.summary = this.summarizedText.trim().split(/\s+/).length;
  }
  
  if (this.wordCount.original > 0) {
    this.compressionRatio = parseFloat(
      ((this.wordCount.summary / this.wordCount.original) * 100).toFixed(2)
    );
  }
  
  next();
});

module.exports = mongoose.model('Summary', summarySchema);
