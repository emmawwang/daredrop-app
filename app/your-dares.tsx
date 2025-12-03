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
import {
  getTextDareIcon,
  getVideoDareIcon,
  getDareByText,
} from "@/constants/dares";
import { useDare } from "@/contexts/DareContext";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Grid layout constants - no overlapping circles
const CIRCLE_SIZE = 115;
const ROW_HEIGHT = 130;
const BOTTOM_PADDING = 50; // Space from bottom of screen
const TITLE_HEIGHT = 280; // Height of title area to avoid
const MAX_TOP_POSITION_RATIO = 0.32; // Never place circles above 60% of screen height

// Calculate pyramid row distribution - top rows (newest) taper, bottom rows (oldest) have more
// Returns array like [1, 2, 3, 3] meaning top row (index 0) has 1, next has 2, bottom rows have 3, etc.
const getPyramidDistribution = (total: number): number[] => {
  if (total === 0) return [];
  if (total === 1) return [1];
  if (total === 2) return [1, 1];
  if (total === 3) return [1, 2];
  if (total === 4) return [1, 3];
  if (total === 5) return [2, 3];
  if (total === 6) return [3, 3];
  if (total === 7) return [1, 3, 3];
  if (total === 8) return [2, 3, 3];
  if (total === 9) return [3, 3, 3];
  if (total === 10) return [1, 3, 3, 3];

  // For larger numbers, build pyramid pattern from top to bottom
  // Top rows (index 0) have fewer circles, bottom rows have more
  // Build from bottom up conceptually, then reverse to get top-to-bottom array
  const rows: number[] = [];
  let remaining = total;
  let maxInRow = 3; // Start with 3 for bottom rows

  while (remaining > 0) {
    const inThisRow = Math.min(remaining, maxInRow);
    rows.push(inThisRow);
    remaining -= inThisRow;
    // Gradually reduce max per row as we go up (every 2-3 rows)
    if (rows.length % 3 === 0 && maxInRow > 1) {
      maxInRow--;
    }
  }

  // Reverse so top rows (index 0) have fewer, bottom rows have more
  return rows.reverse();
};

// Get position for a dare in the pyramid pile
// index 0 = newest (top of pile), highest index = oldest (bottom)
const getBinPosition = (index: number, total: number) => {
  const distribution = getPyramidDistribution(total);
  const totalRows = distribution.length;

  // Find which row this dare belongs to (counting from top)
  // Newest dares (index 0) go to top rows, oldest (high index) to bottom rows
  let rowFromTop = 0;
  let posInRow = 0;
  let cumulative = 0;

  for (let r = 0; r < distribution.length; r++) {
    if (index < cumulative + distribution[r]) {
      rowFromTop = r;
      posInRow = index - cumulative;
      break;
    }
    cumulative += distribution[r];
  }

  const circlesInThisRow = distribution[rowFromTop];

  // Center the row horizontally
  const rowWidth = circlesInThisRow * CIRCLE_SIZE + (circlesInThisRow - 1) * 15;
  const rowStartX = (SCREEN_WIDTH - rowWidth) / 2;

  // Add slight random offset for organic feel
  const xJitter = ((index * 17) % 20) - 10;
  const left = rowStartX + posInRow * (CIRCLE_SIZE + 15) + xJitter;

  // Calculate Y position - start from max allowed top position and grow downward
  // Never place circles above 60% of screen height
  const maxTopPosition = SCREEN_HEIGHT * MAX_TOP_POSITION_RATIO;
  const top = maxTopPosition + rowFromTop * ROW_HEIGHT;

  // Slight rotation for natural "dropped" look
  const rotations = [-6, 5, -4, 7, -3, 6, -5, 4, -7, 3];
  const rotation = rotations[index % rotations.length];

  return { left, top, rotation };
};

export default function YourDares() {
  const router = useRouter();
  const { completedDares } = useDare();

  // Convert completedDares object to array format
  // Sort by completedAt: newest first (top of pile), oldest last (bottom)
  const completedDaresList = useMemo(() => {
    return Object.entries(completedDares)
      .filter(([_, data]) => data.completed)
      .map(([dare, data]) => ({
        id: dare,
        image: data.imageUri,
        videoUri: data.videoUri,
        reflectionText: data.reflectionText,
        completed: data.completed,
        completedAt: data.completedAt,
      }))
      .sort((a, b) => {
        // Sort by completedAt descending (newest first = top of pile)
        const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
        const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
        return dateB - dateA; // Newest first
      });
  }, [completedDares]);

  // Calculate content height for scrolling
  // When pile grows large, we need to scroll to see all dares
  const distribution = getPyramidDistribution(completedDaresList.length);
  const totalRows = distribution.length;
  const maxTopPosition = SCREEN_HEIGHT * MAX_TOP_POSITION_RATIO;

  // Calculate the bottom of the last row
  const bottomRowTop = maxTopPosition + (totalRows - 1) * ROW_HEIGHT;
  const bottomRowBottom = bottomRowTop + CIRCLE_SIZE;

  // Content height should be at least the screen height, or extend to show all dares
  // Add padding at the bottom for better scrolling experience
  const contentHeight = Math.max(
    SCREEN_HEIGHT,
    bottomRowBottom + BOTTOM_PADDING
  );

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

      {/* Scrollable Content - scroll DOWN to see older dares at bottom */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            minHeight: Math.max(SCREEN_HEIGHT, contentHeight),
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
              Complete dares to fill your collection!
            </Text>
          </View>
        )}

        {/* Dare Bin - newest at top, scroll down for older dares */}
        {/* index 0 = newest (top of page), higher index = older (bottom) */}
        {completedDaresList.map((dare, index) => {
          const position = getBinPosition(index, completedDaresList.length);
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
                  width: CIRCLE_SIZE,
                  height: CIRCLE_SIZE,
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
                  ) : dare.videoUri && getVideoDareIcon(dare.id) ? (
                    <Image
                      source={getVideoDareIcon(dare.id)!}
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
                        {dare.videoUri
                          ? "🎥"
                          : dare.reflectionText
                          ? "💬"
                          : "📸"}
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
