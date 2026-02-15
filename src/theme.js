import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#4285f4' },
    background: { default: '#ffffff', paper: '#f8f9fa' },
    text: { primary: '#1a1a1a', secondary: '#5f6368' },
  },
  typography: {
    fontFamily: '"Pretendard Variable", "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
  },
  shape: { borderRadius: 3 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 3, border: '1px solid #e0e0e0' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 3, textTransform: 'none' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 3 },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 3 },
      },
    },
  },
});

export default theme;
