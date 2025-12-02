import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import TopRightButton from "@/components/TopRightButton";
import { Colors, Fonts, Shadows } from "@/constants/theme";
import { getTextDareIcon } from "@/constants/dares";
import { useDare } from "@/contexts/DareContext";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Fun scattered positions for dares - creates organic, piled-up look starting from bottom
const getScatteredPosition = (index: number, total: number) => {
  // Start from bottom of screen and work upwards
  const startFromBottom = SCREEN_HEIGHT - 200;

  const positions = [
    { left: "8%", top: startFromBottom, size: 115, rotation: -8 },
    { left: "58%", top: startFromBottom - 30, size: 125, rotation: 5 },
    { left: "25%", top: startFromBottom - 160, size: 110, rotation: 12 },
    { left: "65%", top: startFromBottom - 180, size: 120, rotation: -6 },
    { left: "10%", top: startFromBottom - 320, size: 118, rotation: 7 },
    { left: "58%", top: startFromBottom - 360, size: 112, rotation: -10 },
    { left: "15%", top: startFromBottom - 490, size: 122, rotation: 4 },
    { left: "62%", top: startFromBottom - 520, size: 116, rotation: -5 },
    { left: "8%", top: startFromBottom - 660, size: 120, rotation: 9 },
    { left: "55%", top: startFromBottom - 690, size: 114, rotation: -7 },
    { left: "22%", top: startFromBottom - 830, size: 118, rotation: 6 },
    { left: "60%", top: startFromBottom - 860, size: 117, rotation: -4 },
  ];

  // If we have more dares than predefined positions, continue the pattern
  if (index < positions.length) {
    return positions[index];
  }

  // Generate more positions dynamically, continuing upwards
  const row = Math.floor(index / 2);
  const isLeft = index % 2 === 0;
  return {
    left: isLeft ? "10%" : "58%",
    top: startFromBottom - 170 * row,
    size: 110 + (index % 3) * 6,
    rotation: (index % 2 === 0 ? 1 : -1) * (4 + (index % 5)),
  };
};

export default function YourDares() {
  const router = useRouter();
  const { completedDares } = useDare();

  // Convert completedDares object to array format
  const completedDaresList = useMemo(() => {
    return Object.entries(completedDares)
      .filter(([_, data]) => data.completed)
      .map(([dare, data]) => ({
        id: dare,
        image: data.imageUri,
        reflectionText: data.reflectionText,
        completed: data.completed,
      }));
  }, [completedDares]);

  const handleDarePress = (dare: any) => {
    router.push({
      pathname: "/dare-detail",
      params: {
        dare: dare.id,
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Home Button */}
      <TopRightButton style={styles.homeButton} onPress={() => router.back()}>
        <Ionicons name="home" size={24} color={Colors.primary[500]} />
      </TopRightButton>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            minHeight: Math.max(
              SCREEN_HEIGHT,
              completedDaresList.length * 90 + 300
            ),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.title}>
          Your{"\n"}Past{"\n"}Dares
        </Text>

        {/* Empty State */}
        {completedDaresList.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Complete dares to fill your collection! 🎨
            </Text>
          </View>
        )}

        {/* Scattered Dares */}
        {completedDaresList.map((dare, index) => {
          const position = getScatteredPosition(
            index,
            completedDaresList.length
          );
          return (
            <TouchableOpacity
              key={dare.id}
              activeOpacity={0.8}
              onPress={() => handleDarePress(dare)}
              style={[
                styles.dareCircle,
                {
                  left: position.left,
                  top: position.top,
                  width: position.size,
                  height: position.size,
                  transform: [{ rotate: `${position.rotation}deg` }],
                },
              ]}
            >
              <View style={styles.circleOuter}>
                <View style={styles.circleInner}>
                  {dare.image ? (
                    <Image
                      source={{ uri: dare.image }}
                      style={styles.dareImage}
                    />
                  ) : dare.reflectionText && getTextDareIcon(dare.id) ? (
                    <Image
                      source={getTextDareIcon(dare.id)!}
                      style={styles.dareImage}
                    />
                  ) : (
                    <View
                      style={[
                        styles.placeholder,
                        { backgroundColor: getPlaceholderColor(index) },
                      ]}
                    >
                      <Text style={styles.placeholderEmoji}>
                        {dare.reflectionText ? "💬" : "📸"}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

// Helper function for varied placeholder colors
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.accent.green,
  },
  homeButton: {
    position: "absolute",
    top: 60,
    right: 20,
    zIndex: 100,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 100,
    position: "relative",
  },
  title: {
    fontSize: 56,
    fontFamily: Fonts.primary.regular,
    color: Colors.primary[500],
    lineHeight: 60,
    paddingLeft: 40,
    paddingTop: 20,
    marginBottom: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontFamily: Fonts.secondary.regular,
    color: Colors.secondary[500],
    textAlign: "center",
    opacity: 0.8,
  },
  dareCircle: {
    position: "absolute",
    zIndex: 1,
  },
  circleOuter: {
    width: "100%",
    height: "100%",
    borderRadius: 1000,
    backgroundColor: Colors.white,
    padding: 4,
    ...Shadows.medium,
  },
  circleInner: {
    width: "100%",
    height: "100%",
    borderRadius: 1000,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: Colors.secondary[400],
  },
  dareImage: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderEmoji: {
    fontSize: 40,
  },
});
