import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = ({ username, handleLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const linkClasses =
    "relative transition text-gray-300 hover:text-white after:content-[''] after:absolute after:w-0 after:h-[2px] after:left-0 after:-bottom-1 after:bg-gradient-to-r after:from-pink-500 after:to-orange-500 after:transition-all after:duration-300 hover:after:w-full";
  const activeClasses =
    "text-white font-semibold after:w-full after:bg-gradient-to-r after:from-pink-500 after:to-orange-500";

  const menuLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/About" },
    { name: "Contact", path: "/contact" },
  ];

  // Sidebar animation
  const sidebarVariants = {
    hidden: { x: "100%", opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit: { x: "100%", opacity: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 0.5 },
    exit: { opacity: 0 },
  };

  return (
    <header className="shadow-lg bg-gray-900 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Left: Welcome */}
        <h1 className="text-xl sm:text-2xl font-bold text-white">
          Welcome,{" "}
          <span className="bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
            {username}
          </span>
        </h1>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-8 items-center">
          <nav className="flex space-x-8 text-lg font-medium">
            {menuLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                end={link.path === "/"}
                className={({ isActive }) =>
                  isActive ? activeClasses : linkClasses
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="px-5 py-2 rounded-xl font-medium text-white bg-gradient-to-r from-pink-500 to-orange-500 shadow-lg hover:scale-105 transition-transform"
          >
            Logout
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-300 hover:text-white"
          onClick={() => setIsOpen(true)}
        >
          <Menu size={28} />
        </button>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black z-30"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setIsOpen(false)}
            />

            {/* Sidebar */}
            <motion.div
              className="fixed top-0 right-0 bottom-0 bg-gray-900 z-40 shadow-lg p-6 flex flex-col"
              style={{ width: "max-content" }}
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Close Button */}
              <button
                className="self-end mb-8 text-gray-300 hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                <X size={28} />
              </button>

              {/* Menu Links */}
              <nav className="flex flex-col space-y-6 text-lg font-medium">
                {menuLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className="text-gray-300 hover:text-white transition relative after:content-[''] after:absolute after:w-0 after:h-[2px] after:left-0 after:-bottom-1 after:bg-gradient-to-r after:from-pink-500 after:to-orange-500 after:transition-all after:duration-300 hover:after:w-full"
                  >
                    {link.name}
                  </Link>
                ))}

                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="px-5 py-2 rounded-xl font-medium text-white bg-gradient-to-r from-pink-500 to-orange-500 shadow-lg hover:scale-105 transition-transform mt-6"
                >
                  Logout
                </button>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
