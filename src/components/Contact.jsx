import React from "react";
import { Mail, Github, Linkedin, Globe, PhoneCallIcon } from "lucide-react";
import Navbar from "../pages/Navbar";

const Contact = ({ username, handleLogout }) => {
  return (
 <section className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
        <Navbar username={username} handleLogout={handleLogout} />
      <div className="max-w-4xl mx-auto text-center">
        {/* Title */}
        <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6">
          Contact <span className="text-orange-600">Me !</span>
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-12">
          Hi, I’m <span className="font-semibold">Shambhuraj Suresh Gadhave</span>.  
          Feel free to reach out via any of the links below 🚀
        </p>

        {/* Contact Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Email */}
          <a
            href="mailto:Gadhaveshambhuraj@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-6 bg-white dark:bg-gray-800 shadow-lg rounded-2xl hover:scale-105 hover:shadow-xl transition-transform duration-300"
          >
            <Mail className="w-8 h-8 text-blue-600 mr-4" />
            <span className="text-gray-800 dark:text-gray-200 text-lg font-medium">
              Gadhaveshambhuraj@gmail.com
            </span>
          </a>
          

          {/* GitHub */}
          <a
            href="https://github.com/shambhuraj0007"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-6 bg-white dark:bg-gray-800 shadow-lg rounded-2xl hover:scale-105 hover:shadow-xl transition-transform duration-300"
          >
            <Github className="w-8 h-8 text-gray-900 dark:text-white mr-4" />
            <span className="text-gray-800 dark:text-gray-200 text-lg font-medium">
              GitHub Profile
            </span>
          </a>

          {/* Portfolio */}
          <a
            href="https://portfolio-final-psi-seven.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-6 bg-white dark:bg-gray-800 shadow-lg rounded-2xl hover:scale-105 hover:shadow-xl transition-transform duration-300"
          >
            <Globe className="w-8 h-8 text-green-600 mr-4" />
            <span className="text-gray-800 dark:text-gray-200 text-lg font-medium">
              My Portfolio
            </span>
          </a>

          {/* LinkedIn */}
          <a
            href="https://www.linkedin.com/in/shambhuraj-gadhave-39b221347/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-6 bg-white dark:bg-gray-800 shadow-lg rounded-2xl hover:scale-105 hover:shadow-xl transition-transform duration-300"
          >
            <Linkedin className="w-8 h-8 text-blue-700 mr-4" />
            <span className="text-gray-800 dark:text-gray-200 text-lg font-medium">
              LinkedIn Profile
            </span>
          </a>
        </div>

        {/* Footer */}
        <p className="mt-12 text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} Shambhuraj Gadhave. Built with 💙 using React + TailwindCSS.
          <br />
            <span className="ml-2">Phone: +917058618054</span>
        </p>

      </div>
    </section>
  );
};

export default Contact;
