import React from "react";
import { MapPin } from "lucide-react";
import Navbar from "../pages/Navbar";

const About = ({ username, handleLogout }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      <Navbar username={username} handleLogout={handleLogout} />

      <div className="max-w-4xl mx-auto text-center px-6 py-12">
        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-blue-600">
          About Us
        </h1>

        {/* Description */}
        <p className="text-lg md:text-xl leading-relaxed mb-8 text-gray-600 dark:text-gray-300">
          Welcome to our platform! 🚀 We are passionate about building modern,
          responsive, and user-friendly web applications.  
          Our goal is to make technology simple, efficient, and accessible to everyone.  
        </p>

        {/* Location Card */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 flex flex-col items-center space-y-4 hover:scale-105 transition transform">
          <MapPin className="w-12 h-12 text-blue-600" />
          <h2 className="text-xl font-semibold">Our Location</h2>
          <p className="text-gray-700 dark:text-gray-300">
            📍 Pune, Maharashtra, India
          </p>
          <iframe
            title="Google Map Location"
            className="w-full h-64 rounded-xl border-0 shadow-md"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3782.0868692213784!2d73.85674381489362!3d18.52043068739992!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c06c14c1c5f1%3A0x4d1c7fbaee06b6!2sPune%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1678712345678!5m2!1sen!2sin"
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default About;
