// theme.js - Design system for Dealer Copilot
// Dark theme optimized for WhatsApp Web overlay

export const colors = {
  // Primary
  primary: '#667eea',
  primaryDark: '#5568d3',
  primaryLight: '#a3bffa',
  
  // Backgrounds
  background: '#1a1a1a',
  backgroundSecondary: '#2d2d2d',
  backgroundTertiary: '#3d3d3d',
  
  // Text
  text: '#f3f4f6',
  textSecondary: '#9ca3af',
  textTertiary: '#6b7280',
  
  // Borders
  border: '#374151',
  borderLight: '#4b5563',
  
  // Status
  success: '#34d399',
  warning: '#fbbf24',
  error: '#f87171',
  info: '#60a5fa',
  
  // WhatsApp matching
  whatsappGreen: '#25D366',
  whatsappGreenDark: '#128C7E',
  
  // Luxury accents
  gold: '#FFD700',
  silver: '#C0C0C0',
  platinum: '#E5E4E2'
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  '4xl': '40px'
};

export const typography = {
  fontFamily: "'Inter var', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  
  fontSize: {
    xs: '11px',
    sm: '12px',
    base: '14px',
    lg: '16px',
    xl: '18px',
    '2xl': '20px',
    '3xl': '24px'
  },
  
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75
  }
};

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
  md: '0 4px 6px rgba(0, 0, 0, 0.4)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.5)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.6)',
  inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
  glow: '0 0 20px rgba(102, 126, 234, 0.3)'
};

export const borderRadius = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px'
};

export const transitions = {
  fast: '150ms ease',
  normal: '250ms ease',
  slow: '350ms ease',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
};

// Animation keyframes
export const keyframes = {
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
  
  slideInRight: `
    @keyframes slideInRight {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
  `,
  
  pulse: `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `,
  
  bounce: `
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
  `
};

// Component-specific styles
export const componentStyles = {
  // Button variants
  button: {
    primary: `
      background: ${colors.primary};
      color: white;
      border: none;
      border-radius: ${borderRadius.md};
      padding: ${spacing.sm} ${spacing.lg};
      font-weight: ${typography.fontWeight.medium};
      cursor: pointer;
      transition: all ${transitions.normal};
      
      &:hover {
        background: ${colors.primaryDark};
        transform: translateY(-1px);
        box-shadow: ${shadows.md};
      }
      
      &:active {
        transform: translateY(0);
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `,
    
    secondary: `
      background: transparent;
      color: ${colors.text};
      border: 1px solid ${colors.border};
      border-radius: ${borderRadius.md};
      padding: ${spacing.sm} ${spacing.lg};
      cursor: pointer;
      transition: all ${transitions.normal};
      
      &:hover {
        border-color: ${colors.borderLight};
        background: ${colors.backgroundSecondary};
      }
    `,
    
    ghost: `
      background: transparent;
      color: ${colors.textSecondary};
      border: none;
      padding: ${spacing.xs} ${spacing.md};
      cursor: pointer;
      
      &:hover {
        color: ${colors.text};
        background: ${colors.backgroundSecondary};
      }
    `
  },
  
  // Input styles
  input: `
    background: ${colors.backgroundSecondary};
    color: ${colors.text};
    border: 1px solid ${colors.border};
    border-radius: ${borderRadius.md};
    padding: ${spacing.sm} ${spacing.md};
    font-family: ${typography.fontFamily};
    font-size: ${typography.fontSize.base};
    transition: border-color ${transitions.fast};
    
    &:focus {
      outline: none;
      border-color: ${colors.primary};
      box-shadow: 0 0 0 3px ${colors.primary}20;
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    &::placeholder {
      color: ${colors.textTertiary};
    }
  `,
  
  // Card styles
  card: `
    background: ${colors.backgroundSecondary};
    border: 1px solid ${colors.border};
    border-radius: ${borderRadius.lg};
    padding: ${spacing.lg};
    transition: all ${transitions.normal};
    
    &:hover {
      border-color: ${colors.borderLight};
      box-shadow: ${shadows.md};
    }
  `,
  
  // Badge styles
  badge: {
    success: `
      background: ${colors.success}20;
      color: ${colors.success};
      border: 1px solid ${colors.success}40;
    `,
    warning: `
      background: ${colors.warning}20;
      color: ${colors.warning};
      border: 1px solid ${colors.warning}40;
    `,
    error: `
      background: ${colors.error}20;
      color: ${colors.error};
      border: 1px solid ${colors.error}40;
    `,
    info: `
      background: ${colors.info}20;
      color: ${colors.info};
      border: 1px solid ${colors.info}40;
    `
  }
};

// Global styles
export const globalStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: ${typography.fontFamily};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: ${colors.background};
    color: ${colors.text};
    font-size: ${typography.fontSize.base};
    line-height: ${typography.lineHeight.normal};
  }
  
  ::selection {
    background: ${colors.primary}40;
    color: ${colors.text};
  }
  
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: ${colors.backgroundSecondary};
    border-radius: ${borderRadius.full};
  }
  
  ::-webkit-scrollbar-thumb {
    background: ${colors.borderLight};
    border-radius: ${borderRadius.full};
    
    &:hover {
      background: ${colors.textTertiary};
    }
  }
  
  // Utility classes
  .text-gradient {
    background: linear-gradient(135deg, ${colors.primary}, ${colors.whatsappGreen});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .glass {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .luxury-border {
    border: 1px solid transparent;
    background: linear-gradient(${colors.background}, ${colors.background}) padding-box,
                linear-gradient(45deg, ${colors.gold}, ${colors.platinum}) border-box;
  }
`;

// Theme provider
export const theme = {
  colors,
  spacing,
  typography,
  shadows,
  borderRadius,
  transitions,
  keyframes,
  componentStyles,
  globalStyles
};

export default theme;
