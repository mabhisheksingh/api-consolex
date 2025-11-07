import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#64b5f6',
    },
    secondary: {
      main: '#f06292',
    },
    background: {
      default: '#0b1929',
      paper: '#102a43',
    },
  },
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

export default theme
