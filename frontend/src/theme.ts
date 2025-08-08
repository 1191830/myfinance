import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1565c0',    // azul escuro (confiança)
      light: '#5e92f3',
      dark: '#003c8f',
      contrastText: '#fff',
    },
    secondary: {
      main: '#fbc02d',    // amarelo ouro (destaques, atenção)
      light: '#fff263',
      dark: '#c49000',
      contrastText: '#000',
    },
    success: {
      main: '#2e7d32',    // verde escuro (ganhos, sucesso)
      light: '#60ad5e',
      dark: '#005005',
      contrastText: '#fff',
    },
    error: {
      main: '#d32f2f',    // vermelho escuro (despesas, erros)
      light: '#ff6659',
      dark: '#9a0007',
      contrastText: '#fff',
    },
    background: {
      default: '#f4f6f8', // cinza claro para fundo geral
      paper: '#fff',      // branco para cards/painéis
    },
    text: {
      primary: '#212121', // texto escuro para melhor leitura
      secondary: '#555',  // texto secundário
    },
  },

  typography: {
    fontFamily: `'Roboto', 'Helvetica', 'Arial', sans-serif`,
    h1: { fontWeight: 700, fontSize: '2.5rem', letterSpacing: '-0.01562em' },
    h2: { fontWeight: 600, fontSize: '2rem' },
    h3: { fontWeight: 500, fontSize: '1.75rem' },
    h4: { fontWeight: 500, fontSize: '1.5rem' },
    h5: { fontWeight: 400, fontSize: '1.25rem' },
    h6: { fontWeight: 400, fontSize: '1rem' },
    body1: { fontSize: '1rem' },
    body2: { fontSize: '0.875rem' },
    button: { textTransform: 'none', fontWeight: 600 },
  },

  shape: {
    borderRadius: 8,
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        containedPrimary: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 0 8px rgba(21, 101, 192, 0.6)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme;
