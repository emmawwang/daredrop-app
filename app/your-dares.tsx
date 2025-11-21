import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { House } from "lucide-react-native";
import DareHistory from "@/components/DareHistory";
import { Colors, Fonts } from "@/constants/theme";
import { useDare } from "@/contexts/DareContext";

export default function YourDares() {
  const router = useRouter();
  const { completedDares, highlightedDareId } = useDare();

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
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.container}>
        {/* Home Button */}
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <House color={Colors.primary[500]} size={28} />
        </TouchableOpacity>

        {/* Expanded Dare History */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <DareHistory dares={completedDaresList} highlightedDareId={highlightedDareId} fullScreen={true} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.accent.green,
  },
  container: {
    flex: 1,
    position: "relative",
  },
  homeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: "center",
    minHeight: "90%",
  },
});

