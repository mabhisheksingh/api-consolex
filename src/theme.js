import { createTheme } from '@mui/material/styles'

const buildPalette = (mode) => {
  const isDark = mode === 'dark'
  return {
    mode,
    primary: {
      main: isDark ? '#64b5f6' : '#1976d2',
    },
    secondary: {
      main: isDark ? '#f06292' : '#d81b60',
    },
    background: isDark
      ? {
          default: '#0b1929',
          paper: '#102a43',
        }
      : {
          default: '#f5f7fb',
          paper: '#ffffff',
        },
  }
}

export const createAppTheme = (mode = 'dark') =>
  createTheme({
    palette: buildPalette(mode),
    typography: {
      fontFamily: 'Inter, Roboto, "Helvetica Neue", Arial, sans-serif',
      h1: { fontSize: '2.5rem', fontWeight: 600 },
      h2: { fontSize: '2rem', fontWeight: 600 },
      h3: { fontSize: '1.75rem', fontWeight: 600 },
      subtitle1: { fontWeight: 500 },
    },
    components: {
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
          },
        },
      },
      MuiAppBar: {
        defaultProps: {
          elevation: 0,
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  })

export default createAppTheme
