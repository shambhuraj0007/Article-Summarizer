import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [summaries, setSummaries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    originalText: '',
    summarizedText: '',
    useAI: true,
    maxLength: 200,
    style: 'concise'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_BACKEND_URL || '';

  useEffect(() => {
    fetchSummaries();
    fetchStats();
  }, []);

  const fetchSummaries = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/summaries`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setSummaries(data.summaries);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch summaries');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/summaries/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Generate AI summary
  const handleGenerateAI = async () => {
    if (!formData.originalText.trim()) {
      alert('Please enter text to summarize');
      return;
    }

    const wordCount = formData.originalText.trim().split(/\s+/).length;
    if (wordCount < 50) {
      alert('Text must be at least 50 words long for meaningful summarization');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/summaries/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: formData.originalText,
          maxLength: formData.maxLength,
          style: formData.style
        })
      });

      const data = await response.json();

      if (data.success) {
        setFormData({
          ...formData,
          summarizedText: data.summary
        });
      } else {
        setError(data.message || 'Failed to generate summary');
      }
    } catch (err) {
      setError('Failed to generate AI summary');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateSummary = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/summaries`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title,
          originalText: formData.originalText,
          summarizedText: formData.summarizedText,
          useAI: formData.useAI,
          maxLength: formData.maxLength,
          style: formData.style
        })
      });

      const data = await response.json();

      if (data.success) {
        setShowCreateModal(false);
        setFormData({
          title: '',
          originalText: '',
          summarizedText: '',
          useAI: true,
          maxLength: 200,
          style: 'concise'
        });
        fetchSummaries();
        fetchStats();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to create summary');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSummary = async (id) => {
    if (!window.confirm('Are you sure you want to delete this summary?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/summaries/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        fetchSummaries();
        fetchStats();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Failed to delete summary');
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <div className="header-content">
          <h1>🤖 AI Summarizer Dashboard</h1>
          <div className="header-actions">
            <button className="btn-create" onClick={() => setShowCreateModal(true)}>
              + New Summary
            </button>
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Statistics Cards */}
      {stats && (
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-value">{stats.totalSummaries}</div>
            <div className="stat-label">Total Summaries</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalOriginalWords.toLocaleString()}</div>
            <div className="stat-label">Original Words</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalSummaryWords.toLocaleString()}</div>
            <div className="stat-label">Summary Words</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.avgCompressionRatio}%</div>
            <div className="stat-label">Avg Compression</div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Summaries List */}
      <div className="summaries-container">
        <h2>Your Summaries</h2>
        {summaries.length === 0 ? (
          <div className="empty-state">
            <p>No summaries yet. Create your first AI-powered summary!</p>
          </div>
        ) : (
          <div className="summaries-grid">
            {summaries.map((summary) => (
              <div key={summary._id} className="summary-card">
                <div className="summary-header">
                  <h3>{summary.title}</h3>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDeleteSummary(summary._id)}
                  >
                    🗑️
                  </button>
                </div>
                <div className="summary-content">
                  <div className="summary-section">
                    <strong>Original:</strong>
                    <p className="text-full">{summary.originalText}</p>
                    <span className="word-count">{summary.wordCount.original} words</span>
                  </div>
                  <div className="summary-section">
                    <strong>Summary:</strong>
                    <p className="text-full">{summary.summarizedText}</p>
                    <span className="word-count">{summary.wordCount.summary} words</span>
                  </div>
                </div>
                <div className="summary-footer">
                  <span className="compression-badge">
                    {summary.compressionRatio}% compression
                  </span>
                  <span className="date">
                    {new Date(summary.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Summary Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✨ Create AI Summary</h2>
              <button className="btn-close" onClick={() => setShowCreateModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleCreateSummary} className="summary-form">
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter summary title"
                />
              </div>

              <div className="form-group">
                <label htmlFor="originalText">Original Text *</label>
                <textarea
                  id="originalText"
                  name="originalText"
                  value={formData.originalText}
                  onChange={handleInputChange}
                  required
                  rows="8"
                  placeholder="Paste your text here (minimum 50 words)..."
                />
                <small className="word-counter">
                  {formData.originalText.trim().split(/\s+/).filter(w => w).length} words
                </small>
              </div>

              {/* AI Options */}
              <div className="ai-options">
                <div className="form-group-inline">
                  <label htmlFor="style">Summary Style:</label>
                  <select
                    id="style"
                    name="style"
                    value={formData.style}
                    onChange={handleInputChange}
                  >
                    <option value="concise">Concise</option>
                    <option value="detailed">Detailed</option>
                    <option value="bullet">Bullet Points</option>
                    <option value="executive">Executive Summary</option>
                  </select>
                </div>

                <div className="form-group-inline">
                  <label htmlFor="maxLength">Max Length (words):</label>
                  <input
                    type="number"
                    id="maxLength"
                    name="maxLength"
                    value={formData.maxLength}
                    onChange={handleInputChange}
                    min="50"
                    max="500"
                  />
                </div>
              </div>

              <button 
                type="button" 
                className="btn-generate-ai"
                onClick={handleGenerateAI}
                disabled={isGenerating || !formData.originalText.trim()}
              >
                {isGenerating ? '🤖 Generating...' : '✨ Generate AI Summary'}
              </button>

              <div className="form-group">
                <label htmlFor="summarizedText">Summary *</label>
                <textarea
                  id="summarizedText"
                  name="summarizedText"
                  value={formData.summarizedText}
                  onChange={handleInputChange}
                  required
                  rows="6"
                  placeholder="AI-generated summary will appear here (or write your own)..."
                />
                <small className="word-counter">
                  {formData.summarizedText.trim().split(/\s+/).filter(w => w).length} words
                </small>
              </div>

              {error && <div className="form-error">{error}</div>}

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : '💾 Save Summary'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
