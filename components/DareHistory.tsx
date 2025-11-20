import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";
import {
  Colors,
  BorderRadius,
  Shadows,
  FontSizes,
  Fonts,
} from "@/constants/theme";

const { width } = Dimensions.get("window");

interface DareHistoryItem {
  id: string;
  image?: string;
  completed: boolean;
}

interface DareHistoryProps {
  dares?: DareHistoryItem[];
}

export default function DareHistory({ dares = [] }: DareHistoryProps) {
  const isEmpty = dares.length === 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Dares</Text>

      {isEmpty ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Complete dares to fill your collection! 🎨
          </Text>
        </View>
      ) : (
        <View style={styles.daresGrid}>
          {dares.map((dare, index) => (
            <View key={dare.id} style={styles.dareCircle}>
              <View
                style={[
                  styles.dareCircleInner,
                  { backgroundColor: getPlaceholderColor(index) },
                ]}
              >
                {dare.image ? (
                  <Image
                    source={{ uri: dare.image }}
                    style={styles.dareImage}
                  />
                ) : (
                  <Text style={styles.darePlaceholder}>📸</Text>
                )}
              </View>
            </View>
          ))}
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
