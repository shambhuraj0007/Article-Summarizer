import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Github, Linkedin, Mail, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-indigo-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                AI Summarizer
              </span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Transform lengthy text into concise, meaningful summaries using advanced AI technology. 
              Save time and boost productivity with intelligent text summarization.
            </p>
            <div className="flex gap-4">
              <a
                href="https://github.com/shambhuraj0007"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/shambhuraj-gadhave-39b221347"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="mailto:shambhurajgadhave@gmail.com"
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-indigo-300">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/home"
                  className="text-gray-300 hover:text-indigo-400 transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/summarize"
                  className="text-gray-300 hover:text-indigo-400 transition-colors"
                >
                  Summarize Text
                </Link>
              </li>
              <li>
                <Link
                  to="/history"
                  className="text-gray-300 hover:text-indigo-400 transition-colors"
                >
                  History
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-indigo-300">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-indigo-400 transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-indigo-400 transition-colors"
                >
                  API Reference
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-indigo-400 transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-indigo-400 transition-colors"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {currentYear} AI Summarizer. All rights reservedto Shambhuraj.
            </p>
            <p className="text-gray-400 text-sm flex items-center gap-1">
              Made By <Heart className="w-4 h-4 text-red-400 fill-red-400" /> Shambhuraj Gadhave
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
