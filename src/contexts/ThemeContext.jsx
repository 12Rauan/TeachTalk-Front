import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [theme, setTheme] = useState({
    primary: '#3B82F6', // blue-600
    secondary: '#6B7280', // gray-500
    background: '#FFFFFF',
    text: '#111827', // gray-900
    surfaceBackground: '#F9FAFB', // gray-50
    surfaceText: '#374151', // gray-700
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    localStorage.setItem('theme', !isDark ? 'dark' : 'light');
  };

  const updateThemeColors = (newColors) => {
    setTheme({ ...theme, ...newColors });
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, theme, updateThemeColors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);