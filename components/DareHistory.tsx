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

export default function DareHistory({
  dares = [],
  highlightedDareId = null,
  fullScreen = false,
}: DareHistoryProps) {
  const isEmpty = dares.length === 0;
  const router = useRouter();

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
        <View style={styles.gridContainer}>
          <View style={styles.daresGrid}>
            {dares.map((dare, index) => (
              <DareCircle
                key={dare.id}
                dare={dare}
                index={index}
                isHighlighted={highlightedDareId === dare.id}
                onPress={() => handleDarePress(dare)}
              />
            ))}
          </View>
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

// Individual dare circle component with highlighting animation
function DareCircle({
  dare,
  index,
  isHighlighted,
  onPress,
}: {
  dare: DareHistoryItem;
  index: number;
  isHighlighted: boolean;
  onPress: () => void;
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
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
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
    borderWidth: 1.5,
    borderColor: Colors.secondary[500],
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
    marginBottom: 20,
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
  gridContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  daresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 12,
  },
  dareCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.white,
    padding: 3,
    ...Shadows.small,
  },
  dareCircleInner: {
    width: "100%",
    height: "100%",
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  dareImage: {
    width: "100%",
    height: "100%",
    borderRadius: 32,
  },
  darePlaceholder: {
    fontSize: 28,
  },
});
