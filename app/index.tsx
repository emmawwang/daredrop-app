import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useMemo } from "react";
import EnvelopeAnimation from "@/components/EnvelopeAnimation";
import FireBadge from "@/components/FireBadge";
import DareHistory from "@/components/DareHistory";
import { Colors, FontSizes, Fonts } from "@/constants/theme";
import { useDare } from "@/contexts/DareContext";

// Sample dares - these will later be fetched from an API or database
const sampleDares = [
  "Take a photo of something beautiful!",
  //   "Design a logo for an imaginary company using only circles",
  //   "Write a letter to your future self 5 years from now",
  //   "Sketch your favorite place from memory",
  //   "Create a playlist of 5 songs that tell a story",
  //   "Build something useful from recycled materials",
  //   "Draw a self-portrait using only geometric shapes",
  //   "Write a 50-word story that ends with the word 'finally'",
  //   "Create a collage using only things you find in your kitchen",
  //   "Compose a haiku about your morning coffee",
];

export default function Home() {
  // For now, pick a random dare. Later this will be daily-based
  const [currentDare] = useState(() => {
    return sampleDares[Math.floor(Math.random() * sampleDares.length)];
  });

  const userName = "Adi"; // This will come from user profile
  const { completedDares, streakDays } = useDare();

  // Convert completedDares object to array format for DareHistory
  const completedDaresList = useMemo(() => {
    return Object.entries(completedDares)
      .filter(([_, data]) => data.completed)
      .map(([dare, data]) => ({
        id: dare,
        image: data.imageUri,
        completed: data.completed,
      }));
  }, [completedDares]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.welcomeText}>
                Ready for your next drop, {userName}?
              </Text>
            </View>
            <FireBadge days={streakDays} />
          </View>

          {/* Today's Dare Section */}
          <View style={styles.dareSection}>
            <Text style={styles.dareSectionTitle}>Your Dare Today:</Text>
            <EnvelopeAnimation dare={currentDare} />
          </View>

          {/* Dare History Section */}
          <DareHistory dares={completedDaresList} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: "center",
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  headerLeft: {
    flex: 1,
    marginRight: 16,
  },
  welcomeText: {
    fontSize: 40,
    marginTop: 36,
    fontFamily: Fonts.primary.regular,
    color: Colors.primary[500],
    lineHeight: 36,
  },
  dareSection: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  dareSectionTitle: {
    fontSize: 40,
    fontFamily: Fonts.primary.regular,
    color: Colors.secondary[500],
    marginBottom: 16,
    alignSelf: "flex-start",
    paddingLeft: 8,
  },
});
