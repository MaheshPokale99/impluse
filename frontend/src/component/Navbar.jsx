import { NavLink } from "react-router-dom";
import Sidebar from "./Sidebar";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {

  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-lg bg-white/50 dark:bg-black/30 shadow-lg 
      border-y border-gray-600 dark:border-gray-500 transition-all duration-300 h-16 md:h-20 rounded-lg mt-4">

      <div className="max-w-screen-xl mx-auto flex items-center justify-between px-6 md:px-12 lg:mt-2">

        {/* Logo */}
        <NavLink to="/home" className="hover:opacity-85 transition-opacity duration-200">
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-700 to-blue-400 
            bg-clip-text text-transparent">
            Impulse
          </h1>
        </NavLink>

        {/* Navigation Links */}
        <ul className="hidden md:flex space-x-6 text-lg font-medium">
          {["Home", "Explore Mentors", "Success Stories", "Image Gallery"].map((item) => (
            <li key={item}>
              <NavLink
                to={`/${item.toLowerCase().replace(/\s+/g, "-")}`}
                className={({ isActive }) =>
                  `transition-all duration-300 px-3 py-1 rounded-lg ${isActive ? "text-blue-500 dark:text-blue-400 font-semibold"
                    : "text-gray-800 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
                  }`
                }
              >
                {item}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Right Side */}
        <div className="flex items-center space-x-1">
          <ThemeToggle />
          <Sidebar />

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
