import React from 'react';
import { Sparkles, Target, Users, Zap, Shield, Globe, Brain, TrendingUp } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const About = () => {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Hero Section */}
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
              <Sparkles className="w-14 h-14 text-indigo-600" />
              About Our Platform
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transforming the way you consume information with AI-powered text summarization
            </p>
          </div>

          {/* Mission Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-start gap-4">
              <Target className="w-12 h-12 text-indigo-600 flex-shrink-0" />
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Mission</h2>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  In today's information-rich world, we're drowning in content. Our mission is to help you stay informed without the overwhelm. We leverage cutting-edge AI technology to distill lengthy articles, documents, and web pages into concise, meaningful summaries—saving you time while ensuring you never miss the key points.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Whether you're a student researching for assignments, a professional staying updated with industry news, or simply someone who loves learning, our platform empowers you to consume more information in less time.
                </p>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-10 h-10 text-purple-600" />
                <h3 className="text-2xl font-bold text-gray-800">AI-Powered</h3>
              </div>
              <p className="text-gray-700">
                Our advanced AI models understand context, extract key information, and generate coherent summaries that capture the essence of any text.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-10 h-10 text-yellow-600" />
                <h3 className="text-2xl font-bold text-gray-800">Lightning Fast</h3>
              </div>
              <p className="text-gray-700">
                Get summaries in seconds with our optimized caching system. Frequently requested content is served instantly for the best user experience.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-10 h-10 text-blue-600" />
                <h3 className="text-2xl font-bold text-gray-800">Multiple Sources</h3>
              </div>
              <p className="text-gray-700">
                Summarize text directly, extract content from URLs (Wikipedia, news sites, blogs), or upload documents (PDF, DOCX, TXT) for instant processing.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-10 h-10 text-green-600" />
                <h3 className="text-2xl font-bold text-gray-800">Secure & Private</h3>
              </div>
              <p className="text-gray-700">
                Your data is protected with JWT authentication, encrypted connections, and secure storage. We respect your privacy and never share your content.
              </p>
            </div>
          </div>

          {/* Technology Section */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white mb-8">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <TrendingUp className="w-10 h-10" />
              Built with Modern Technology
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">Frontend</h3>
                <ul className="space-y-2">
                  <li>• React 18 with Vite for blazing-fast performance</li>
                  <li>• Tailwind CSS for beautiful, responsive design</li>
                  <li>• shadcn/ui for accessible components</li>
                  <li>• Framer Motion for smooth animations</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Backend</h3>
                <ul className="space-y-2">
                  <li>• Node.js & Express for robust API</li>
                  <li>• MongoDB for flexible data storage</li>
                  <li>• Redis for high-performance caching</li>
                  <li>• BullMQ for background job processing</li>
                </ul>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-indigo-600">1</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Input Your Content</h3>
                <p className="text-gray-600">
                  Paste text, enter a URL, or upload a document (PDF, DOCX, TXT)
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">2</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">AI Processing</h3>
                <p className="text-gray-600">
                  Our AI analyzes the content and extracts key information
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">3</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Get Your Summary</h3>
                <p className="text-gray-600">
                  Receive a concise summary with statistics and save it for later
                </p>
              </div>
            </div>
          </div>

          {/* Use Cases */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <Users className="w-10 h-10 text-indigo-600" />
              Who Benefits?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border-l-4 border-indigo-600 pl-4">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Students & Researchers</h3>
                <p className="text-gray-700">
                  Quickly digest research papers, articles, and study materials. Save time on literature reviews and focus on what matters.
                </p>
              </div>
              <div className="border-l-4 border-purple-600 pl-4">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Professionals</h3>
                <p className="text-gray-700">
                  Stay updated with industry news, reports, and documentation without spending hours reading. Make informed decisions faster.
                </p>
              </div>
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Content Creators</h3>
                <p className="text-gray-700">
                  Research topics efficiently, extract key points from multiple sources, and create better content in less time.
                </p>
              </div>
              <div className="border-l-4 border-green-600 pl-4">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Lifelong Learners</h3>
                <p className="text-gray-700">
                  Explore new topics, understand complex subjects, and expand your knowledge without information overload.
                </p>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">10x</div>
              <div className="text-gray-700">Faster Reading</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">80%</div>
              <div className="text-gray-700">Time Saved</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">3</div>
              <div className="text-gray-700">Input Methods</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">100%</div>
              <div className="text-gray-700">Secure</div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-12 text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Reading?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of users who are saving time and staying informed with AI-powered summarization
            </p>
            <a
              href="/summarize"
              className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
            >
              Start Summarizing Now
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default About;
