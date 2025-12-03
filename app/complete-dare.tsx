import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Sharing from "expo-sharing";
import { isVideoFile } from "@/lib/storage";
import { Video, ResizeMode } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import {
  Pencil,
  FileText,
  MessageCircle,
  Share2,
  Sparkles,
} from "lucide-react-native";
import TopRightButton from "@/components/TopRightButton";
import LoadingOverlay from "@/components/LoadingOverlay";
import { Colors, Fonts, BorderRadius, Shadows } from "@/constants/theme";
import { getDareByText, getTextDareIcon, getVideoDareIcon } from "@/constants/dares";
import { useDare } from "@/contexts/DareContext";
import DrawingCanvas, { DrawingCanvasRef } from "@/components/DrawingCanvas";

export default function CompleteDare() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const dare = params.dare as string;
  const alreadyCompleted = params.completed === "true";
  const existingImage = params.imageUri as string | undefined;
  const existingVideo = params.videoUri as string | undefined;
  const existingReflection = params.reflectionText as string | undefined;

  const {
    markDareComplete,
    saveDraft,
    deleteDare,
    setHighlightedDare,
    getDareReflection,
    getDareDraft,
    getDareVideo,
    getDareImage,
  } = useDare();

  // Get dare type from constants
  const dareInfo = getDareByText(dare);
  const dareType = dareInfo?.type || "photo";
  const placeholder = dareInfo?.placeholder || "Share your thoughts...";

  const [selectedImage, setSelectedImage] = useState<string | null>(
    existingImage || null
  );
  const [selectedVideo, setSelectedVideo] = useState<string | null>(
    existingVideo || null
  );
  const [reflectionText, setReflectionText] = useState<string>(
    existingReflection || ""
  );
  const [isCompleted, setIsCompleted] = useState(alreadyCompleted);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [drawingImage, setDrawingImage] = useState<string | null>(
    dareType === "drawing" ? existingImage || null : null
  );
  const [isDrawingActive, setIsDrawingActive] = useState(false);
  const drawingCanvasRef = useRef<DrawingCanvasRef>(null);

  // If already completed, show congrats screen immediately
  useEffect(() => {
    if (alreadyCompleted) {
      if (existingImage) {
        if (dareType === "drawing") {
          setDrawingImage(existingImage);
        } else {
          setSelectedImage(existingImage);
        }
      }
      if (existingVideo) {
        setSelectedVideo(existingVideo);
      }
      if (existingReflection) {
        setReflectionText(existingReflection);
      }
      setIsCompleted(true);
    }
  }, [alreadyCompleted, existingImage, existingVideo, existingReflection, dareType]);

  // Load existing video if editing
  useEffect(() => {
    if (dareType === "video" && !existingVideo) {
      const savedVideo = getDareVideo(dare);
      if (savedVideo) {
        setSelectedVideo(savedVideo);
      }
    }
  }, [dare, dareType]);

  // Load existing reflection or draft if editing
  useEffect(() => {
    if (dareType === "text" && !existingReflection) {
      const savedReflection = getDareReflection(dare);
      if (savedReflection) {
        setReflectionText(savedReflection);
      } else {
        // Load draft if no completed reflection
        const savedDraft = getDareDraft(dare);
        if (savedDraft) {
          setReflectionText(savedDraft);
        }
      }
    }
  }, [dare, dareType]);

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "We need camera permissions to take a photo!"
      );
      return false;
    }
    return true;
  };

  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "We need photo library permissions to choose a photo!"
      );
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const chooseFromLibrary = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const recordVideo = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
      videoMaxDuration: 60, // 60 seconds max
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedVideo(result.assets[0].uri);
    }
  };

  const chooseVideoFromLibrary = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedVideo(result.assets[0].uri);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      if (dareType === "photo" && selectedImage) {
        await markDareComplete(dare, { imageUri: selectedImage });
        setIsCompleted(true);
        // Loading will be hidden when component re-renders with congrats screen
      } else if (dareType === "video" && selectedVideo) {
        await markDareComplete(dare, { videoUri: selectedVideo });
        setIsCompleted(true);
        // Loading will be hidden when component re-renders with congrats screen
      } else if (dareType === "text" && reflectionText.trim()) {
        await markDareComplete(dare, { reflectionText: reflectionText.trim() });
        setIsCompleted(true);
        // Loading will be hidden when component re-renders with congrats screen
      } else if (dareType === "drawing") {
        // Export drawing and save it
        const exportedImage = await drawingCanvasRef.current?.exportDrawing();
        if (exportedImage) {
          setDrawingImage(exportedImage);
          await markDareComplete(dare, { imageUri: exportedImage });
          setIsCompleted(true);
          // Loading will be hidden when component re-renders with congrats screen
        } else {
          setIsCompleting(false);
          Alert.alert(
            "Error",
            "Unable to save your drawing. Please try again."
          );
        }
      }
    } catch (error) {
      console.error("Error completing dare:", error);
      setIsCompleting(false);
      Alert.alert("Error", "Failed to complete dare. Please try again.");
    }
  };

  const handleRetake = () => {
    setSelectedImage(null);
    setSelectedVideo(null);
  };

  const handleRedraw = () => {
    setDrawingImage(null);
    drawingCanvasRef.current?.clearDrawing();
  };

  const handleClearText = () => {
    setReflectionText("");
  };

  const handleSaveProgress = async () => {
    if (reflectionText.trim()) {
      await saveDraft(dare, reflectionText.trim());
      Alert.alert(
        "Progress Saved!",
        "Your draft has been saved. Come back anytime to finish.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    }
  };

  const handleGoHome = () => {
    // If dare is completed, highlight it when navigating home
    if (isCompleted && dare) {
      setHighlightedDare(dare);
    }
    router.back();
  };

  const handleShare = async () => {
    try {
      let message = `I completed a DareDrop dare! 🎨\n\n"${dare}"`;
  
      // Include reflection text if present
      const reflection = reflectionText || getDareReflection(dare);
      if (reflection) {
        message += `\n\nMy reflection:\n"${reflection}"`;
      }
  
      message += `\n\nJoin me in being creative every day with DareDrop!`;
  
      // Determine media (VIDEO → IMAGE → NOTHING)
      const videoUriToShare =
        selectedVideo || (dareType === "video" ? getDareVideo(dare) : undefined);
  
      const imageUriToShare =
        selectedImage ||
        drawingImage ||
        (dareType === "photo" || dareType === "drawing" ? getDareImage(dare) : undefined);

      // Priority: Video → Image (photo or drawing) → Text only
      const shareUrl: string | undefined =
        videoUriToShare || imageUriToShare || undefined;

      // On Android, if we have an image or video, use expo-sharing to share the file
      if (Platform.OS === "android" && shareUrl) {
        // Check if sharing is available
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          // For local files, share directly
          if (shareUrl.startsWith("file://") || shareUrl.startsWith("content://")) {
            const mimeType = videoUriToShare ? "video/mp4" : "image/png";
            await Sharing.shareAsync(shareUrl, {
              mimeType: mimeType,
              dialogTitle: "Share your dare!",
            });
            return;
          } else if (shareUrl.startsWith("http")) {
            // For remote URLs (Supabase), share the message with URL
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
  
      // Add attachment if available (works on iOS, fallback for Android)
      if (shareUrl) {
        sharePayload.url = shareUrl;
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
    setIsCompleted(false);
    // Keep the image/drawing/reflection so user can see it and decide to retake/reedit or keep it
    if (dareType === "drawing" && drawingImage) {
      // Keep drawing image for preview, but allow redraw
    }
  };

  const handleDeleteDare = () => {
    setShowEditModal(false);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDeletion = () => {
    deleteDare(dare);
    setSelectedImage(null);
    setSelectedVideo(null);
    setReflectionText("");
    setIsCompleted(false);
    setShowDeleteConfirmation(false);
    setShowDeleteSuccess(true);

    // Navigate home after 1.5 seconds
    setTimeout(() => {
      router.back();
    }, 1500);
  };

  const canComplete =
    dareType === "photo"
      ? !!selectedImage
      : dareType === "video"
        ? !!selectedVideo
        : reflectionText.trim().length > 0;

  if (isCompleted) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.congratsContainer}>
          <TopRightButton style={styles.homeButton} onPress={handleGoHome}>
            <Ionicons name="home" size={24} color={Colors.primary[500]} />
          </TopRightButton>

          <View style={styles.congratsCard}>
            <Text style={styles.congratsTitle}>CONGRATS</Text>
            <Text style={styles.congratsSubtitle}>
              on being creative, one day{"\n"}at a time!
            </Text>

            {/* Show thumbnail for photo dares */}
            {dareType === "photo" && selectedImage && (
              <View style={styles.thumbnailContainer}>
                {isVideoFile(selectedImage) ? (
                  <Video
                    source={{ uri: selectedImage }}
                    style={styles.thumbnail}
                    useNativeControls
                    resizeMode={ResizeMode.COVER}
                    isLooping
                  />
                ) : (
                  <Image
                    source={{ uri: selectedImage }}
                    style={styles.thumbnail}
                  />
                )}
                <TouchableOpacity
                  style={styles.pencilButton}
                  activeOpacity={0.7}
                  onPress={() => setShowEditModal(true)}
                >
                  <Pencil color={Colors.primary[500]} size={16} />
                </TouchableOpacity>
              </View>
            )}

            {/* Show thumbnail for drawing dares */}
            {dareType === "drawing" && drawingImage && (
              <View style={styles.thumbnailContainer}>
                <Image
                  source={{ uri: drawingImage }}
                  style={styles.thumbnail}
                />
                <TouchableOpacity
                  style={styles.pencilButton}
                  activeOpacity={0.7}
                  onPress={() => setShowEditModal(true)}
                >
                  <Pencil color={Colors.primary[500]} size={16} />
                </TouchableOpacity>
              </View>
            )}

            {/* Show icon for text dares */}
            {dareType === "text" && reflectionText && (
              <View style={styles.thumbnailContainer}>
                {getTextDareIcon(dare) ? (
                  <Image
                    source={getTextDareIcon(dare)!}
                    style={styles.thumbnail}
                  />
                ) : (
                  <View style={styles.textDareIcon}>
                    <MessageCircle
                      color={Colors.primary[500]}
                      size={48}
                      fill={Colors.accent.yellow}
                    />
                  </View>
                )}
                <TouchableOpacity
                  style={styles.pencilButton}
                  activeOpacity={0.7}
                  onPress={() => setShowEditModal(true)}
                >
                  <Pencil color={Colors.primary[500]} size={16} />
                </TouchableOpacity>
              </View>
            )}

            {/* Show icon for video dares */}
            {dareType === "video" && (
              <View style={styles.thumbnailContainer}>
                {getVideoDareIcon(dare) ? (
                  <Image
                    source={getVideoDareIcon(dare)!}
                    style={styles.thumbnail}
                  />
                ) : selectedVideo ? (
                  <View style={styles.videoIconContainer}>
                    <Ionicons name="videocam" size={48} color={Colors.primary[500]} />
                  </View>
                ) : null}
                <TouchableOpacity
                  style={styles.pencilButton}
                  activeOpacity={0.7}
                  onPress={() => setShowEditModal(true)}
                >
                  <Pencil color={Colors.primary[500]} size={16} />
                </TouchableOpacity>
              </View>
            )}

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
                      style={[
                        styles.modalOptionText,
                        styles.modalOptionTextDelete,
                      ]}
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
                  <Text style={styles.confirmationTitle}>
                    Delete this dare?
                  </Text>
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
                      style={[
                        styles.modalOptionText,
                        styles.modalOptionTextCancel,
                      ]}
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
                  <Text style={styles.successTitle}>
                    Dare successfully deleted
                  </Text>
                </View>
              </View>
            </Modal>

            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShare}
              activeOpacity={0.8}
            >
              <Share2 size={20} color={Colors.white} />
              <Text style={styles.shareButtonText}>Share Your Dare</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sparkNote}
              onPress={() => router.push("/your-dares")}
              activeOpacity={0.8}
            >
              <Sparkles size={20} color={Colors.white} />
              <Text style={styles.sparkNoteText}>View past sparks</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={!isDrawingActive}
          nestedScrollEnabled={false}
        >
          <View style={styles.container}>
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>

            {/* Home Button */}
            <TopRightButton style={styles.homeButton} onPress={handleGoHome}>
              <Ionicons name="home" size={24} color={Colors.primary[500]} />
            </TopRightButton>

            {/* Dare Card */}
            <View style={styles.dareCard}>
              <Text style={styles.dareTitle}>Your Dare Today:</Text>
              <Text style={styles.dareText}>{dare}</Text>
            </View>

            {/* Photo Dare Flow */}
            {dareType === "photo" && (
              <>
                {selectedImage ? (
                  <View style={styles.imagePreview}>
                    {isVideoFile(selectedImage) ? (
                      <Video
                        source={{ uri: selectedImage }}
                        style={styles.previewImage}
                        useNativeControls
                        resizeMode={ResizeMode.CONTAIN}
                        isLooping
                      />
                    ) : (
                      <Image
                        source={{ uri: selectedImage }}
                        style={styles.previewImage}
                      />
                    )}

                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.completeButton}
                        onPress={handleComplete}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.buttonText}>Complete</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.retakeButton}
                        onPress={handleRetake}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.buttonTextDark}>
                          {selectedImage.includes("camera")
                            ? "Retake"
                            : "Reselect"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.photoOptions}>
                    <TouchableOpacity
                      style={styles.photoButton}
                      onPress={takePhoto}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.photoButtonText}>Take a photo!</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.photoButton}
                      onPress={chooseFromLibrary}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.photoButtonText}>
                        Choose from{"\n"}Camera Roll!
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}

            {/* Video Dare Flow */}
            {dareType === "video" && (
              <>
                {selectedVideo ? (
                  <View style={styles.imagePreview}>
                    <Text style={styles.videoPreviewText}>Video Selected</Text>
                    <Text style={styles.videoPreviewSubtext}>
                      Ready to complete your dare!
                    </Text>

                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.completeButton}
                        onPress={handleComplete}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.buttonText}>Complete</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.retakeButton}
                        onPress={handleRetake}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.buttonTextDark}>
                          {selectedVideo.includes("camera")
                            ? "Retake"
                            : "Reselect"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.photoOptions}>
                    <TouchableOpacity
                      style={styles.photoButton}
                      onPress={recordVideo}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.photoButtonText}>Record a video!</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.photoButton}
                      onPress={chooseVideoFromLibrary}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.photoButtonText}>
                        Choose from{"\n"}Camera Roll!
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}

            {/* Drawing Dare Flow */}
            {dareType === "drawing" && (
              <>
                {drawingImage ? (
                  <View style={styles.imagePreview}>
                    <Image
                      source={{ uri: drawingImage }}
                      style={styles.previewImage}
                    />

                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.completeButton}
                        onPress={handleComplete}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.buttonText}>Complete</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.retakeButton}
                        onPress={handleRedraw}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.buttonTextDark}>Redraw</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.drawingContainer}>
                    <DrawingCanvas
                      ref={drawingCanvasRef}
                      onDrawingComplete={(imageUri) => {
                        setDrawingImage(imageUri);
                      }}
                      onDrawingStart={() => setIsDrawingActive(true)}
                      onDrawingEnd={() => setIsDrawingActive(false)}
                    />
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.completeButton}
                        onPress={handleComplete}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.buttonText}>complete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </>
            )}

            {/* Text Dare Flow */}
            {dareType === "text" && (
              <View style={styles.textInputContainer}>
                <Text style={styles.reflectionLabel}>Your Reflection:</Text>
                <TextInput
                  style={styles.textInput}
                  multiline
                  placeholder={placeholder}
                  placeholderTextColor={Colors.gray[400]}
                  value={reflectionText}
                  onChangeText={setReflectionText}
                  textAlignVertical="top"
                />

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[
                      styles.completeButton,
                      !reflectionText.trim() && styles.completeButtonDisabled,
                    ]}
                    onPress={handleComplete}
                    activeOpacity={0.8}
                    disabled={!reflectionText.trim()}
                  >
                    <Text style={styles.buttonText}>Complete</Text>
                  </TouchableOpacity>

                  {reflectionText.length > 0 && (
                    <>
                      <TouchableOpacity
                        style={styles.saveProgressButton}
                        onPress={handleSaveProgress}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.saveProgressText}>
                          Save Progress
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.clearButton}
                        onPress={handleClearText}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.clearButtonText}>Clear</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Loading Overlay */}
      <LoadingOverlay
        visible={isCompleting}
        message={
          dareType === "video"
            ? "Uploading video..."
            : dareType === "photo"
              ? "Uploading image..."
              : dareType === "drawing"
                ? "Saving drawing..."
                : "Completing dare..."
        }
      />
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
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  congratsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    fontSize: 32,
    color: Colors.primary[500],
  },
  homeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 10,
  },
  dareCard: {
    backgroundColor: Colors.accent.yellow,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.primary[500],
    padding: 24,
    marginTop: 100,
    marginBottom: 20, // Reduced from 50 to decrease space below "Your Dare Today" box
  },
  dareTitle: {
    fontSize: 24,
    fontFamily: Fonts.primary.regular,
    color: Colors.primary[500],
    marginBottom: 12,
  },
  dareText: {
    fontSize: 18,
    fontFamily: Fonts.secondary.regular,
    color: Colors.primary[500],
    lineHeight: 24,
  },
  photoOptions: {
    gap: 20,
    marginTop: 30,
    alignItems: "center",
    ...Shadows.small,
  },
  photoButton: {
    backgroundColor: Colors.secondary[500],
    paddingVertical: 32,
    paddingHorizontal: 48,
    borderRadius: BorderRadius.xl,
    width: "90%",
    alignItems: "center",
    ...Shadows.medium,
  },
  photoButtonText: {
    fontSize: 24,
    fontFamily: Fonts.secondary.medium,
    color: Colors.white,
    textAlign: "center",
    lineHeight: 32,
  },
  imagePreview: {
    alignItems: "center",
    gap: 20,
  },
  previewImage: {
    width: "100%",
    height: 300,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.primary[500],
    ...Shadows.medium,
  },
  actionButtons: {
    gap: 12,
    width: "100%",
    alignItems: "center",
  },
  completeButton: {
    backgroundColor: Colors.secondary[500],
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: Colors.secondary[500],
    width: "80%",
    alignItems: "center",
  },
  retakeButton: {
    backgroundColor: "transparent",
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: Colors.secondary[500],
    width: "80%",
    alignItems: "center",
  },
  saveProgressButton: {
    backgroundColor: Colors.accent.yellow,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: BorderRadius.xl,
    width: "80%",
    alignItems: "center",
  },
  saveProgressText: {
    fontSize: 16,
    fontFamily: Fonts.secondary.semiBold,
    color: Colors.primary[500],
  },
  clearButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  clearButtonText: {
    fontSize: 14,
    fontFamily: Fonts.secondary.medium,
    color: Colors.gray[500],
  },
  buttonText: {
    fontSize: 18,
    fontFamily: Fonts.secondary.semiBold,
    color: Colors.white,
  },
  buttonTextDark: {
    fontSize: 18,
    fontFamily: Fonts.secondary.semiBold,
    color: Colors.secondary[500],
  },
  congratsCard: {
    backgroundColor: Colors.accent.yellow,
    borderColor: Colors.primary[500],
    borderWidth: 2,
    borderRadius: BorderRadius.xxl,
    padding: 32,
    width: "90%",
    maxWidth: 400,
    marginBottom: 80,
    alignItems: "center",
    ...Shadows.large,
  },
  congratsTitle: {
    fontSize: 45,
    fontFamily: Fonts.primary.regular,
    color: Colors.primary[500],
    marginBottom: 8,
  },
  congratsSubtitle: {
    fontSize: 25,
    fontFamily: Fonts.primary.regular,
    color: Colors.primary[500],
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  thumbnailContainer: {
    position: "relative",
    marginBottom: 20,
  },
  thumbnail: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.primary[500],
  },
  textDareIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.white,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  videoIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.white,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  videoPreviewText: {
    fontSize: 20,
    fontFamily: Fonts.secondary.semiBold,
    color: Colors.primary[500],
    textAlign: "center",
    marginBottom: 8,
  },
  videoPreviewSubtext: {
    fontSize: 16,
    fontFamily: Fonts.secondary.regular,
    color: Colors.gray[600],
    textAlign: "center",
    marginBottom: 20,
  },
  pencilButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.primary[500],
    ...Shadows.small,
  },
  pencilIcon: {
    fontSize: 16,
  },
  sparkNote: {
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
  sparkNoteText: {
    fontSize: 18,
    fontFamily: Fonts.secondary.semiBold,
    color: Colors.white,
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
  keyboardView: {
    flex: 1,
  },
  textInputContainer: {
    flex: 1,
    gap: 16,
  },
  reflectionLabel: {
    fontSize: 20,
    fontFamily: Fonts.secondary.semiBold,
    color: Colors.primary[500],
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.primary[500],
    padding: 16,
    fontSize: 16,
    fontFamily: Fonts.secondary.regular,
    color: Colors.text.dark,
    minHeight: 200,
    ...Shadows.medium,
  },
  reflectionPreviewContainer: {
    position: "relative",
    marginBottom: 20,
    alignItems: "center",
    gap: 12,
  },
  reflectionPreviewText: {
    fontSize: 16,
    fontFamily: Fonts.secondary.regular,
    color: Colors.white,
    textAlign: "center",
    paddingHorizontal: 20,
    maxWidth: 300,
  },
  completeButtonDisabled: {
    opacity: 0.5,
  },
  drawingContainer: {
    width: "100%",
    alignItems: "center",
    gap: 20,
    marginTop: 10, // Reduced from 20 to decrease space above drawing container (Undo/Clear buttons)
  },
});
