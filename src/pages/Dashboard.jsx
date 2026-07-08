import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSummary } from '../context/SummaryContext';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Sparkles, FileText, History, TrendingDown, ArrowRight, Zap } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { summaries, stats, fetchSummaries, fetchStats } = useSummary();

  useEffect(() => {
    fetchSummaries();
    fetchStats();
  }, []);

  const recentSummaries = summaries.slice(0, 3);

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-5xl font-bold mb-4">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-xl text-indigo-100 mb-8">
              Transform your lengthy texts into concise, meaningful summaries with AI
            </p>
            <button
              onClick={() => navigate('/summarize')}
              className="bg-white text-indigo-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Sparkles className="w-6 h-6" />
              Create New Summary
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                  <span className="text-3xl font-bold text-gray-800">
                    {stats.totalSummaries}
                  </span>
                </div>
                <h3 className="text-gray-600 font-semibold">Total Summaries</h3>
                <p className="text-sm text-gray-500 mt-1">All time</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Zap className="w-8 h-8 text-purple-600" />
                  </div>
                  <span className="text-3xl font-bold text-gray-800">
                    {stats.totalOriginalWords.toLocaleString()}
                  </span>
                </div>
                <h3 className="text-gray-600 font-semibold">Words Processed</h3>
                <p className="text-sm text-gray-500 mt-1">Original text</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <TrendingDown className="w-8 h-8 text-green-600" />
                  </div>
                  <span className="text-3xl font-bold text-gray-800">
                    {stats.avgCompressionRatio}%
                  </span>
                </div>
                <h3 className="text-gray-600 font-semibold">Avg Compression</h3>
                <p className="text-sm text-gray-500 mt-1">Space saved</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-indigo-100 p-3 rounded-lg">
                    <Sparkles className="w-8 h-8 text-indigo-600" />
                  </div>
                  <span className="text-3xl font-bold text-gray-800">
                    {stats.totalSummaryWords.toLocaleString()}
                  </span>
                </div>
                <h3 className="text-gray-600 font-semibold">Summary Words</h3>
                <p className="text-sm text-gray-500 mt-1">Generated</p>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <button
              onClick={() => navigate('/summarize')}
              className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1"
            >
              <Sparkles className="w-12 h-12 mb-4" />
              <h3 className="text-2xl font-bold mb-2">New Summary</h3>
              <p className="text-indigo-100">Create AI-powered summary</p>
            </button>

            <button
              onClick={() => navigate('/history')}
              className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1"
            >
              <History className="w-12 h-12 mb-4" />
              <h3 className="text-2xl font-bold mb-2">View History</h3>
              <p className="text-blue-100">Browse past summaries</p>
            </button>

            <button
              onClick={() => navigate('/about')}
              className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1"
            >
              <FileText className="w-12 h-12 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Learn More</h3>
              <p className="text-green-100">About AI summarization</p>
            </button>
          </div>

          {/* Recent Summaries */}
          {recentSummaries.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                  <History className="w-8 h-8 text-indigo-600" />
                  Recent Summaries
                </h2>
                <button
                  onClick={() => navigate('/history')}
                  className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-2"
                >
                  View All
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {recentSummaries.map((summary) => (
                  <div
                    key={summary._id}
                    className="border border-gray-200 rounded-xl p-6 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => navigate('/history')}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {summary.title}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {new Date(summary.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600 line-clamp-2 mb-3">
                      {summary.summarizedText}
                    </p>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>{summary.wordCount.original} words → {summary.wordCount.summary} words</span>
                      <span className="text-green-600 font-semibold">
                        {summary.compressionRatio}% compression
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {summaries.length === 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <Sparkles className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                No summaries yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start by creating your first AI-powered summary
              </p>
              <button
                onClick={() => navigate('/summarize')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg inline-flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Create Your First Summary
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Dashboard;
