import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { GoSun } from "react-icons/go";
import { FaRegMoon } from "react-icons/fa";
import { motion } from "framer-motion";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <motion.button
      onClick={toggleTheme}
      className="flex justify-center items-center text-2xl bg-white/10 dark:bg-black/20 backdrop-blur-md 
      rounded-full h-10 w-10 shadow-lg border border-blue-400 dark:border-yellow-400 
      transition-all duration-300 transform hover:scale-110 active:scale-90 lg:mt-2"
      whileTap={{ scale: 0.85 }}
    >
      {theme === "light" ? (
        <motion.span
          key="moon"
          initial={{ opacity: 0, rotate: -180 }}
          animate={{ opacity: 1, rotate: 0 }}
          exit={{ opacity: 0, rotate: 180 }}
          transition={{ duration: 0.4 }}
        >
          <FaRegMoon className="text-blue-500 dark:text-gray-200 transition-colors duration-300" />
        </motion.span>
      ) : (
        <motion.span
          key="sun"
          initial={{ opacity: 0, rotate: 180 }}
          animate={{ opacity: 1, rotate: 0 }}
          exit={{ opacity: 0, rotate: -180 }}
          transition={{ duration: 0.4 }}
        >
          <GoSun className="text-yellow-500 transition-colors duration-300" />
        </motion.span>
      )}
    </motion.button>
  );
};

export default ThemeToggle;
