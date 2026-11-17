import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("baytakTheme");

    return savedTheme === "dark";
  });

  useEffect(() => {
    const root = document.documentElement;

    if (darkMode) {
      root.setAttribute("data-theme", "dark");
      root.classList.add("dark-mode");

      localStorage.setItem("baytakTheme", "dark");
    } else {
      root.setAttribute("data-theme", "light");
      root.classList.remove("dark-mode");

      localStorage.setItem("baytakTheme", "light");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((previousMode) => !previousMode);
  };

  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        setDarkMode,
        toggleDarkMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (context === null) {
    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );
  }

  return context;
}