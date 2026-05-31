import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { getThemeOptions } from '../theme';

const ColorModeContext = createContext({ toggleColorMode: () => {}, mode: 'dark' });

export const useColorMode = () => useContext(ColorModeContext);

export const ColorModeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    return savedMode || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: (newMode) => {
        if (newMode) {
          setMode(newMode);
        } else {
          setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
        }
      },
      mode,
    }),
    [mode]
  );

  const theme = useMemo(() => createTheme(getThemeOptions(mode)), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};
