import React, { useState } from "react";
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
  Modal,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { isVideoFile } from "@/lib/storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Share2,
  Calendar,
  Sparkles,
  Pencil,
  FileText,
} from "lucide-react-native";
import TopRightButton from "@/components/TopRightButton";
import { Colors, Fonts, BorderRadius, Shadows } from "@/constants/theme";
import { getDareByText } from "@/constants/dares";
import { useDare } from "@/contexts/DareContext";

export default function DareDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const dareText = params.dare as string;
  const { getDareImage, getDareReflection, getDareDate, deleteDare } =
    useDare();

  // Get dare type
  const dareInfo = getDareByText(dareText);
  const dareType = dareInfo?.type || "photo";

  const imageUri = getDareImage(dareText);
  const reflectionText = getDareReflection(dareText);
  const dareDate = getDareDate(dareText);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

  const handleShare = async () => {
    try {
      let message = `I completed a DareDrop dare! 🎨\n\n"${dareText}"`;

      if (reflectionText) {
        message += `\n\nMy reflection:\n"${reflectionText}"`;
      }

      message += `\n\nJoin me in being creative every day with DareDrop!`;

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

  const handleEditDare = () => {
    setShowEditModal(false);
    // Navigate to complete dare screen to re-edit
    router.push({
      pathname: "/complete-dare",
      params: {
        dare: dareText,
        completed: "false",
        imageUri: imageUri,
        reflectionText: reflectionText,
      },
    });
  };

  const handleDeleteDare = () => {
    setShowEditModal(false);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDeletion = () => {
    deleteDare(dareText);
    setShowDeleteConfirmation(false);
    setShowDeleteSuccess(true);

    // Navigate home after 1.5 seconds
    setTimeout(() => {
      router.back();
    }, 1500);
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

  const hasContent = imageUri || reflectionText;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Close Button */}
          <TopRightButton
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={24} color={Colors.primary[500]} />
          </TopRightButton>

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

          {/* Content Display - Photo or Text Reflection */}
          {dareType === "photo" && imageUri ? (
            <View style={styles.imageContainer}>
              <Text style={styles.sectionLabel}>Your Creation</Text>
              <View style={styles.imageWrapper}>
                {isVideoFile(imageUri) ? (
                  <Video
                    source={{ uri: imageUri }}
                    style={styles.dareImage}
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                    isLooping
                  />
                ) : (
                  <Image source={{ uri: imageUri }} style={styles.dareImage} />
                )}
                <TouchableOpacity
                  style={styles.pencilButton}
                  activeOpacity={0.7}
                  onPress={() => setShowEditModal(true)}
                >
                  <Pencil color={Colors.primary[500]} size={18} />
                </TouchableOpacity>
              </View>
            </View>
          ) : dareType === "text" && reflectionText ? (
            <View style={styles.reflectionContainer}>
              <Text style={styles.sectionLabel}>Your Reflection</Text>
              <View style={styles.reflectionWrapper}>
                <View style={styles.reflectionHeader}>
                  <FileText color={Colors.primary[500]} size={24} />
                </View>
                <Text style={styles.reflectionText}>{reflectionText}</Text>
                <TouchableOpacity
                  style={styles.pencilButtonReflection}
                  activeOpacity={0.7}
                  onPress={() => setShowEditModal(true)}
                >
                  <Pencil color={Colors.primary[500]} size={18} />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.noContentContainer}>
              <Text style={styles.noContentEmoji}>
                {dareType === "photo" ? "📸" : "✍️"}
              </Text>
              <Text style={styles.noContentText}>
                {dareType === "photo"
                  ? "No photo added for this dare"
                  : "No reflection added for this dare"}
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

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowEditModal(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleEditDare}
              activeOpacity={0.7}
            >
              <Text style={styles.modalOptionText}>Edit dare</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalOption, styles.modalOptionDelete]}
              onPress={handleDeleteDare}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.modalOptionText, styles.modalOptionTextDelete]}
              >
                Delete dare
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteConfirmation}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirmation(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDeleteConfirmation(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.confirmationTitle}>Delete this dare?</Text>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleConfirmDeletion}
              activeOpacity={0.7}
            >
              <Text style={styles.modalOptionText}>Confirm deletion</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalOption, styles.modalOptionCancel]}
              onPress={() => setShowDeleteConfirmation(false)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.modalOptionText, styles.modalOptionTextCancel]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Delete Success Modal */}
      <Modal
        visible={showDeleteSuccess}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.successTitle}>Dare successfully deleted</Text>
          </View>
        </View>
      </Modal>
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
    marginBottom: 20,
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
    borderColor: Colors.primary[500],
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
  imageWrapper: {
    position: "relative",
  },
  dareImage: {
    width: "100%",
    height: 350,
    borderRadius: BorderRadius.xl,
    borderWidth: 3,
    borderColor: Colors.primary[500],
    ...Shadows.large,
  },
  pencilButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accent.yellow,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.white,
    ...Shadows.medium,
  },
  // Reflection styles
  reflectionContainer: {
    marginBottom: 24,
  },
  reflectionWrapper: {
    position: "relative",
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: 24,
    borderWidth: 3,
    borderColor: Colors.primary[500],
    ...Shadows.large,
  },
  reflectionHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  reflectionText: {
    fontSize: 18,
    fontFamily: Fonts.secondary.regular,
    color: Colors.text.dark,
    lineHeight: 28,
    fontStyle: "italic",
  },
  pencilButtonReflection: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accent.yellow,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.white,
    ...Shadows.medium,
  },
  noContentContainer: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: 40,
    marginBottom: 24,
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.gray[300],
    borderStyle: "dashed",
  },
  noContentEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  noContentText: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    padding: 20,
    width: "80%",
    maxWidth: 300,
    ...Shadows.large,
  },
  modalOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary[500],
    marginBottom: 12,
    alignItems: "center",
  },
  modalOptionDelete: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: Colors.secondary[500],
    marginBottom: 0,
  },
  modalOptionText: {
    fontSize: 18,
    fontFamily: Fonts.secondary.semiBold,
    color: Colors.white,
  },
  modalOptionTextDelete: {
    color: Colors.secondary[500],
  },
  modalOptionCancel: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: Colors.primary[500],
    marginBottom: 0,
  },
  modalOptionTextCancel: {
    color: Colors.primary[500],
  },
  confirmationTitle: {
    fontSize: 20,
    fontFamily: Fonts.secondary.bold,
    color: Colors.primary[500],
    textAlign: "center",
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 20,
    fontFamily: Fonts.secondary.bold,
    color: Colors.primary[500],
    textAlign: "center",
  },
});
