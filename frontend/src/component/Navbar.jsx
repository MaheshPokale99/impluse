import { NavLink, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import ThemeToggle from "./ThemeToggle";
import { useState, useEffect } from "react";

export const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("token");
    setIsLoggedIn(!false);
  }, []);

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
              className="custom-button h-12 w-36 mt-2 md:mt-4 lg:mt-1 lg:h-14"
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
