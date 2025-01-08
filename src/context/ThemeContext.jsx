import { createContext, useEffect, useState } from "react";

export const ThemeContext=createContext();

const ThemeProvider  = ({children}) => {
  const systemTheme=window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; 
  const [theme, setTheme]=useState(localStorage.getItem('theme') || systemTheme);

  useEffect(()=>{
    document.documentElement.setAttribute("data-theme",theme);
    localStorage.setItem("theme",theme);
  },[theme]);

  const toggleTheme=()=>{
    setTheme(prevTheme=>(prevTheme==="light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{theme,setTheme:toggleTheme}}>
      {children}
    </ThemeContext.Provider>
  )
}

export default ThemeProvider;
