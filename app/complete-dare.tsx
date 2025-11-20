import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Colors, Fonts, BorderRadius, Shadows } from "@/constants/theme";
import { useDare } from "@/contexts/DareContext";

export default function CompleteDare() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const dare = params.dare as string;
  const alreadyCompleted = params.completed === "true";
  const existingImage = params.imageUri as string | undefined;

  const { markDareComplete } = useDare();

  const [selectedImage, setSelectedImage] = useState<string | null>(
    existingImage || null
  );
  const [isCompleted, setIsCompleted] = useState(alreadyCompleted);

  // If already completed, show congrats screen immediately
  useEffect(() => {
    if (alreadyCompleted && existingImage) {
      setSelectedImage(existingImage);
      setIsCompleted(true);
    }
  }, [alreadyCompleted, existingImage]);

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

  const handleComplete = () => {
    if (selectedImage) {
      markDareComplete(dare, selectedImage);
    }
    setIsCompleted(true);
  };

  const handleRetake = () => {
    setSelectedImage(null);
  };

  const handleGoHome = () => {
    router.back();
  };

  if (isCompleted) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.homeButton}
            onPress={handleGoHome}
            activeOpacity={0.7}
          >
            <Text style={styles.homeIcon}>🏠</Text>
          </TouchableOpacity>

          <View style={styles.congratsCard}>
            <Text style={styles.congratsTitle}>CONGRATS</Text>
            <Text style={styles.congratsSubtitle}>
              on being creative, one day{"\n"}at a time!
            </Text>

            {selectedImage && (
              <Image source={{ uri: selectedImage }} style={styles.thumbnail} />
            )}

            <View style={styles.sparkNote}>
              <Text style={styles.sparkNoteText}>
                COMING SOON: See your past{"\n"}creative sparks!
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
          <TouchableOpacity
            style={styles.homeButton}
            onPress={handleGoHome}
            activeOpacity={0.7}
          >
            <Text style={styles.homeIcon}>🏠</Text>
          </TouchableOpacity>

          {/* Dare Card */}
          <View style={styles.dareCard}>
            <Text style={styles.dareTitle}>Your Dare Today:</Text>
            <Text style={styles.dareText}>{dare}</Text>
          </View>

          {/* Selected Image or Action Buttons */}
          {selectedImage ? (
            <View style={styles.imagePreview}>
              <Image
                source={{ uri: selectedImage }}
                style={styles.previewImage}
              />

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={handleComplete}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>complete</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.retakeButton}
                  onPress={handleRetake}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonTextDark}>
                    {selectedImage.includes("camera") ? "retake" : "reselect"}
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
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
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
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  homeIcon: {
    fontSize: 28,
  },
  dareCard: {
    backgroundColor: Colors.accent.green,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.primary[500],
    padding: 24,
    marginTop: 60,
    marginBottom: 30,
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
    color: Colors.text.dark,
    lineHeight: 24,
  },
  photoOptions: {
    gap: 20,
    marginTop: 30,
    alignItems: "center",
    ...Shadows.small,
  },
  photoButton: {
    backgroundColor: Colors.secondary[400],
    paddingVertical: 32,
    paddingHorizontal: 48,
    borderRadius: BorderRadius.xl,
    width: "90%",
    alignItems: "center",
    ...Shadows.medium,
  },
  photoButtonText: {
    fontSize: 24,
    fontFamily: Fonts.primary.regular,
    color: Colors.accent.yellow,
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
    backgroundColor: Colors.secondary[300],
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
    borderColor: Colors.secondary[400],
    width: "80%",
    alignItems: "center",
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
    backgroundColor: Colors.secondary[300],
    borderRadius: BorderRadius.xxl,
    padding: 32,
    marginTop: 80,
    alignItems: "center",
    ...Shadows.large,
  },
  congratsTitle: {
    fontSize: 36,
    fontFamily: Fonts.secondary.bold,
    color: Colors.white,
    marginBottom: 8,
  },
  congratsSubtitle: {
    fontSize: 18,
    fontFamily: Fonts.secondary.regular,
    color: Colors.white,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  thumbnail: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.white,
    marginBottom: 20,
  },
  sparkNote: {
    backgroundColor: Colors.accent.yellow,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: BorderRadius.lg,
  },
  sparkNoteText: {
    fontSize: 16,
    fontFamily: Fonts.secondary.medium,
    color: Colors.primary[500],
    textAlign: "center",
    lineHeight: 22,
  },
});
