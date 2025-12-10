import React, { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
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
import * as Sharing from "expo-sharing";
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
import LoadingOverlay from "@/components/LoadingOverlay";
import { Colors, Fonts, BorderRadius, Shadows } from "@/constants/theme";
import { getDareByText } from "@/constants/dares";
import { useDare } from "@/contexts/DareContext";
import {
  parseSpotifySong,
  formatSpotifySong,
  SpotifySong,
} from "@/lib/spotify";
import { Music } from "lucide-react-native";
import * as Linking from "expo-linking";

export default function DareDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const dareText = params.dare as string;
  const { getDareImage, getDareVideo, getDareReflection, getDareDate, deleteDare, loadDares } =
    useDare();

  // Get dare type
  const dareInfo = getDareByText(dareText);
  const dareType = dareInfo?.type || "photo";

  const imageUri = getDareImage(dareText);
  const videoPath = getDareVideo(dareText);
  const reflectionText = getDareReflection(dareText);
  const dareDate = getDareDate(dareText);
  const videoRef = useRef<Video>(null);
  const [videoUri, setVideoUri] = useState<string | undefined>(undefined);
  const [videoError, setVideoError] = useState<string | undefined>(undefined);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reload dares when component mounts to ensure we have latest data
  useEffect(() => {
    loadDares();
  }, []);

  // Timeout fallback to ensure loading state doesn't get stuck
  useEffect(() => {
    if (isLoadingMedia) {
      // Clear any existing timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      // Set a timeout to reset loading state after 10 seconds (fallback)
      loadingTimeoutRef.current = setTimeout(() => {
        console.warn("Loading timeout - resetting loading state");
        setIsLoadingMedia(false);
      }, 10000);
    } else {
      // Clear timeout when loading completes
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    }

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [isLoadingMedia]);

  // Get signed URL for video if it's stored in Supabase Storage
  useEffect(() => {
    const getSignedUrl = async () => {
      if (!videoPath) {
        console.log("No video path found for dare:", dareText);
        setVideoUri(undefined);
        setVideoError(undefined);
        setIsLoadingMedia(false);
        return;
      }

      console.log("Loading video from path:", videoPath);
      setIsLoadingMedia(true);

      // If it's already a full URL, use it directly
      if (videoPath.startsWith("http://") || videoPath.startsWith("https://")) {
        console.log("Using direct URL:", videoPath);
        setVideoUri(videoPath);
        setVideoError(undefined);
        setIsLoadingMedia(false);
        return;
      }

      // If it's a storage path, get a signed URL
      if (videoPath.startsWith("dare-videos/")) {
        const path = videoPath.replace("dare-videos/", "");
        console.log("Creating signed URL for path:", path);
        
        try {
          const { data, error } = await supabase.storage
            .from("dare-videos")
            .createSignedUrl(path, 3600); // 1 hour expiry

          if (error || !data) {
            console.error("Error getting signed URL:", error);
            setVideoError(error?.message || "Failed to load video");
            setVideoUri(undefined);
            setIsLoadingMedia(false);
            return;
          }

          console.log("Successfully created signed URL");
          setVideoUri(data.signedUrl);
          setVideoError(undefined);
          setIsLoadingMedia(false);
        } catch (error) {
          console.error("Error in getSignedUrl:", error);
          setVideoError("Failed to load video");
          setVideoUri(undefined);
          setIsLoadingMedia(false);
        }
      } else {
        // Local file path
        console.log("Using local file path:", videoPath);
        setVideoUri(videoPath);
        setVideoError(undefined);
        setIsLoadingMedia(false);
      }
    };

    getSignedUrl();
  }, [videoPath, dareText]);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

  const handleShare = async () => {
    try {
      let message = `I completed a DareDrop dare! 🎨\n\n"${dareText}"`;

      // Handle Spotify dares specially
      if (dareType === "spotify" && reflectionText) {
        // Parse Spotify song from reflection text
        const songData = reflectionText.includes("|REFLECTION|")
          ? reflectionText.split("|REFLECTION|")[0]
          : reflectionText;
        const userReflection = reflectionText.includes("|REFLECTION|")
          ? reflectionText.split("|REFLECTION|")[1]
          : null;
        const song = parseSpotifySong(songData);

        if (song) {
          message += `\n\n`;
          
          // Add song info
          message += `"${song.name}" by ${song.artist}\n\n`;
          
          // Add Spotify link
          message += `${song.spotifyUrl}\n\n`;
          
          // Add user reflection if present
          if (userReflection) {
            message += `Reflection:\n"${userReflection}"\n\n`;
          }
        } else {
          // Fallback if parsing fails
          if (reflectionText) {
            message += `\n\nMy reflection:\n"${reflectionText}"`;
          }
        }
      } else {
        // Non-Spotify dares
        if (reflectionText) {
          message += `\n\nMy reflection:\n"${reflectionText}"`;
        }
      }

      message += `\n\nJoin me in being creative every day with DareDrop!`;

      // No need to share album art for Spotify dares anymore
      let shareUrl: string | undefined = undefined;
      if (dareType !== "spotify") {
        // Choose best share media - Priority: Video → Image → Text only
        shareUrl = videoUri || imageUri || undefined;
      }

      // On Android, if we have an image or video, use expo-sharing to share the file
      if (Platform.OS === "android" && shareUrl) {
        // Check if sharing is available
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          // For local files, share directly
          if (shareUrl.startsWith("file://") || shareUrl.startsWith("content://")) {
            const mimeType = videoUri ? "video/mp4" : "image/png";
            await Sharing.shareAsync(shareUrl, {
              mimeType: mimeType,
              dialogTitle: "Share your dare!",
            });
            return;
          } else if (shareUrl.startsWith("http")) {
            // For remote URLs (Supabase or Spotify album art), share the message with URL
            await Share.share(
              {
                message: `${message}\n\n${shareUrl}`,
              },
              {
                dialogTitle: "Share your dare!",
              }
            );
            return;
          }
        }
      }

      // Build payload for standard Share API
      const sharePayload: any = { message };
  
      if (shareUrl) {
        sharePayload.url = shareUrl; // Works on both platforms
      }
  
      await Share.share(sharePayload, {
        dialogTitle: "Share your dare!",
      });
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
        videoUri: videoUri,
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

    // Check if same day (Today)
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) return "Today";

    // Check if yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isYesterday) return "Yesterday";

    // Format as MM/DD/YY for older dates
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);

    return `${month}/${day}/${year}`;
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

          {/* Content Display - Photo, Video, Drawing, or Text Reflection */}
          {dareType === "photo" && imageUri ? (
            <View style={styles.imageContainer}>
              <Text style={styles.sectionLabel}>Your Creation:</Text>
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
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.dareImage}
                    onLoadStart={() => {
                      if (imageUri?.startsWith("http://") || imageUri?.startsWith("https://")) {
                        setIsLoadingMedia(true);
                      }
                    }}
                    onLoad={() => setIsLoadingMedia(false)}
                    onError={() => {
                      setIsLoadingMedia(false);
                    }}
                  />
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
          ) : dareType === "video" ? (
            videoUri ? (
              <View style={styles.videoContainer}>
                <Text style={styles.sectionLabel}>Your Creation</Text>
                <View style={styles.videoWrapper}>
                  <Video
                    ref={videoRef}
                    source={{ uri: videoUri }}
                    style={styles.dareVideo}
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                    isLooping={false}
                    onLoadStart={() => setIsLoadingMedia(true)}
                    onReadyForDisplay={() => setIsLoadingMedia(false)}
                    onError={(error) => {
                      console.error("Video playback error:", error);
                      setVideoError("Failed to play video");
                      setIsLoadingMedia(false);
                    }}
                  />
                  {isLoadingMedia && (
                    <View style={styles.videoLoadingOverlay}>
                      <Image
                        source={require("@/assets/logo.png")}
                        style={styles.videoLoadingLogo}
                        resizeMode="contain"
                      />
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.pencilButton}
                    activeOpacity={0.7}
                    onPress={() => setShowEditModal(true)}
                  >
                    <Pencil color={Colors.primary[500]} size={18} />
                  </TouchableOpacity>
                </View>
                {videoError && (
                  <Text style={styles.errorText}>{videoError}</Text>
                )}
              </View>
            ) : videoError ? (
              <View style={styles.videoContainer}>
                <Text style={styles.sectionLabel}>Your Creation</Text>
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>
                    Unable to load video: {videoError}
                  </Text>
                </View>
              </View>
            ) : null
          ) : dareType === "drawing" && imageUri ? (
            <View style={styles.imageContainer}>
              <Text style={styles.sectionLabel}>Your Drawing:</Text>
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: imageUri }}
                  style={styles.dareImage}
                  onLoadStart={() => {
                    if (imageUri?.startsWith("http://") || imageUri?.startsWith("https://")) {
                      setIsLoadingMedia(true);
                    }
                  }}
                  onLoad={() => setIsLoadingMedia(false)}
                  onError={() => {
                    setIsLoadingMedia(false);
                  }}
                />
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
          ) : dareType === "spotify" && reflectionText ? (
            (() => {
              // Parse Spotify song from reflection text
              // Format: JSON string or JSON|REFLECTION|text
              const songData = reflectionText.includes("|REFLECTION|")
                ? reflectionText.split("|REFLECTION|")[0]
                : reflectionText;
              const userReflection = reflectionText.includes("|REFLECTION|")
                ? reflectionText.split("|REFLECTION|")[1]
                : null;
              const song = parseSpotifySong(songData);
              
              return song ? (
                <View style={styles.spotifyContainer}>
                  <Text style={styles.sectionLabel}>Your Song</Text>
                  <View style={styles.spotifyCard}>
                    {song.albumArt ? (
                      <Image
                        source={{ uri: song.albumArt }}
                        style={styles.spotifyAlbumArtLarge}
                      />
                    ) : (
                      <View style={[styles.spotifyAlbumArtLarge, styles.spotifyAlbumArtPlaceholder]}>
                        <Music size={64} color={Colors.primary[500]} />
                      </View>
                    )}
                    <Text style={styles.spotifySongNameLarge}>{song.name}</Text>
                    <Text style={styles.spotifyArtistNameLarge}>{song.artist}</Text>
                    <Text style={styles.spotifyAlbumNameLarge}>{song.album}</Text>
                    
                    <TouchableOpacity
                      style={styles.spotifyButton}
                      onPress={async () => {
                        try {
                          const canOpen = await Linking.canOpenURL(song.spotifyUrl);
                          if (canOpen) {
                            await Linking.openURL(song.spotifyUrl);
                          } else {
                            Alert.alert("Error", "Unable to open Spotify");
                          }
                        } catch (error) {
                          Alert.alert("Error", "Failed to open Spotify");
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="musical-notes" size={20} color={Colors.white} />
                      <Text style={styles.spotifyButtonText}>Open in Spotify</Text>
                    </TouchableOpacity>

                    {userReflection && (
                      <View style={styles.spotifyReflectionContainer}>
                        <Text style={styles.spotifyReflectionLabel}>Your Reflection:</Text>
                        <Text style={styles.spotifyReflectionText}>{userReflection}</Text>
                      </View>
                    )}

                    <TouchableOpacity
                      style={styles.pencilButtonSpotify}
                      activeOpacity={0.7}
                      onPress={() => setShowEditModal(true)}
                    >
                      <Pencil color={Colors.primary[500]} size={18} />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null;
            })()
          ) : (
            <View style={styles.noContentContainer}>
              <Text style={styles.noContentEmoji}>
                {(() => {
                  const type = dareType as "photo" | "video" | "drawing" | "text" | "spotify";
                  if (type === "photo") return "📸";
                  if (type === "video") return "🎥";
                  if (type === "drawing") return "🎨";
                  if (type === "spotify") return "🎵";
                  return "✍️";
                })()}
              </Text>
              <Text style={styles.noContentText}>
                {(() => {
                  const type = dareType as "photo" | "video" | "drawing" | "text" | "spotify";
                  if (type === "photo") return "No photo added for this dare";
                  if (type === "video") return "No video added for this dare";
                  if (type === "drawing") return "No drawing added for this dare";
                  if (type === "spotify") return "No song selected for this dare";
                  return "No reflection added for this dare";
                })()}
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
              Keep the creative streak going!{"\n"}Every dare brings out your
              unique creativity.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Loading Overlay */}
      <LoadingOverlay
        visible={isLoadingMedia}
        message={
          dareType === "video"
            ? "Loading video..."
            : dareType === "photo" || dareType === "drawing"
              ? "Loading image..."
              : undefined
        }
      />

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
    paddingTop: 0,
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
    fontSize: 30,
    fontFamily: Fonts.primary.regular,
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
    borderWidth: 2,
    borderColor: Colors.primary[500],
    ...Shadows.large,
  },
  videoContainer: {
    marginBottom: 24,
  },
  videoWrapper: {
    position: "relative",
  },
  dareVideo: {
    width: "100%",
    height: 350,
    borderRadius: BorderRadius.xl,
    borderWidth: 3,
    borderColor: Colors.primary[500],
    backgroundColor: "transparent",
    ...Shadows.large,
  },
  videoLoadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BorderRadius.xl,
  },
  videoLoadingLogo: {
    width: 150,
    height: 150,
    opacity: 0.8,
  },
  errorContainer: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: 24,
    borderWidth: 3,
    borderColor: Colors.secondary[500],
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  errorText: {
    fontSize: 16,
    fontFamily: Fonts.secondary.regular,
    color: Colors.secondary[500],
    textAlign: "center",
  },
  loadingContainer: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: 24,
    borderWidth: 3,
    borderColor: Colors.primary[500],
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: Fonts.secondary.regular,
    color: Colors.primary[500],
    textAlign: "center",
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
    borderWidth: 2,
    borderColor: Colors.primary[500],
    ...Shadows.small,
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
    borderWidth: 2,
    borderColor: Colors.primary[500],
  },
  messageText: {
    fontSize: 16,
    fontFamily: Fonts.primary.regular,
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
    borderColor: Colors.primary[500],
    marginBottom: 0,
  },
  modalOptionText: {
    fontSize: 18,
    fontFamily: Fonts.secondary.semiBold,
    color: Colors.white,
  },
  modalOptionTextDelete: {
    color: Colors.primary[500],
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
  // Spotify styles
  spotifyContainer: {
    marginBottom: 24,
  },
  spotifyCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: 24,
    borderWidth: 2,
    borderColor: Colors.primary[500],
    alignItems: "center",
    ...Shadows.large,
    position: "relative",
  },
  spotifyAlbumArtLarge: {
    width: 200,
    height: 200,
    borderRadius: BorderRadius.lg,
    marginBottom: 16,
    backgroundColor: Colors.gray[100],
  },
  spotifyAlbumArtPlaceholder: {
    backgroundColor: Colors.gray[100],
    alignItems: "center",
    justifyContent: "center",
  },
  spotifySongNameLarge: {
    fontSize: 24,
    fontFamily: Fonts.secondary.bold,
    color: Colors.text.dark,
    textAlign: "center",
    marginBottom: 8,
  },
  spotifyArtistNameLarge: {
    fontSize: 20,
    fontFamily: Fonts.secondary.semiBold,
    color: Colors.primary[500],
    textAlign: "center",
    marginBottom: 4,
  },
  spotifyAlbumNameLarge: {
    fontSize: 16,
    fontFamily: Fonts.secondary.regular,
    color: Colors.gray[500],
    textAlign: "center",
    marginBottom: 20,
  },
  spotifyButton: {
    backgroundColor: Colors.secondary[500],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: BorderRadius.xl,
    marginBottom: 20,
    ...Shadows.medium,
  },
  spotifyButtonText: {
    fontSize: 16,
    fontFamily: Fonts.secondary.semiBold,
    color: Colors.white,
  },
  spotifyReflectionContainer: {
    width: "100%",
    marginTop: 16,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  spotifyReflectionLabel: {
    fontSize: 18,
    fontFamily: Fonts.secondary.semiBold,
    color: Colors.primary[500],
    marginBottom: 8,
  },
  spotifyReflectionText: {
    fontSize: 16,
    fontFamily: Fonts.secondary.regular,
    color: Colors.text.dark,
    lineHeight: 24,
    fontStyle: "italic",
  },
  pencilButtonSpotify: {
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
});
