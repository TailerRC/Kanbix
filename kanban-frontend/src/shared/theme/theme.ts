import { createTheme, type ThemeOptions } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface TypeBackground {
    surface: string;
    "surface-elevated": string;
  }
}

const lightPalette: ThemeOptions["palette"] = {
  mode: "light",
  primary: {
    main: "#6366F1",
    dark: "#4F46E5",
    light: "#818CF8",
    contrastText: "#FFFFFF",
  },
  secondary: {
    main: "#EEF2FF",
    contrastText: "#6366F1",
  },
  error: {
    main: "#EF4444",
    light: "#FEF2F2",
  },
  warning: {
    main: "#F59E0B",
    light: "#FFFBEB",
  },
  success: {
    main: "#10B981",
    light: "#ECFDF5",
  },
  info: {
    main: "#3B82F6",
    light: "#EFF6FF",
  },
  background: {
    default: "#F8FAFC",
    paper: "#FFFFFF",
    surface: "#FFFFFF",
    "surface-elevated": "#FFFFFF",
  },
  text: {
    primary: "#0F172A",
    secondary: "#64748B",
    disabled: "#94A3B8",
  },
  divider: "#E2E8F0",
  action: {
    active: "#64748B",
    hover: "#F1F5F9",
    selected: "#EEF2FF",
    focus: "#EEF2FF",
  },
};

const darkPalette: ThemeOptions["palette"] = {
  mode: "dark",
  primary: {
    main: "#818CF8",
    dark: "#6366F1",
    light: "#A5B4FC",
    contrastText: "#0F172A",
  },
  secondary: {
    main: "#1E293B",
    contrastText: "#818CF8",
  },
  error: {
    main: "#EF4444",
    light: "#450A0A",
  },
  warning: {
    main: "#F59E0B",
    light: "#451A03",
  },
  success: {
    main: "#10B981",
    light: "#052E16",
  },
  info: {
    main: "#3B82F6",
    light: "#172554",
  },
  background: {
    default: "#0F172A",
    paper: "#1E293B",
    surface: "#1E293B",
    "surface-elevated": "#334155",
  },
  text: {
    primary: "#F1F5F9",
    secondary: "#94A3B8",
    disabled: "#64748B",
  },
  divider: "#334155",
  action: {
    active: "#94A3B8",
    hover: "#334155",
    selected: "#1E293B",
    focus: "#1E293B",
  },
};

const baseTypography: ThemeOptions["typography"] = {
  fontFamily: [
    '"Plus Jakarta Sans"',
    "system-ui",
    "-apple-system",
    "sans-serif",
  ].join(","),
  h4: {
    fontSize: "24px",
    fontWeight: 700,
    lineHeight: 1.3,
    letterSpacing: "-0.02em",
  },
  h5: {
    fontSize: "20px",
    fontWeight: 600,
    lineHeight: 1.35,
  },
  h6: {
    fontSize: "16px",
    fontWeight: 600,
    lineHeight: 1.4,
  },
  body1: {
    fontSize: "14px",
    fontWeight: 400,
    lineHeight: 1.5,
  },
  body2: {
    fontSize: "13px",
    fontWeight: 500,
    lineHeight: 1.4,
  },
  caption: {
    fontSize: "11px",
    fontWeight: 400,
    lineHeight: 1.3,
    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
  },
};

const components: ThemeOptions["components"] = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: "none",
        fontWeight: 600,
        borderRadius: "8px",
        padding: "8px 16px",
        fontSize: "14px",
        lineHeight: 1.5,
      },
      contained: {
        boxShadow: "none",
        "&:hover": {
          boxShadow: "none",
        },
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        "& .MuiOutlinedInput-root": {
          borderRadius: "8px",
          fontSize: "14px",
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: "12px",
        boxShadow:
          "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
        border: "1px solid #E2E8F0",
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: "none",
      },
    },
  },
  MuiLink: {
    styleOverrides: {
      root: {
        fontWeight: 500,
        fontSize: "14px",
        cursor: "pointer",
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: "8px",
        fontSize: "14px",
      },
      standardError: {
        backgroundColor: "#FEF2F2",
        color: "#EF4444",
      },
      standardWarning: {
        backgroundColor: "#FFFBEB",
        color: "#F59E0B",
      },
      standardSuccess: {
        backgroundColor: "#ECFDF5",
        color: "#10B981",
      },
      standardInfo: {
        backgroundColor: "#EFF6FF",
        color: "#3B82F6",
      },
    },
  },
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      },
    },
  },
};

export const lightTheme = createTheme({
  palette: lightPalette as ThemeOptions["palette"],
  typography: baseTypography,
  components,
  shape: { borderRadius: 8 },
});

export const darkTheme = createTheme({
  palette: darkPalette as ThemeOptions["palette"],
  typography: baseTypography,
  components,
  shape: { borderRadius: 8 },
});
