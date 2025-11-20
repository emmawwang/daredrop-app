import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
} from "react-native-reanimated";
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

  // Shared values for animations
  const flapRotation = useSharedValue(0);
  const cardTranslateY = useSharedValue(0);
  const cardOpacity = useSharedValue(0);
  const sealScale = useSharedValue(1);
  const envelopeOpacity = useSharedValue(1);

  // Reset envelope when component mounts or when dare changes
  useEffect(() => {
    setIsOpen(false);
    flapRotation.value = 0;
    cardTranslateY.value = 0;
    cardOpacity.value = 0;
    sealScale.value = 1;
    envelopeOpacity.value = 1;
  }, [dare, resetKey]);

  const openEnvelope = () => {
    if (isOpen) return;
    setIsOpen(true);

    // Seal shrinks first
    sealScale.value = withTiming(0, {
      duration: 300,
      easing: Easing.ease,
    });

    // Flap rotates open, then closes after card slides out
    flapRotation.value = withDelay(
      200,
      withSequence(
        // Open the flap
        withTiming(180, {
          duration: 800,
          easing: Easing.ease,
        }),
        // Keep it open briefly while card slides
        withDelay(400, withTiming(180, { duration: 0 })),
        // Close the flap back
        withTiming(0, {
          duration: 600,
          easing: Easing.ease,
        })
      )
    );

    // Envelope fades then returns to full opacity
    envelopeOpacity.value = withDelay(
      600,
      withSequence(
        withTiming(0.3, {
          duration: 400,
        }),
        withDelay(400, withTiming(0.3, { duration: 0 })),
        withTiming(1, {
          duration: 400,
        })
      )
    );

    // Card slides out and fades in
    cardTranslateY.value = withDelay(
      600,
      withSpring(-70, {
        damping: 15,
        stiffness: 100,
      })
    );

    cardOpacity.value = withDelay(
      600,
      withTiming(1, {
        duration: 600,
      })
    );

    // Seal comes back after flap closes
    sealScale.value = withSequence(
      withTiming(0, {
        duration: 300,
        easing: Easing.ease,
      }),
      withDelay(1900, withTiming(0, { duration: 0 })),
      withTiming(1, {
        duration: 400,
        easing: Easing.ease,
      })
    );
  };

  const handleComplete = () => {
    if (isCompleted) {
      // If already completed, go to congrats screen
      router.push({
        pathname: "/complete-dare",
        params: { dare, completed: "true", imageUri: dareImage },
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
  const flapAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { perspective: 1000 },
        { rotateX: `${flapRotation.value}deg` },
      ],
      opacity: envelopeOpacity.value,
    };
  });

  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: cardTranslateY.value }],
      opacity: cardOpacity.value,
    };
  });

  const sealAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: sealScale.value }],
    };
  });

  const envelopeAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: envelopeOpacity.value,
    };
  });

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
    top: ENVELOPE_HEIGHT * 0.45,
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
    color: Colors.secondary[400],
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
    backgroundColor: Colors.secondary[400],
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
