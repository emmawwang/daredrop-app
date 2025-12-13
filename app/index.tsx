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
import {
  Colors,
  FontSizes,
  Fonts,
  responsiveFontSize,
  responsiveSpacing,
} from "@/constants/theme";
import { getRandomDare, Dare } from "@/constants/dares";
import { useDare } from "@/contexts/DareContext";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const router = useRouter();
  const { profile } = useAuth();
  // For now, pick a random dare. Later this will be daily-based
  const [currentDare, setCurrentDare] = useState<Dare>(() => getRandomDare());

  const userName = profile?.first_name || "Friend";
  const { completedDares, streakDays, highlightedDareId } = useDare();

  // Get list of completed dare texts to exclude from "choose another"
  const completedDareTexts = useMemo(() => {
    return Object.entries(completedDares)
      .filter(([_, data]) => data.completed)
      .map(([dareText]) => dareText);
  }, [completedDares]);

  const handleChooseNewDare = () => {
    // Exclude current dare and all completed dares
    const excludeList = [currentDare.text, ...completedDareTexts];
    const newDare = getRandomDare(excludeList);
    setCurrentDare(newDare);
  };

  // Convert completedDares object to array format for DareHistory
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
        return dateB - dateA;
      });
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
    paddingBottom: responsiveSpacing(40),
  },
  container: {
    flex: 1,
    paddingHorizontal: responsiveSpacing(20),
    paddingTop: responsiveSpacing(50),
    alignItems: "center",
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingHorizontal: responsiveSpacing(8),
    marginTop: responsiveSpacing(10),
    gap: responsiveSpacing(15),
  },
  headerLeft: {
    flex: 0,
    maxWidth: "70%",
  },
  settingsButton: {
    position: "absolute",
    top: responsiveSpacing(58),
    right: responsiveSpacing(20),
    zIndex: 10,
  },
  welcomeText: {
    fontSize: responsiveFontSize(40),
    fontFamily: Fonts.primary.regular,
    color: Colors.primary[500],
    lineHeight: responsiveFontSize(44),
    marginBottom: responsiveSpacing(20),
  },
  dareSection: {
    width: "100%",
    alignItems: "center",
    marginBottom: responsiveSpacing(20),
  },
  dareSectionTitle: {
    fontSize: responsiveFontSize(40),
    fontFamily: Fonts.primary.regular,
    color: Colors.secondary[500],
    marginBottom: responsiveSpacing(20),
    alignSelf: "flex-start",
    paddingLeft: responsiveSpacing(8),
  },
  dareHistorySection: {
    marginTop: responsiveSpacing(10),
  },
});
