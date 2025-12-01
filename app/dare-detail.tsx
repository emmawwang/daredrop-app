import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Share,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { X, Share2, Calendar, Sparkles } from "lucide-react-native";
import { Colors, Fonts, BorderRadius, Shadows } from "@/constants/theme";
import { useDare } from "@/contexts/DareContext";

export default function DareDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const dareText = params.dare as string;
  const { getDareImage, getDareDate } = useDare();

  const imageUri = getDareImage(dareText);
  const dareDate = getDareDate(dareText);

  const handleShare = async () => {
    try {
      const message = `I completed a DareDrop dare! 🎨\n\n"${dareText}"\n\nJoin me in being creative every day with DareDrop!`;

      const result = await Share.share(
        {
          message: message,
          // On iOS, you can also share URLs and other content
          ...(Platform.OS === "ios" && imageUri ? { url: imageUri } : {}),
        },
        {
          // On Android, you can specify a dialog title
          ...(Platform.OS === "android"
            ? { dialogTitle: "Share your dare!" }
            : {}),
        }
      );

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Shared with activity type of result.activityType
        } else {
          // Shared
        }
      } else if (result.action === Share.dismissedAction) {
        // Dismissed
      }
    } catch (error: any) {
      Alert.alert("Error", "Failed to share dare");
      console.error(error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Date unknown";

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <X size={28} color={Colors.primary[500]} />
          </TouchableOpacity>

          {/* Header with Sparkles */}
          <View style={styles.header}>
            <Sparkles size={32} color={Colors.secondary[500]} />
            <Text style={styles.headerTitle}>Your Dare</Text>
            <Sparkles size={32} color={Colors.secondary[500]} />
          </View>

          {/* Date Badge */}
          <View style={styles.dateBadge}>
            <Calendar size={16} color={Colors.primary[500]} />
            <Text style={styles.dateText}>{formatDate(dareDate)}</Text>
          </View>

          {/* Dare Card */}
          <View style={styles.dareCard}>
            <Text style={styles.dareText}>{dareText}</Text>
          </View>

          {/* Image Display */}
          {imageUri ? (
            <View style={styles.imageContainer}>
              <Text style={styles.sectionLabel}>Your Creation</Text>
              <Image source={{ uri: imageUri }} style={styles.dareImage} />
            </View>
          ) : (
            <View style={styles.noImageContainer}>
              <Text style={styles.noImageEmoji}>📸</Text>
              <Text style={styles.noImageText}>
                No photo added for this dare
              </Text>
            </View>
          )}

          {/* Share Button */}
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Share2 size={20} color={Colors.white} />
            <Text style={styles.shareButtonText}>Share Your Dare</Text>
          </TouchableOpacity>

          {/* Motivational Message */}
          <View style={styles.messageCard}>
            <Text style={styles.messageText}>
              Keep the creative streak going! Every dare brings out your unique
              creativity.
            </Text>
          </View>
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
  },
  closeButton: {
    alignSelf: "flex-end",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    ...Shadows.small,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 42,
    fontFamily: Fonts.primary.regular,
    color: Colors.primary[500],
  },
  dateBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.white,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: BorderRadius.lg,
    alignSelf: "center",
    marginBottom: 24,
    ...Shadows.small,
  },
  dateText: {
    fontSize: 16,
    fontFamily: Fonts.secondary.medium,
    color: Colors.primary[500],
  },
  dareCard: {
    backgroundColor: Colors.accent.yellow,
    borderRadius: BorderRadius.xl,
    padding: 28,
    marginBottom: 32,
    borderWidth: 2,
    borderColor: Colors.secondary[500],
    ...Shadows.medium,
  },
  dareText: {
    fontSize: 24,
    fontFamily: Fonts.primary.regular,
    color: Colors.primary[500],
    textAlign: "center",
    lineHeight: 32,
  },
  imageContainer: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 20,
    fontFamily: Fonts.secondary.semiBold,
    color: Colors.secondary[500],
    marginBottom: 12,
    textAlign: "center",
  },
  dareImage: {
    width: "100%",
    height: 350,
    borderRadius: BorderRadius.xl,
    borderWidth: 3,
    borderColor: Colors.primary[500],
    ...Shadows.large,
  },
  noImageContainer: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: 40,
    marginBottom: 24,
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.gray[300],
    borderStyle: "dashed",
  },
  noImageEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  noImageText: {
    fontSize: 16,
    fontFamily: Fonts.secondary.regular,
    color: Colors.gray[500],
    textAlign: "center",
  },
  shareButton: {
    backgroundColor: Colors.secondary[500],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: BorderRadius.xl,
    marginBottom: 24,
    ...Shadows.medium,
  },
  shareButtonText: {
    fontSize: 18,
    fontFamily: Fonts.secondary.semiBold,
    color: Colors.white,
  },
  messageCard: {
    backgroundColor: Colors.accent.green,
    borderRadius: BorderRadius.lg,
    padding: 20,
    borderWidth: 1.5,
    borderColor: Colors.primary[400],
  },
  messageText: {
    fontSize: 16,
    fontFamily: Fonts.secondary.regular,
    color: Colors.primary[600],
    textAlign: "center",
    lineHeight: 24,
  },
});
