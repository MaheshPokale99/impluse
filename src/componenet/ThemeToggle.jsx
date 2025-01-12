import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

const ThemeToggle = () => {
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={setTheme}
      className="mr-5 rounded-full border-b-2 flex items-center justify-center text-3xl h-16 w-16 
        sm:h-16 sm:w-16 sm:border-b-4
        md:h-20 md:w-20 md:border-b-4
        lg:text-4xl lg:h-20 lg:w-20 lg:border-b-4
        xl:text-4xl xl:h-20 xl:w-20 xl:border-b-4
        transition-all duration-1000 ease-in-out"
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
};

export default ThemeToggle;
