// Theme configuration for the code editor playground
// Modern purple/blue gradient theme with cyan accents

export const colors = {
  // Primary colors
  primary: '#7c3aed',      // Vibrant purple
  secondary: '#06b6d4',    // Cyan accent

  // Background colors
  darkBg: '#1a1b26',       // Main dark background
  editorBg: '#282a3a',     // Editor background
  sidebarBg: '#1a1b26',    // Sidebar background
  buttonBg: '#303242',     // Button background

  // Text colors
  text: {
    primary: '#ffffff',    // Primary text
    secondary: '#a0aec0',  // Secondary text
    muted: '#718096',      // Muted text
  },

  // State colors
  hover: 'rgba(124, 58, 237, 0.1)',
  active: '#7c3aed',
  focus: 'rgba(6, 182, 212, 0.3)',
  border: 'rgba(124, 58, 237, 0.2)',

  // Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
    purpleBlack: 'linear-gradient(135deg, #7c3aed 0%, #1a1b26 100%)',
    darkBg: 'linear-gradient(135deg, #1a1b26 0%, #2d2d44 100%)',
    buttonHover: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(6, 182, 212, 0.1))',
    buttonActive: 'linear-gradient(135deg, #7c3aed, rgba(6, 182, 212, 0.2))',
  },
};

export const animations = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  timing: 'cubic-bezier(0.4, 0, 0.2, 1)', // Material Design easing
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
};

export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
};

export const shadows = {
  sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
  md: '0 4px 12px rgba(124, 58, 237, 0.15)',
  lg: '0 8px 24px rgba(124, 58, 237, 0.2)',
  glow: '0 0 20px rgba(124, 58, 237, 0.4)',
  cyan: '0 0 20px rgba(6, 182, 212, 0.4)',
};

// Ant Design theme configuration
export const antdTheme = {
  token: {
    // Primary colors
    colorPrimary: colors.primary,
    colorSuccess: colors.secondary,
    colorLink: colors.secondary,

    // Background colors
    colorBgContainer: colors.darkBg,
    colorBgElevated: colors.buttonBg,

    // Border
    colorBorder: colors.border,
    borderRadius: 8,
    borderRadiusLG: 12,

    // Font
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,

    // Motion
    motionDurationSlow: animations.duration.slow,
    motionDurationMid: animations.duration.normal,
    motionDurationFast: animations.duration.fast,
    motionEaseInOut: animations.timing,
  },

  components: {
    Button: {
      colorPrimary: colors.primary,
      colorPrimaryHover: colors.secondary,
      primaryShadow: shadows.md,
      controlHeight: 40,
      controlHeightLG: 48,
      borderRadius: borderRadius.md,
      fontWeight: 600,
    },

    Input: {
      colorBgContainer: colors.buttonBg,
      colorBorder: colors.border,
      colorPrimaryHover: colors.secondary,
      borderRadius: borderRadius.md,
    },

    Select: {
      colorBgContainer: colors.buttonBg,
      colorBorder: colors.border,
      borderRadius: borderRadius.md,
    },

    Menu: {
      colorBgContainer: colors.sidebarBg,
      colorItemBg: 'transparent',
      colorItemBgHover: colors.hover,
      colorItemTextHover: colors.secondary,
      borderRadius: borderRadius.sm,
    },

    Modal: {
      colorBgElevated: colors.darkBg,
      borderRadiusLG: borderRadius.lg,
    },
  },

  algorithm: 'dark', // Use dark algorithm
};

export default {
  colors,
  animations,
  spacing,
  borderRadius,
  shadows,
  antdTheme,
};
