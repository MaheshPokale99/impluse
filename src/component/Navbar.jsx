import { NavLink, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import ThemeToggle from "./ThemeToggle";
import { useState, useEffect } from "react";

export const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("token");
    setIsLoggedIn(true);
  }, [navigate]);

  return (
    <nav className="manrope-regular fixed top-0 left-0 w-full z-50 shadow-md transition-all duration-300 bg-zinc-900 h-16 md:h-20 mt-7 border-y border-blue-500">

      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto">

        <NavLink to="/home" className="hover:opacity-85 transition-opacity duration-200">
          <div className="flex justify-center items-center ml-8 mb-4 md:mb-0">
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-700 to-blue-400 bg-clip-text text-transparent">
              Impulse
            </h1>
          </div>
        </NavLink>

        <div className="flex md:order-2 space-x-2 md:space-x-0 rtl:space-x-reverse">
          {!isLoggedIn ? (
            <button
              type="button"
              className="text-white bg-orange-500 hover:bg-red-600 dark:bg-orange-700 dark:hover:bg-orange-600 
              focus:ring-4 dark:focus:ring-orange-700 font-medium text-sm md:text-lg 
              px-3 md:px-4 py-1.5 md:py-2 text-center w-20 md:w-28 h-10 md:h-12 
              rounded-2xl transition-all duration-300"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          ) : (
            <div className="flex items-center mr-8">
              <ThemeToggle />
              <Sidebar />
            </div>
          )}
        </div>

        {isLoggedIn && (
          <div className="hidden md:flex items-center justify-between w-full md:w-auto md:order-1">
            <ul className="flex flex-col md:flex-row font-medium p-4 md:p-0 mt-4 md:mt-0 md:space-x-8 text-lg md:text-xl mb-4 md:mb-0">
              {['Home', 'Explore Mentors', 'Success Stories'].map((item) => (
                <li key={item}>
                  <NavLink
                    to={`/${item.toLowerCase().replace(/\s+/g, '-')}`}
                    className={({ isActive }) =>
                      `block py-2 px-3 md:p-0 transition-colors duration-300 ${isActive
                        ? "dark:hover:text-blue-400 text-blue-400"
                        : "text-gray-200 dark:text-gray-100 hover:text-blue-400"
                      }`
                    }
                    aria-current={item === "Home" ? "page" : undefined}
                  >
                    {item}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

        )}
      </div>
    </nav>
  );
}

export default Navbar;
