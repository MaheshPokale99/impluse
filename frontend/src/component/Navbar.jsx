import { NavLink } from "react-router-dom";
import Sidebar from "./Sidebar";
import ThemeToggle from "./ThemeToggle";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { title: "Home", path: "/home" },
    { title: "Explore Mentors", path: "/explore-mentors" },
    { title: "Success Stories", path: "/success-stories" },
    { title: "Image Gallery", path: "/image-gallery" },
  ];



  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 50, damping: 15 }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 h-16 md:h-20
        ${scrolled
          ? "backdrop-blur-md bg-white/80 dark:bg-black/80 shadow-lg"
          : "backdrop-blur-sm bg-white/50 dark:bg-black/30"
        }`}
    >
      <div className="max-w-screen-xl mx-auto flex items-center justify-between px-6 md:px-12 h-full">
        {/* Logo */}
        <NavLink to="/home" className="group relative overflow-hidden">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 
              bg-clip-text text-transparent transition-all duration-300 
              group-hover:from-indigo-500 group-hover:to-purple-600"
          >
            Impulse
          </motion.h1>
          <motion.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 0 }}
            whileHover={{ scaleX: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-600 to-indigo-500 
                    transform origin-left"
          ></motion.span>
        </NavLink>

        {/* Navigation Links */}
        <ul className="hidden md:flex space-x-1 text-base font-medium">
          {navLinks.map((link, index) => (
            <motion.li
              key={link.title}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.4 }}
              className="relative group"
            >
              <NavLink
                to={link.path}
                className={({ isActive }) =>
                  `transition-all duration-300 px-4 py-2 rounded-lg flex items-center
                  ${isActive
                    ? "text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/80 dark:bg-blue-900/20"
                    : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
                  }`
                }
              >
                {link.title}
                <motion.span
                  className="absolute bottom-0 left-0 right-0 h-[2px] mx-3 bg-gradient-to-r from-blue-600 to-indigo-500 
                    transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                ></motion.span>
              </NavLink>
            </motion.li>
          ))}
        </ul>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Sidebar />
        </div>
      </div>

    </motion.nav>
  );
};

export default Navbar;
