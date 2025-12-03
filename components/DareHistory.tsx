import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  Animated,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Colors,
  BorderRadius,
  Shadows,
  FontSizes,
  Fonts,
} from "@/constants/theme";
import { getTextDareIcon } from "@/constants/dares";

const { width } = Dimensions.get("window");

// Mini pile constants for preview box
const CIRCLE_SIZE = 65;
const ROW_HEIGHT = 75;
const BOX_WIDTH = width * 0.9 - 48; // Container width minus padding
const MAX_DARES = 11;

interface DareHistoryItem {
  id: string;
  image?: string;
  reflectionText?: string;
  completed: boolean;
}

interface DareHistoryProps {
  dares?: DareHistoryItem[];
  highlightedDareId?: string | null;
  fullScreen?: boolean;
}

// Pyramid distribution for mini preview - bottom rows have more circles
const getMiniPyramidDistribution = (total: number): number[] => {
  const count = Math.min(total, MAX_DARES);
  if (count === 0) return [];
  if (count === 1) return [1];
  if (count === 2) return [2];
  if (count === 3) return [3];
  if (count === 4) return [4];
  if (count === 5) return [4, 1];
  if (count === 6) return [4, 2];
  if (count === 7) return [4, 3];
  if (count === 8) return [4, 3, 1];
  if (count === 9) return [4, 3, 2];
  if (count === 10) return [4, 4, 2];
  if (count === 11) return [4, 4, 3];
  return [3, 3, 2]; // Max 8
};

// Get position for a dare in the mini pyramid pile
const getMiniPilePosition = (index: number, total: number) => {
  const count = Math.min(total, MAX_DARES);
  const distribution = getMiniPyramidDistribution(count);
  const totalRows = distribution.length;

  // Oldest dares (high index) go to bottom rows, newest (low index) to top
  let dareIndex = count - 1 - index; // Flip: now 0 = oldest, high = newest
  let rowFromBottom = 0;
  let posInRow = 0;
  let cumulative = 0;

  for (let r = 0; r < distribution.length; r++) {
    if (dareIndex < cumulative + distribution[r]) {
      rowFromBottom = r;
      posInRow = dareIndex - cumulative;
      break;
    }
    cumulative += distribution[r];
  }

  const circlesInThisRow = distribution[rowFromBottom];

  // Center the row horizontally within the box
  const rowWidth = circlesInThisRow * CIRCLE_SIZE + (circlesInThisRow - 1) * 12;
  const rowStartX = (BOX_WIDTH - rowWidth) / 2;

  // Add slight jitter for organic feel
  const xJitter = ((index * 13) % 14) - 7;
  const left = rowStartX + posInRow * (CIRCLE_SIZE + 12) + xJitter;

  // Calculate Y from bottom of container
  const bottom = 10 + rowFromBottom * ROW_HEIGHT;

  // Slight rotation
  const rotations = [-5, 4, -3, 6, -4, 5, -6, 3];
  const rotation = rotations[index % rotations.length];

  return { left, bottom, rotation };
};

export default function DareHistory({
  dares = [],
  highlightedDareId = null,
  fullScreen = false,
}: DareHistoryProps) {
  const isEmpty = dares.length === 0;
  const router = useRouter();

  // Limit to MAX_DARES for preview
  const displayDares = dares.slice(0, MAX_DARES);
  const distribution = getMiniPyramidDistribution(displayDares.length);
  const totalRows = distribution.length;
  const pileHeight = totalRows * ROW_HEIGHT + 20;

  const handleDarePress = (dare: DareHistoryItem) => {
    router.push({
      pathname: "/dare-detail",
      params: {
        dare: dare.id,
      },
    });
  };

  return (
    <View style={[styles.container, fullScreen && styles.fullScreenContainer]}>
      <Text style={styles.title}>Your Dares</Text>

      {isEmpty ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Complete dares to fill your collection! 🎨
          </Text>
        </View>
      ) : (
        <View
          style={[
            styles.pileContainer,
            { minHeight: Math.max(180, pileHeight) },
          ]}
        >
          {displayDares.map((dare, index) => {
            const position = getMiniPilePosition(index, displayDares.length);
            return (
              <DareCircle
                key={dare.id}
                dare={dare}
                index={index}
                isHighlighted={highlightedDareId === dare.id}
                onPress={() => handleDarePress(dare)}
                position={position}
              />
            );
          })}
        </View>
      )}
    </View>
  );
}

// Helper function to get varied placeholder colors
function getPlaceholderColor(index: number): string {
  const colors = [
    "#FFB3BA",
    "#BAFFC9",
    "#BAE1FF",
    "#FFFFBA",
    "#FFD9BA",
    "#E0BBE4",
  ];
  return colors[index % colors.length];
}

// Individual dare circle component with highlighting animation and position
function DareCircle({
  dare,
  index,
  isHighlighted,
  onPress,
  position,
}: {
  dare: DareHistoryItem;
  index: number;
  isHighlighted: boolean;
  onPress: () => void;
  position: { left: number; bottom: number; rotation: number };
}) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const borderAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isHighlighted) {
      // Reset animations
      scaleAnim.setValue(1);
      borderAnim.setValue(0);

      // Start highlight animation
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(borderAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: false,
          }),
          Animated.delay(1200),
          Animated.timing(borderAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: false,
          }),
        ]),
      ]).start();
    }
  }, [isHighlighted]);

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.accent.yellow, Colors.accent.yellow],
  });

  const borderWidth = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 4],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.dareCircleWrapper,
        {
          left: position.left,
          bottom: position.bottom,
          transform: [{ rotate: `${position.rotation}deg` }],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.dareCircle,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.dareCircleInner,
            {
              backgroundColor: getPlaceholderColor(index),
              borderColor: borderColor,
              borderWidth: borderWidth,
            },
          ]}
        >
          {dare.image ? (
            <Image source={{ uri: dare.image }} style={styles.dareImage} />
          ) : dare.reflectionText && getTextDareIcon(dare.id) ? (
            <Image
              source={getTextDareIcon(dare.id)!}
              style={styles.dareImage}
            />
          ) : dare.reflectionText ? (
            <Text style={styles.darePlaceholder}>💬</Text>
          ) : (
            <Text style={styles.darePlaceholder}>📸</Text>
          )}
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.accent.green,
    borderRadius: BorderRadius.xxl,
    padding: 24,
    width: width * 0.9,
    marginTop: -150,
    maxWidth: 350,
    minHeight: 280,
    borderWidth: 2,
    borderColor: Colors.primary[500],
    ...Shadows.medium,
    flexDirection: "column",
  },
  fullScreenContainer: {
    width: "100%",
    maxWidth: "100%",
    marginTop: 0,
    borderRadius: 0,
    borderWidth: 0,
    flex: 1,
  },
  title: {
    fontSize: 36,
    fontFamily: Fonts.primary.regular,
    color: Colors.primary[500],
    marginBottom: 10,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: Fonts.secondary.regular,
    color: Colors.secondary[500],
    textAlign: "center",
    opacity: 0.8,
  },
  pileContainer: {
    flex: 1,
    position: "relative",
  },
  dareCircleWrapper: {
    position: "absolute",
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
  },
  dareCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: Colors.white,
    padding: 3,
    ...Shadows.small,
  },
  dareCircleInner: {
    width: "100%",
    height: "100%",
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  dareImage: {
    width: "100%",
    height: "100%",
    borderRadius: CIRCLE_SIZE / 2,
  },
  darePlaceholder: {
    fontSize: 24,
  },
});
