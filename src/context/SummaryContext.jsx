import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { toast } from 'react-toastify';

const SummaryContext = createContext(null);

export const SummaryProvider = ({ children }) => {
  const [summaries, setSummaries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all summaries
  const fetchSummaries = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.summaries.getAll();
      if (response.data.success) {
        setSummaries(response.data.summaries);
      }
    } catch (err) {
      setError('Failed to fetch summaries');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await apiService.summaries.getStats();
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  // Create summary
  const createSummary = async (data) => {
    try {
      const response = await apiService.summaries.create(data);
      if (response.data.success) {
        toast.success('Summary created successfully!');
        await fetchSummaries();
        await fetchStats();
        return { success: true, summary: response.data.summary };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create summary';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Generate AI summary
  const generateAISummary = async (data) => {
    try {
      const response = await apiService.summaries.generateAI(data);
      if (response.data.success) {
        return {
          success: true,
          summary: response.data.summary,
          statistics: response.data.statistics,
          cached: response.data.cached,
        };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to generate summary';
      return { success: false, message };
    }
  };

  // Queue async job
  const queueSummarization = async (data) => {
    try {
      const response = await apiService.summaries.queueJob(data);
      if (response.data.success) {
        toast.info('Summarization job queued! Check status shortly.');
        return { success: true, jobId: response.data.jobId };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to queue job';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Get job status
  const getJobStatus = async (jobId) => {
    try {
      const response = await apiService.summaries.getJobStatus(jobId);
      return response.data;
    } catch (err) {
      return { success: false, message: 'Failed to get job status' };
    }
  };

  // Delete summary
  const deleteSummary = async (id) => {
    try {
      const response = await apiService.summaries.delete(id);
      if (response.data.success) {
        toast.success('Summary deleted successfully!');
        await fetchSummaries();
        await fetchStats();
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete summary';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Update summary
  const updateSummary = async (id, data) => {
    try {
      const response = await apiService.summaries.update(id, data);
      if (response.data.success) {
        toast.success('Summary updated successfully!');
        await fetchSummaries();
        return { success: true, summary: response.data.summary };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update summary';
      toast.error(message);
      return { success: false, message };
    }
  };

  const value = {
    summaries,
    stats,
    loading,
    error,
    fetchSummaries,
    fetchStats,
    createSummary,
    generateAISummary,
    queueSummarization,
    getJobStatus,
    deleteSummary,
    updateSummary,
  };

  return <SummaryContext.Provider value={value}>{children}</SummaryContext.Provider>;
};

// Custom hook
export const useSummary = () => {
  const context = useContext(SummaryContext);
  if (!context) {
    throw new Error('useSummary must be used within SummaryProvider');
  }
  return context;
};

export default SummaryContext;
