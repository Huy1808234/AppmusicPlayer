// useAppThemeStyles.ts
import { useTheme } from '../context/ThemeProvider';
export const useAppThemeStyles = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const colors = {
    background: isDark ? '#121212' : '#ffffff',
    text: isDark ? '#ffffff' : '#000000',
    subtext: isDark ? '#aaaaaa' : '#666666',
    border: isDark ? '#333333' : '#dddddd',
    card: isDark ? '#1e1e1e' : '#f4f4f4',
    primary: '#1DB954',
    error: '#f44336', 
  };

  return { isDark, colors };
};

