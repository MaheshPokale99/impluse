import { NavLink, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import ThemeToggle from "./ThemeToggle";
import { useState, useEffect } from "react";

export const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("token");
    setIsLoggedIn(true);
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-lg bg-white/50 dark:bg-black/30 shadow-lg 
      border-b border-gray-300 dark:border-gray-700 transition-all duration-300 h-16 md:h-20 rounded-b-lg">
      
      <div className="max-w-screen-xl mx-auto flex items-center justify-between px-6 md:px-12">
        
        {/* Logo */}
        <NavLink to="/home" className="hover:opacity-85 transition-opacity duration-200">
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-700 to-blue-400 
            bg-clip-text text-transparent mb-5 md:mb-0">
            Impulse
          </h1>
        </NavLink>

        {/* Navigation Links */}
        {isLoggedIn && (
          <ul className="hidden md:flex space-x-6 text-lg font-medium">
            {["Home", "Explore Mentors", "Success Stories"].map((item) => (
              <li key={item}>
                <NavLink
                  to={`/${item.toLowerCase().replace(/\s+/g, "-")}`}
                  className={({ isActive }) =>
                    `transition-all duration-300 px-3 py-1 rounded-lg ${
                      isActive ? "text-blue-500 dark:text-blue-400 font-semibold" 
                      : "text-gray-800 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
                    }`
                  }
                >
                  {item}
                </NavLink>
              </li>
            ))}
          </ul>
        )}

        {/* Right Side */}
        <div className="flex items-center space-x-1">
          <ThemeToggle />

          {!isLoggedIn ? (
            <button
              className="px-5 py-2 text-white bg-gradient-to-r from-orange-500 to-red-500 
              hover:from-orange-600 hover:to-red-600 dark:from-orange-700 dark:to-red-700 
              dark:hover:from-orange-800 dark:hover:to-red-800 rounded-xl shadow-md 
              transition-transform duration-300 transform hover:scale-105 active:scale-95"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          ) : (
            <Sidebar />
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
