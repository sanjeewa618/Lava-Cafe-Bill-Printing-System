import { createTheme } from '@mui/material/styles';

export const getThemeOptions = (mode) => {
  const dark = mode === 'dark';
  const inputBg = dark ? '#1A1A1A' : '#FFFFFF';
  const inputText = dark ? '#FFFFFF' : '#121212';

  return {
    palette: {
      mode,
      primary: {
        main: '#FFC107',
        light: '#FFD54F',
        dark: '#FF8F00',
        contrastText: dark ? '#121212' : '#000000',
      },
      secondary: {
        main: dark ? '#121212' : '#FFFFFF',
        light: dark ? '#2C2C2C' : '#F5F5F5',
        dark: dark ? '#000000' : '#E0E0E0',
        contrastText: dark ? '#FFFFFF' : '#121212',
      },
      background: {
        default: dark ? '#0A0A0A' : '#F8F9FA',
        paper: dark ? '#1A1A1A' : '#FFFFFF',
      },
      text: {
        primary: dark ? '#FFFFFF' : '#121212',
        secondary: dark ? '#B0B0B0' : '#666666',
      },
      success: { main: '#4CAF50' },
      error: { main: '#F44336' },
      warning: { main: '#FFC107' },
      info: { main: '#29B6F6' },
      divider: dark ? 'rgba(255, 193, 7, 0.15)' : 'rgba(0, 0, 0, 0.08)',
    },
    typography: {
      fontFamily: "'Outfit', 'Inter', sans-serif",
      h1: { fontWeight: 800, letterSpacing: '-0.02em' },
      h2: { fontWeight: 700, letterSpacing: '-0.01em' },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.02em' },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: dark ? '#2C2C2C #121212' : '#E0E0E0 #F5F5F5',
            '&::-webkit-scrollbar, & *::-webkit-scrollbar': { width: 8, height: 8 },
            '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
              borderRadius: 8,
              backgroundColor: dark ? '#2C2C2C' : '#E0E0E0',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: '10px 24px',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: dark ? '0 6px 20px rgba(255,193,7,0.3)' : '0 6px 20px rgba(255,193,7,0.2)',
            },
          },
          containedPrimary: {
            background: 'linear-gradient(135deg, #FFC107 0%, #FF8F00 100%)',
            color: '#121212',
            fontWeight: 700,
            '&:hover': {
              background: 'linear-gradient(135deg, #FFD54F 0%, #FFC107 100%)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: dark ? '#1A1A1A' : '#FFFFFF',
            border: dark ? '1px solid rgba(255,193,7,0.1)' : '1px solid rgba(0,0,0,0.05)',
            boxShadow: dark ? 'none' : '0 4px 12px rgba(0,0,0,0.03)',
            transition: 'all 0.3s ease',
            '&:hover': {
              border: dark ? '1px solid rgba(255,193,7,0.3)' : '1px solid rgba(255,193,7,0.4)',
              boxShadow: dark ? '0 8px 32px rgba(255,193,7,0.1)' : '0 8px 32px rgba(0,0,0,0.08)',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: dark ? '#121212' : '#FFFFFF',
            color: dark ? '#FFFFFF' : '#121212',
            borderBottom: dark ? '1px solid rgba(255,193,7,0.1)' : '1px solid rgba(0,0,0,0.08)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: dark ? '#121212' : '#FFFFFF',
            borderRight: dark ? '1px solid rgba(255,193,7,0.1)' : '1px solid rgba(0,0,0,0.08)',
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            backgroundColor: inputBg,
            '&:hover': { backgroundColor: inputBg },
            '&.Mui-focused': { backgroundColor: inputBg },
            '& fieldset': {
              borderColor: dark ? 'rgba(255,193,7,0.2)' : 'rgba(0,0,0,0.15)',
            },
            '&:hover fieldset': { borderColor: '#FFC107' },
            '&.Mui-focused fieldset': { borderColor: '#FFC107', borderWidth: 2 },
          },
          input: {
            color: inputText,
            backgroundColor: inputBg,
            '&:-webkit-autofill': {
              WebkitBoxShadow: '0 0 0 1000px ' + inputBg + ' inset',
              WebkitTextFillColor: inputText,
              caretColor: inputText,
              transition: 'background-color 5000s ease-in-out 0s',
            },
            '&:-webkit-autofill:hover': {
              WebkitBoxShadow: '0 0 0 1000px ' + inputBg + ' inset',
            },
            '&:-webkit-autofill:focus': {
              WebkitBoxShadow: '0 0 0 1000px ' + inputBg + ' inset',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& label.Mui-focused': { color: '#FFC107' },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 8 },
          colorPrimary: { backgroundColor: 'rgba(255,193,7,0.15)', color: '#FFC107' },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            '&.Mui-selected': {
              backgroundColor: 'rgba(255,193,7,0.1)',
              '&:hover': { backgroundColor: 'rgba(255,193,7,0.15)' },
            },
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              backgroundColor: dark ? '#121212' : '#F8F9FA',
              color: '#FFC107',
              fontWeight: 700,
            },
          },
        },
      },
    },
  };
};

const theme = createTheme(getThemeOptions('dark'));
export default theme;
