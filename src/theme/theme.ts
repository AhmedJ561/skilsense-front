'use client'
import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316',
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
      main: '#FF9933', // Theme Orange
      dark: '#E68A2E',
      light: '#FFB366',
      contrastText: '#ffffff',
    },
    secondary: {
      50: '#f0fdfa',
      100: '#ccfbf1',
      200: '#99f6e4',
      300: '#5eead4',
      400: '#2dd4bf',
      500: '#14b8a6',
      600: '#0d9488',
      700: '#0f766e',
      800: '#115e59',
      900: '#134e4a',
      main: '#00CED1', // Hero Aqua Blue
      dark: '#00B4B7',
      light: '#33D8DA',
      contrastText: '#ffffff',
    },
    background: {
      default: '#ffffff',
      paper: '#f9fafb',
    },
    text: {
      primary: '#111827',
      secondary: '#4b5563',
      disabled: '#9ca3af',
    },
    divider: 'rgba(255, 153, 51, 0.12)', // Subtle orange divider
  },
  typography: {
    fontFamily: ['Roboto', 'Montserrat', 'Open Sans', 'sans-serif'].join(','),
    h1: {
      fontSize: '3.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '3rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 2px 1px -1px rgba(0,0,0,0.1),0px 1px 1px 0px rgba(0,0,0,0.07),0px 1px 3px 0px rgba(0,0,0,0.06)',
    '0px 3px 1px -2px rgba(0,0,0,0.1),0px 2px 2px 0px rgba(0,0,0,0.07),0px 1px 5px 0px rgba(0,0,0,0.06)',
    '0px 3px 3px -2px rgba(0,0,0,0.1),0px 3px 4px 0px rgba(0,0,0,0.07),0px 1px 8px 0px rgba(0,0,0,0.06)',
    '0px 2px 4px -1px rgba(0,0,0,0.1),0px 4px 5px 0px rgba(0,0,0,0.07),0px 1px 10px 0px rgba(0,0,0,0.06)',
    '0px 3px 5px -1px rgba(0,0,0,0.1),0px 5px 8px 0px rgba(0,0,0,0.07),0px 1px 14px 0px rgba(0,0,0,0.06)',
    '0px 3px 5px -1px rgba(0,0,0,0.1),0px 6px 10px 0px rgba(0,0,0,0.07),0px 1px 18px 0px rgba(0,0,0,0.06)',
    '0px 4px 8px -2px rgba(0,0,0,0.1),0px 7px 12px 1px rgba(0,0,0,0.07),0px 2px 20px 2px rgba(0,0,0,0.06)',
    '0px 5px 9px -3px rgba(0,0,0,0.1),0px 8px 15px 1px rgba(0,0,0,0.07),0px 3px 24px 3px rgba(0,0,0,0.06)',
    '0px 5px 13px -3px rgba(0,0,0,0.1),0px 8px 18px 2px rgba(0,0,0,0.07),0px 3px 28px 4px rgba(0,0,0,0.06)',
    '0px 6px 15px -3px rgba(0,0,0,0.1),0px 9px 21px 3px rgba(0,0,0,0.07),0px 4px 32px 5px rgba(0,0,0,0.06)',
    '0px 6px 16px -3px rgba(0,0,0,0.1),0px 10px 24px 3px rgba(0,0,0,0.07),0px 4px 36px 6px rgba(0,0,0,0.06)',
    '0px 7px 17px -3px rgba(0,0,0,0.1),0px 11px 27px 4px rgba(0,0,0,0.07),0px 4px 40px 7px rgba(0,0,0,0.06)',
    '0px 7px 18px -3px rgba(0,0,0,0.1),0px 12px 30px 4px rgba(0,0,0,0.07),0px 5px 44px 8px rgba(0,0,0,0.06)',
    '0px 7px 20px -3px rgba(0,0,0,0.1),0px 13px 33px 5px rgba(0,0,0,0.07),0px 5px 48px 9px rgba(0,0,0,0.06)',
    '0px 8px 21px -3px rgba(0,0,0,0.1),0px 14px 36px 5px rgba(0,0,0,0.07),0px 5px 52px 10px rgba(0,0,0,0.06)',
    '0px 8px 22px -3px rgba(0,0,0,0.1),0px 15px 39px 6px rgba(0,0,0,0.07),0px 6px 56px 11px rgba(0,0,0,0.06)',
    '0px 8px 24px -3px rgba(0,0,0,0.1),0px 16px 42px 6px rgba(0,0,0,0.07),0px 6px 60px 12px rgba(0,0,0,0.06)',
    '0px 9px 25px -3px rgba(0,0,0,0.1),0px 17px 45px 7px rgba(0,0,0,0.07),0px 6px 64px 13px rgba(0,0,0,0.06)',
    '0px 9px 26px -3px rgba(0,0,0,0.1),0px 18px 48px 7px rgba(0,0,0,0.07),0px 7px 68px 14px rgba(0,0,0,0.06)',
    '0px 10px 28px -3px rgba(0,0,0,0.1),0px 19px 51px 8px rgba(0,0,0,0.07),0px 7px 72px 15px rgba(0,0,0,0.06)',
    '0px 10px 29px -3px rgba(0,0,0,0.1),0px 20px 54px 8px rgba(0,0,0,0.07),0px 7px 76px 16px rgba(0,0,0,0.06)',
    '0px 10px 31px -3px rgba(0,0,0,0.1),0px 21px 57px 9px rgba(0,0,0,0.07),0px 8px 80px 17px rgba(0,0,0,0.06)',
    '0px 11px 32px -3px rgba(0,0,0,0.1),0px 22px 60px 9px rgba(0,0,0,0.07),0px 8px 84px 18px rgba(0,0,0,0.06)',
    '0px 11px 34px -3px rgba(0,0,0,0.1),0px 23px 63px 10px rgba(0,0,0,0.07),0px 8px 88px 19px rgba(0,0,0,0.06)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px',
          borderRadius: 8,
          transition: 'all 0.3s ease',
        },
        contained: {
          background: 'linear-gradient(135deg, #FF9933 0%, #00CED1 100%)', // Orange to Aqua Gradient
          boxShadow: '0 4px 12px rgba(255, 153, 51, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #FFB366 0%, #33D8DA 100%)',
            boxShadow: '0 6px 20px rgba(255, 153, 51, 0.4)',
            transform: 'translateY(-2px)',
          },
        },
        outlined: {
          borderWidth: 2,
          borderColor: '#FF9933',
          color: '#FF9933',
          '&:hover': {
            borderWidth: 2,
            borderColor: '#00CED1',
            color: '#00CED1',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgba(255, 153, 51, 0.1), 0 4px 6px -2px rgba(0, 206, 209, 0.05)',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            transition: 'all 0.3s ease',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#FF9933',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#00CED1',
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 1px 3px 0 rgba(255, 153, 51, 0.1)',
        },
      },
    },
  },
})

export default theme