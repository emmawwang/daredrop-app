import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useMemo } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import EnvelopeAnimation from "@/components/EnvelopeAnimation";
import FireBadge from "@/components/FireBadge";
import DareHistory from "@/components/DareHistory";
import TopRightButton from "@/components/TopRightButton";
import { Colors, FontSizes, Fonts } from "@/constants/theme";
import { getRandomDare, Dare } from "@/constants/dares";
import { useDare } from "@/contexts/DareContext";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const router = useRouter();
  const { profile } = useAuth();
  // For now, pick a random dare. Later this will be daily-based
  const [currentDare, setCurrentDare] = useState<Dare>(() => getRandomDare());

  const handleChooseNewDare = () => {
    const newDare = getRandomDare(currentDare.text);
    setCurrentDare(newDare);
  };

  const userName = profile?.first_name || "Friend";
  const { completedDares, streakDays, highlightedDareId } = useDare();

  // Convert completedDares object to array format for DareHistory
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

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Settings Button - Upper Right Corner */}
      <TopRightButton
        onPress={() => router.push("/settings")}
        style={styles.settingsButton}
      >
        <Ionicons
          name="settings-outline"
          size={24}
          color={Colors.primary[500]}
        />
      </TopRightButton>

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
            <EnvelopeAnimation
              dare={currentDare.text}
              onChooseNewDare={handleChooseNewDare}
            />
          </View>

          {/* Dare History Section */}
          <TouchableOpacity
            style={styles.dareHistorySection}
            activeOpacity={0.9}
            onPress={() => router.push("/your-dares")}
          >
            <DareHistory
              dares={completedDaresList}
              highlightedDareId={highlightedDareId}
            />
          </TouchableOpacity>
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
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingHorizontal: 8,
    marginTop: 10,
    gap: 15,
  },
  headerLeft: {
    flex: 0,
    maxWidth: "70%",
  },
  settingsButton: {
    position: "absolute",
    top: 58,
    right: 20,
    zIndex: 10,
  },
  welcomeText: {
    fontSize: 40,
    fontFamily: Fonts.primary.regular,
    color: Colors.primary[500],
    lineHeight: 44,
    marginBottom: 20,
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
    marginBottom: 20,
    alignSelf: "flex-start",
    paddingLeft: 8,
  },
  dareHistorySection: {
    marginTop: 20,
  },
});
