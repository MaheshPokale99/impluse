import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { GoSun } from "react-icons/go";
import { FaRegMoon } from "react-icons/fa";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      className="flex justify-center items-center text-2xl transition-transform duration-500 transform dark:bg-gray-700 dark:hover:bg-gray-600 
      rounded-full h-10 w-10 shadow-md dark:shadow-lg border border-blue-400
      focus:outline-none active:scale-90 mb-4 md:mb-0"    
    >
      {theme === "light" ? (
        <FaRegMoon className="text-center text-slate-200 font-bold transition-colors duration-500" />
      ) : (
        <GoSun className="text-center text-yellow-400 font-bold transition-colors duration-500"/>
      )}
    </button>
  );
};

export default ThemeToggle;
