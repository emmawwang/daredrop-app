// DareDrop Theme Constants
// Based on Figma design

export const Colors = {
  // Background colors
  background: "#F3EAE3", // Cream/beige background
  white: "#FFFFFF",

  // Primary colors (blue/purple - for main text and accents)
  primary: {
    50: "#F0F2F9",
    100: "#E1E5F3",
    200: "#C3CBE7",
    300: "#A5B1DB",
    400: "#8797CF",
    500: "#6777B5", // Main purple-blue
    600: "#5562A6",
    700: "#3F4994",
    800: "#2A3082",
    900: "#141770",
  },

  // Secondary colors (pink/rose - for highlights)
  secondary: {
    50: "#FCF0F4",
    100: "#F9E1E9",
    200: "#F3C3D3",
    300: "#EDA5BD",
    400: "#E187A7",
    500: "#D27089", // Main pink
    600: "#CA5D83",
    700: "#BE3F6B",
    800: "#B22153",
    900: "#A6033B",
  },

  // Accent colors
  accent: {
    yellow: "#EECE7B", // Dare card background
    orange: "#F48C42", // Fire icon
    orangeRed: "#EE6C4D", // Fire icon gradient
    green: "#CAD183", // Success/completed
  },

  // Text colors
  text: {
    primary: "#6777B6", // Purple-blue
    secondary: "#D27089", // Pink
    dark: "#4A4A4A",
    light: "#9CA3AF",
  },

  // UI elements
  envelope: "#F3EAE3",
  envelopeOutline: "#B8A5BC", // medium purple - more visible
  shadow: "rgba(0, 0, 0, 0.1)",
};

export const Fonts = {
  primary: {
    regular: "PoorStory_400Regular",
  },
  secondary: {
    regular: "Outfit_400Regular",
    medium: "Outfit_500Medium",
    semiBold: "Outfit_600SemiBold",
    bold: "Outfit_700Bold",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const Shadows = {
  small: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};
