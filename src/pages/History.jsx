import React, { useState, useEffect } from 'react';
import { useSummary } from '../context/SummaryContext';
import { Copy, Trash2, Calendar, FileText, TrendingDown, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import LoadingSkeleton from '../components/LoadingSkeleton';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const History = () => {
  const { summaries, loading, fetchSummaries, deleteSummary } = useSummary();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('newest');
  const itemsPerPage = 6;

  useEffect(() => {
    fetchSummaries();
  }, []);

  // Filter summaries based on search
  const filteredSummaries = summaries.filter((summary) => {
    const query = searchQuery.toLowerCase();
    return (
      summary.title.toLowerCase().includes(query) ||
      summary.originalText.toLowerCase().includes(query) ||
      summary.summarizedText.toLowerCase().includes(query)
    );
  });

  // Sort summaries
  const sortedSummaries = [...filteredSummaries].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'compression':
        return a.compressionRatio - b.compressionRatio;
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedSummaries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSummaries = sortedSummaries.slice(startIndex, startIndex + itemsPerPage);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this summary?')) {
      await deleteSummary(id);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <FileText className="w-10 h-10 text-indigo-600" />
            Summary History
          </h1>
          <p className="text-gray-600">View and manage all your AI-generated summaries</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search summaries..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="compression">Best Compression</option>
          </select>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-gray-600">
          Showing {paginatedSummaries.length} of {sortedSummaries.length} summaries
        </div>

        {/* Summaries Grid */}
        {paginatedSummaries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No summaries found</h3>
            <p className="text-gray-500">
              {searchQuery ? 'Try a different search term' : 'Create your first summary to get started!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {paginatedSummaries.map((summary) => (
              <div
                key={summary._id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold mb-2 flex-1">{summary.title}</h3>
                    <button
                      onClick={() => handleDelete(summary._id)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                      title="Delete summary"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-white/90">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(summary.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingDown className="w-4 h-4" />
                      {summary.compressionRatio}% compression
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4">
                  {/* Original Text */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                        Original Text
                      </h4>
                      <span className="text-xs text-gray-500">{summary.wordCount.original} words</span>
                    </div>
                    <div className="max-h-32 overflow-y-auto bg-gray-50 p-3 rounded-lg scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      <p className="text-gray-600 text-sm whitespace-pre-wrap">
                        {summary.originalText}
                      </p>
                    </div>
                  </div>

                  {/* Summary */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-indigo-700 text-sm uppercase tracking-wide">
                        AI Summary
                      </h4>
                      <span className="text-xs text-indigo-500">{summary.wordCount.summary} words</span>
                    </div>
                    <div className="max-h-32 overflow-y-auto bg-indigo-50 p-3 rounded-lg scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-indigo-100">
                      <p className="text-gray-700 text-sm whitespace-pre-wrap">
                        {summary.summarizedText}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleCopy(summary.summarizedText)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      Copy Summary
                    </button>
                    <button
                      onClick={() => handleCopy(summary.originalText)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      Copy Original
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white rounded-lg shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            <div className="flex gap-2">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`w-10 h-10 rounded-lg transition-all ${
                    currentPage === index + 1
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white rounded-lg shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default History;
