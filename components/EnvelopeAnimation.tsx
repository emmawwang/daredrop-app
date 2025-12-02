import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors, Shadows, BorderRadius, Fonts } from "@/constants/theme";
import { useDare } from "@/contexts/DareContext";

interface EnvelopeAnimationProps {
  dare: string;
  onComplete?: () => void;
}

const { width } = Dimensions.get("window");
const ENVELOPE_WIDTH = width * 0.85;
const ENVELOPE_HEIGHT = 240;
const CARD_WIDTH = ENVELOPE_WIDTH - 30;
const CARD_HEIGHT = 200;

export default function EnvelopeAnimation({
  dare,
  onComplete,
}: EnvelopeAnimationProps) {
  const router = useRouter();
  const { isDareCompleted, getDareImage } = useDare();
  const [isOpen, setIsOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const isCompleted = isDareCompleted(dare);
  const dareImage = getDareImage(dare);

  // Animated values for animations
  const flapRotation = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const sealScale = useRef(new Animated.Value(1)).current;
  const envelopeOpacity = useRef(new Animated.Value(1)).current;

  // Reset envelope when component mounts or when dare changes
  useEffect(() => {
    setIsOpen(false);
    flapRotation.setValue(0);
    cardTranslateY.setValue(0);
    cardOpacity.setValue(0);
    sealScale.setValue(1);
    envelopeOpacity.setValue(1);
  }, [dare, resetKey]);

  const openEnvelope = () => {
    if (isOpen) return;
    setIsOpen(true);

    // Seal shrinks first
    Animated.timing(sealScale, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Flap rotates open, then closes after card slides out
    Animated.sequence([
      Animated.delay(200),
      Animated.timing(flapRotation, {
        toValue: 180,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.delay(400),
      Animated.timing(flapRotation, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Envelope fades then returns to full opacity
    Animated.sequence([
      Animated.delay(600),
      Animated.timing(envelopeOpacity, {
        toValue: 0.3,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.delay(400),
      Animated.timing(envelopeOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Card slides out and fades in
    Animated.sequence([
      Animated.delay(600),
      Animated.spring(cardTranslateY, {
        toValue: -70,
        damping: 15,
        stiffness: 100,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.sequence([
      Animated.delay(600),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Seal comes back after flap closes
    Animated.sequence([
      Animated.delay(2200),
      Animated.timing(sealScale, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleComplete = () => {
    if (isCompleted) {
      // If already completed, go to dare detail screen
      router.push({
        pathname: "/dare-detail",
        params: { dare },
      });
    } else {
      // Navigate to complete dare screen to capture photo
      router.push({
        pathname: "/complete-dare",
        params: { dare },
      });
    }
  };

  // Animated styles
  const flapAnimatedStyle = {
    transform: [
      { perspective: 1000 },
      {
        rotateX: flapRotation.interpolate({
          inputRange: [0, 180],
          outputRange: ["0deg", "180deg"],
        }),
      },
    ],
    opacity: envelopeOpacity,
  };

  const cardAnimatedStyle = {
    transform: [{ translateY: cardTranslateY }],
    opacity: cardOpacity,
  };

  const sealAnimatedStyle = {
    transform: [{ scale: sealScale }],
  };

  const envelopeAnimatedStyle = {
    opacity: envelopeOpacity,
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={openEnvelope}
        activeOpacity={0.9}
        disabled={isOpen}
      >
        <View style={styles.envelopeWrapper}>
          {/* Envelope Back Layer */}
          <Animated.View style={[styles.envelopeBack, envelopeAnimatedStyle]} />

          {/* Envelope Front Layer with fold lines */}
          <Animated.View style={[styles.envelopeFront, envelopeAnimatedStyle]}>
            {/* Diagonal fold lines */}
            <View style={styles.foldLineLeft} />
            <View style={styles.foldLineRight} />
          </Animated.View>

          {/* Envelope Flap (rotates open) */}
          <Animated.View style={[styles.flap, flapAnimatedStyle]}>
            <View style={styles.flapTriangle} />
          </Animated.View>

          {/* Logo Seal */}
          {!isOpen && (
            <Animated.View style={[styles.sealContainer, sealAnimatedStyle]}>
              <Image
                source={require("@/assets/logo.png")}
                style={styles.sealImage}
                resizeMode="contain"
              />
            </Animated.View>
          )}

          {/* Dare Card (slides out) */}
          <Animated.View
            style={[styles.card, cardAnimatedStyle]}
            pointerEvents={isOpen ? "auto" : "none"}
          >
            <Text style={styles.dareText}>{dare}</Text>

            {isCompleted && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedBadgeText}>✓ Completed!</Text>
              </View>
            )}

            {isOpen && (
              <TouchableOpacity
                style={[
                  styles.completeButton,
                  isCompleted && styles.viewDareButton,
                ]}
                onPress={handleComplete}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.completeButtonText,
                    isCompleted && styles.viewDareButtonText,
                  ]}
                >
                  {isCompleted ? "View dare" : "Complete"}
                </Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    marginBottom: 5,
  },
  envelopeWrapper: {
    position: "relative",
    width: ENVELOPE_WIDTH,
    height: ENVELOPE_HEIGHT + 180,
    justifyContent: "center",
    alignItems: "center",
  },
  // Back layer of envelope
  envelopeBack: {
    position: "absolute",
    width: ENVELOPE_WIDTH,
    height: ENVELOPE_HEIGHT,
    backgroundColor: Colors.envelope,
    borderWidth: 3,
    borderColor: Colors.envelopeOutline,
    borderRadius: BorderRadius.md,
    top: 0,
    zIndex: 1,
    ...Shadows.medium,
  },
  // Front layer with triangular sides
  envelopeFront: {
    position: "absolute",
    width: ENVELOPE_WIDTH,
    height: ENVELOPE_HEIGHT,
    top: 0,
    zIndex: 2,
  },
  foldLineLeft: {
    position: "absolute",
    left: 3,
    bottom: ENVELOPE_HEIGHT / 2,
    width: Math.sqrt(
      Math.pow(ENVELOPE_WIDTH / 2, 2) + Math.pow(ENVELOPE_HEIGHT / 2, 2)
    ),
    height: 2.5,
    backgroundColor: Colors.envelopeOutline,
    transform: [
      {
        rotate: `${
          -Math.atan(ENVELOPE_HEIGHT / 2 / (ENVELOPE_WIDTH / 2)) *
          (180 / Math.PI)
        }deg`,
      },
    ],
    transformOrigin: "left center",
  },
  foldLineRight: {
    position: "absolute",
    right: 3,
    bottom: ENVELOPE_HEIGHT / 2,
    width: Math.sqrt(
      Math.pow(ENVELOPE_WIDTH / 2, 2) + Math.pow(ENVELOPE_HEIGHT / 2, 2)
    ),
    height: 2.5,
    backgroundColor: Colors.envelopeOutline,
    transform: [
      {
        rotate: `${
          Math.atan(ENVELOPE_HEIGHT / 2 / (ENVELOPE_WIDTH / 2)) *
          (180 / Math.PI)
        }deg`,
      },
    ],
    transformOrigin: "right center",
  },
  // Top flap that rotates
  flap: {
    position: "absolute",
    top: 0,
    left: 0,
    width: ENVELOPE_WIDTH,
    height: ENVELOPE_HEIGHT * 0.5,
    transformOrigin: "top center",
    zIndex: 3,
  },
  flapTriangle: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    // Create triangle shape with borders
    borderLeftWidth: ENVELOPE_WIDTH / 2 + 1.5,
    borderRightWidth: ENVELOPE_WIDTH / 2 + 1.5,
    borderTopWidth: ENVELOPE_HEIGHT * 0.5,
    borderBottomWidth: 0,
    borderLeftColor: Colors.envelopeOutline,
    borderRightColor: Colors.envelopeOutline,
    borderTopColor: Colors.envelope,
    borderBottomColor: "transparent",
    borderStyle: "solid",
  },
  // Logo seal
  sealContainer: {
    position: "absolute",
    top: ENVELOPE_HEIGHT * 0.3,
    zIndex: 10,
    alignItems: "center",
    justifyContent: "center",
    width: 110,
    height: 110,
  },
  sealImage: {
    width: "100%",
    height: "100%",
  },
  // Dare card that slides out
  card: {
    position: "absolute",
    backgroundColor: Colors.accent.yellow,
    width: CARD_WIDTH,
    minHeight: CARD_HEIGHT,
    top: ENVELOPE_HEIGHT * 0.38,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.primary[500],
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 4,
    ...Shadows.large,
  },
  dareText: {
    fontSize: 20,
    fontFamily: Fonts.secondary.regular,
    color: Colors.primary[500],
    textAlign: "center",
    lineHeight: 28,
  },
  completedBadge: {
    marginTop: 12,
    alignSelf: "flex-end",
  },
  completedBadgeText: {
    fontSize: 14,
    fontFamily: Fonts.secondary.medium,
    color: Colors.secondary[500],
    fontStyle: "italic",
  },
  completeButton: {
    marginTop: 16,
    backgroundColor: Colors.primary[500],
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: BorderRadius.md,
    alignSelf: "center",
    ...Shadows.medium,
  },
  viewDareButton: {
    backgroundColor: Colors.secondary[500],
  },
  completeButtonText: {
    fontSize: 16,
    fontFamily: Fonts.secondary.semiBold,
    color: Colors.white,
  },
  viewDareButtonText: {
    color: Colors.white,
  },
});
