/**
 * Responsive utilities for consistent sizing across different screen sizes
 * Based on standard mobile screen sizes
 */

import { Dimensions, Platform, PixelRatio } from "react-native";

// Base dimensions (iPhone 14 Pro as reference)
const BASE_WIDTH = 393;
const BASE_HEIGHT = 852;

// Get current dimensions
export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

/**
 * Scale size based on screen width
 * Maintains proportions across different screen sizes
 */
export const scaleWidth = (size: number): number => {
  return (SCREEN_WIDTH / BASE_WIDTH) * size;
};

/**
 * Scale size based on screen height
 * Use for vertical spacing and elements
 */
export const scaleHeight = (size: number): number => {
  return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
};

/**
 * Scale with moderate factor
 * Won't scale as much on large devices (tablets)
 * Good for font sizes to avoid them being too large
 */
export const moderateScale = (size: number, factor = 0.5): number => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  return size + (scale - 1) * size * factor;
};

/**
 * Responsive font size
 * Scales moderately and respects platform text scaling
 */
export const responsiveFontSize = (size: number): number => {
  const newSize = moderateScale(size);
  if (Platform.OS === "ios") {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
};

/**
 * Responsive spacing
 * Ensures consistent spacing across screen sizes
 */
export const responsiveSpacing = (size: number): number => {
  return Math.round(scaleWidth(size));
};

/**
 * Check if device is a small screen (< 375px width)
 */
export const isSmallDevice = (): boolean => {
  return SCREEN_WIDTH < 375;
};

/**
 * Check if device is a large screen (> 414px width - likely tablet or large phone)
 */
export const isLargeDevice = (): boolean => {
  return SCREEN_WIDTH > 414;
};

/**
 * Check if device is a tablet (> 600px width)
 */
export const isTablet = (): boolean => {
  return SCREEN_WIDTH >= 600;
};

/**
 * Get responsive value based on screen size
 * @param small - Value for small screens (< 375px)
 * @param medium - Value for medium screens (375px - 414px)
 * @param large - Value for large screens (> 414px)
 */
export const getResponsiveValue = <T,>(
  small: T,
  medium: T,
  large?: T
): T => {
  if (isSmallDevice()) {
    return small;
  }
  if (isLargeDevice() && large !== undefined) {
    return large;
  }
  return medium;
};

/**
 * Platform-specific value helper
 */
export const getPlatformValue = <T,>(ios: T, android: T): T => {
  return Platform.OS === "ios" ? ios : android;
};

/**
 * Responsive percentage width
 */
export const wp = (percentage: number): number => {
  return (SCREEN_WIDTH * percentage) / 100;
};

/**
 * Responsive percentage height
 */
export const hp = (percentage: number): number => {
  return (SCREEN_HEIGHT * percentage) / 100;
};
