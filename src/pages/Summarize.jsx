import React, { useState } from 'react';
import { useSummary } from '../context/SummaryContext';
import { Sparkles, FileText, Copy, Save, Loader, AlertCircle, Link as LinkIcon, Upload, Bug } from 'lucide-react';
import { toast } from 'react-toastify';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import axios from 'axios';

const Summarize = () => {
  const { generateAISummary, createSummary } = useSummary();
  const [activeTab, setActiveTab] = useState('text'); // 'text', 'url', 'file'
  const [debugMode, setDebugMode] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    originalText: '',
    url: '',
    maxLength: 200,
    style: 'concise',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [summary, setSummary] = useState('');
  const [statistics, setStatistics] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [cached, setCached] = useState(false);
  const [extractedText, setExtractedText] = useState('');

  const wordCount = formData.originalText?.trim().split(/\s+/).filter((w) => w).length || 0;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      toast.success(`File selected: ${file.name}`);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setSummary('');
    setStatistics(null);
    setExtractedText('');

    try {
      let result;

      if (activeTab === 'text') {
        if (!formData.originalText?.trim()) {
          toast.error('Please enter text to summarize');
          setIsGenerating(false);
          return;
        }
        if (wordCount < 50) {
          toast.error('Text must be at least 50 words long');
          setIsGenerating(false);
          return;
        }
        result = await generateAISummary({
          text: formData.originalText,
          maxLength: formData.maxLength,
          style: formData.style,
        });
      } else if (activeTab === 'url') {
        if (!formData.url?.trim()) {
          toast.error('Please enter a URL');
          setIsGenerating(false);
          return;
        }
        
        // Validate URL format
        try {
          new URL(formData.url);
        } catch (e) {
          toast.error('Please enter a valid URL (e.g., https://example.com)');
          setIsGenerating(false);
          return;
        }
        
        const token = localStorage.getItem('token');
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL || ''}/summaries/generate/url`,
          {
            url: formData.url,
            maxLength: formData.maxLength,
            style: formData.style,
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        result = response.data;
        if (result.extractedText) {
          setExtractedText(result.extractedText);
          setFormData({ ...formData, originalText: result.extractedText });
        }
      } else if (activeTab === 'file') {
        if (!selectedFile) {
          toast.error('Please select a file');
          setIsGenerating(false);
          return;
        }
        const token = localStorage.getItem('token');
        const fileFormData = new FormData();
        fileFormData.append('file', selectedFile);
        fileFormData.append('maxLength', formData.maxLength);
        fileFormData.append('style', formData.style);
        
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL || ''}/summaries/generate/file`,
          fileFormData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        result = response.data;
        if (result.extractedText) {
          setExtractedText(result.extractedText);
          setFormData({ ...formData, originalText: result.extractedText });
        }
      }

      setIsGenerating(false);

      if (result.success) {
        setSummary(result.summary);
        setStatistics(result.statistics);
        setCached(result.cached || false);
        toast.success('Summary generated successfully!');
      } else {
        toast.error(result.message || 'Failed to generate summary');
      }
    } catch (error) {
      setIsGenerating(false);
      console.error('Summarization error:', error);
      
      // Detailed error handling
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message;
        
        if (status === 404) {
          toast.error('Service not available. Please try again or contact support.');
        } else if (status === 400) {
          if (activeTab === 'url') {
            toast.error(message || 'Could not extract content from URL. The page might be protected or dynamic.');
          } else if (activeTab === 'file') {
            toast.error(message || 'Could not extract text from file. Please ensure it contains readable text.');
          } else {
            toast.error(message || 'Invalid input. Please check your text.');
          }
        } else if (status === 401) {
          toast.error('Session expired. Please login again.');
          setTimeout(() => window.location.href = '/login', 2000);
        } else if (status === 413) {
          toast.error('File too large. Maximum size is 10MB.');
        } else if (status >= 500) {
          toast.error('Server error. Please try again later.');
        } else {
          toast.error(message || 'Failed to generate summary');
        }
      } else if (error.request) {
        toast.error('Cannot connect to server. Please check your internet connection.');
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleSave = async () => {
    if (!formData.title?.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!summary?.trim()) {
      toast.error('Please generate a summary first');
      return;
    }

    // Use extractedText if available (from URL/file), otherwise use originalText
    const textToSave = extractedText || formData.originalText;
    
    if (!textToSave?.trim()) {
      toast.error('No original text available to save');
      return;
    }

    setIsSaving(true);

    const result = await createSummary({
      title: formData.title,
      originalText: textToSave,
      summarizedText: summary,
    });

    setIsSaving(false);

    if (result.success) {
      setFormData({
        title: '',
        originalText: '',
        url: '',
        maxLength: 200,
        style: 'concise',
      });
      setSummary('');
      setStatistics(null);
      setCached(false);
      setExtractedText('');
      setSelectedFile(null);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-bold text-gray-800 mb-3 flex items-center justify-center gap-3">
              <Sparkles className="w-12 h-12 text-indigo-600" />
              AI Text Summarizer
            </h1>
            <p className="text-gray-600 text-lg">
              Transform lengthy text into concise, meaningful summaries using AI
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-indigo-600" />
                Input Source
              </h2>

              {/* Tabs */}
              <div className="flex gap-2 mb-6 border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('text')}
                  className={`flex items-center gap-2 px-4 py-3 font-semibold transition-all ${
                    activeTab === 'text'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  Text
                </button>
                <button
                  onClick={() => setActiveTab('url')}
                  className={`flex items-center gap-2 px-4 py-3 font-semibold transition-all ${
                    activeTab === 'url'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <LinkIcon className="w-5 h-5" />
                  URL
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title (for saving)
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter a title for this summary..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Text Input Tab */}
              {activeTab === 'text' && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Text to Summarize *
                  </label>
                  <textarea
                    name="originalText"
                    value={formData.originalText}
                    onChange={handleInputChange}
                    placeholder="Paste your text here (minimum 50 words)..."
                    rows="12"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-600">{wordCount} words</span>
                    {wordCount < 50 && wordCount > 0 && (
                      <span className="text-sm text-amber-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        Minimum 50 words required
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* URL Input Tab */}
              {activeTab === 'url' && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Article URL *
                  </label>
                  <input
                    type="url"
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    placeholder="https://en.wikipedia.org/wiki/..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Enter a URL to any article (Wikipedia, news sites, blogs, etc.)
                  </p>
                </div>
              )}

              {/* File Upload Tab */}
              {activeTab === 'file' && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload Document *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-all">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.docx,.doc,.txt"
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer text-indigo-600 hover:text-indigo-700 font-semibold"
                    >
                      Click to upload
                    </label>
                    <span className="text-gray-600"> or drag and drop</span>
                    <p className="text-sm text-gray-500 mt-2">
                      PDF, DOCX, or TXT (max 10MB)
                    </p>
                    {selectedFile && (
                      <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
                        <p className="text-sm font-semibold text-indigo-700">
                          Selected: {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Summary Style
                  </label>
                  <select
                    name="style"
                    value={formData.style}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="concise">Concise</option>
                    <option value="detailed">Detailed</option>
                    <option value="bullet">Bullet Points</option>
                    <option value="executive">Executive Summary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Max Length (words)
                  </label>
                  <input
                    type="number"
                    name="maxLength"
                    value={formData.maxLength}
                    onChange={handleInputChange}
                    min="50"
                    max="500"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={
                  isGenerating ||
                  (activeTab === 'text' && wordCount < 50) ||
                  (activeTab === 'url' && !formData.url?.trim()) ||
                  (activeTab === 'file' && !selectedFile)
                }
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate AI Summary
                  </>
                )}
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
                AI Summary
              </h2>

              {!summary && !isGenerating && (
                <div className="h-full flex items-center justify-center text-center p-8">
                  <div>
                    <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">
                      Your AI-generated summary will appear here
                    </p>
                  </div>
                </div>
              )}

              {isGenerating && (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Loader className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Generating your summary...</p>
                    <p className="text-gray-500 text-sm mt-2">This may take a few seconds</p>
                  </div>
                </div>
              )}

              {summary && (
                <div className="space-y-4">
                  {cached && (
                    <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Retrieved from cache (faster response!)
                    </div>
                  )}

                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border-2 border-indigo-200">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{summary}</p>
                  </div>

                  {statistics && (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {statistics.originalWords}
                        </div>
                        <div className="text-sm text-gray-600">Original Words</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {statistics.summaryWords}
                        </div>
                        <div className="text-sm text-gray-600">Summary Words</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {statistics.compressionRatio}%
                        </div>
                        <div className="text-sm text-gray-600">Compression</div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleCopy(summary)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                    >
                      <Copy className="w-5 h-5" />
                      Copy Summary
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving || !formData.title?.trim()}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
                    >
                      {isSaving ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Save to History
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Debug toggle button */}
        <button
          onClick={() => setDebugMode(!debugMode)}
          className="fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-all z-50"
          title="Toggle debug mode"
        >
          <Bug className="w-5 h-5" />
        </button>

        {/* Debug panel */}
        {debugMode && (
          <div className="fixed bottom-20 right-4 bg-white p-4 rounded-lg shadow-2xl max-w-md max-h-96 overflow-auto text-xs border-2 border-gray-300 z-50">
            <h3 className="font-bold mb-2 text-sm">🐛 Debug Info</h3>
            <div className="space-y-2">
              <div>
                <strong>Active Tab:</strong> {activeTab}
              </div>
              <div>
                <strong>Form Data:</strong>
                <pre className="bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                  {JSON.stringify(formData, null, 2)}
                </pre>
              </div>
              <div>
                <strong>Summary Length:</strong> {summary?.length || 0} chars
              </div>
              <div>
                <strong>Extracted Text:</strong> {extractedText?.length || 0} chars
              </div>
              <div>
                <strong>Statistics:</strong>
                <pre className="bg-gray-100 p-2 rounded mt-1">
                  {JSON.stringify(statistics, null, 2)}
                </pre>
              </div>
              {selectedFile && (
                <div>
                  <strong>Selected File:</strong>
                  <pre className="bg-gray-100 p-2 rounded mt-1">
                    {JSON.stringify({
                      name: selectedFile.name,
                      size: `${(selectedFile.size / 1024).toFixed(2)} KB`,
                      type: selectedFile.type
                    }, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Summarize;
