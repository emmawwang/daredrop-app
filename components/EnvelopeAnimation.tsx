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
import {
  Colors,
  Shadows,
  BorderRadius,
  Fonts,
  responsiveFontSize,
  responsiveSpacing,
  moderateScale,
  wp,
} from "@/constants/theme";
import { useDare } from "@/contexts/DareContext";
import { RefreshCw } from "lucide-react-native";
import Svg, { Polygon } from "react-native-svg";

interface EnvelopeAnimationProps {
  dare: string;
  onComplete?: () => void;
  onChooseNewDare?: () => void;
}

const { width } = Dimensions.get("window");
const ENVELOPE_WIDTH = wp(85);
const ENVELOPE_HEIGHT = moderateScale(240);
const CARD_WIDTH = ENVELOPE_WIDTH - responsiveSpacing(30);
const CARD_HEIGHT = moderateScale(200);

export default function EnvelopeAnimation({
  dare,
  onComplete,
  onChooseNewDare,
}: EnvelopeAnimationProps) {
  const router = useRouter();
  const { isDareCompleted, isDareInProgress, getDareImage } = useDare();
  const [isOpen, setIsOpen] = useState(false);
  const [displayedDare, setDisplayedDare] = useState(dare);

  const isCompleted = isDareCompleted(dare);
  const isInProgress = isDareInProgress(dare);
  const dareImage = getDareImage(dare);

  // Animated values for animations
  const flapRotation = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const sealScale = useRef(new Animated.Value(1)).current;
  const envelopeOpacity = useRef(new Animated.Value(1)).current;
  const cardScale = useRef(new Animated.Value(1)).current;

  // Update displayed dare with a nice animation when dare changes while open
  useEffect(() => {
    if (isOpen && dare !== displayedDare) {
      // Animate card scale down, change text, scale back up
      Animated.sequence([
        Animated.timing(cardScale, {
          toValue: 0.95,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(cardScale, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
      setDisplayedDare(dare);
    } else if (!isOpen) {
      setDisplayedDare(dare);
    }
  }, [dare, isOpen, displayedDare]);

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
    backfaceVisibility: "hidden" as const,
  };

  const cardAnimatedStyle = {
    transform: [{ translateY: cardTranslateY }, { scale: cardScale }],
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

          {/* Envelope Front Layer */}
          <Animated.View
            style={[styles.envelopeFront, envelopeAnimatedStyle]}
          />

          {/* Envelope Flap (rotates open) */}
          <Animated.View style={[styles.flap, flapAnimatedStyle]}>
            <Svg
              width={ENVELOPE_WIDTH}
              height={ENVELOPE_HEIGHT * 0.6}
              viewBox={`0 0 ${ENVELOPE_WIDTH} ${ENVELOPE_HEIGHT * 0.6}`}
            >
              {/* Triangle pointing down */}
              <Polygon
                points={`0,0 ${ENVELOPE_WIDTH},0 ${ENVELOPE_WIDTH / 2},${
                  ENVELOPE_HEIGHT * 0.5
                }`}
                fill={Colors.envelope}
                stroke={Colors.primary[500]}
                strokeWidth="1.5"
              />
            </Svg>
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
            <Text style={styles.dareText}>{displayedDare}</Text>

            {isCompleted && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedBadgeText}>✓ Completed!</Text>
              </View>
            )}

            {isInProgress && !isCompleted && (
              <View style={styles.inProgressBadge}>
                <Text style={styles.inProgressBadgeText}>📝 In Progress</Text>
              </View>
            )}

            {isOpen && (
              <View style={styles.buttonContainer}>
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
                    {isCompleted
                      ? "View dare"
                      : isInProgress
                      ? "Continue"
                      : "Complete"}
                  </Text>
                </TouchableOpacity>

                {onChooseNewDare && (
                  <TouchableOpacity
                    style={styles.newDareButton}
                    onPress={onChooseNewDare}
                    activeOpacity={0.7}
                  >
                    <RefreshCw size={16} color={Colors.secondary[500]} />
                    <Text style={styles.newDareButtonText}>Choose another</Text>
                  </TouchableOpacity>
                )}
              </View>
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
    marginVertical: responsiveSpacing(10),
    marginBottom: 1,
  },
  envelopeWrapper: {
    position: "relative",
    width: ENVELOPE_WIDTH,
    height: ENVELOPE_HEIGHT + moderateScale(180),
    justifyContent: "center",
    alignItems: "center",
  },
  // Back layer of envelope
  envelopeBack: {
    position: "absolute",
    width: ENVELOPE_WIDTH,
    height: ENVELOPE_HEIGHT,
    backgroundColor: Colors.envelope,
    borderWidth: 1,
    borderColor: Colors.primary[500],
    borderRadius: BorderRadius.sm,
    top: 0,
    zIndex: 1,
    ...Shadows.medium,
  },
  // Front layer (transparent, for potential future use)
  envelopeFront: {
    position: "absolute",
    width: ENVELOPE_WIDTH,
    height: ENVELOPE_HEIGHT,
    top: 0,
    zIndex: 2,
    overflow: "hidden",
  },
  // Top flap that rotates
  flap: {
    position: "absolute",
    top: 1,
    left: 0,
    width: ENVELOPE_WIDTH * 0.8,
    height: ENVELOPE_HEIGHT * 0.5,
    transformOrigin: "top center",
    zIndex: 3,
    ...Shadows.small,
  },
  // Logo seal
  sealContainer: {
    position: "absolute",
    top: ENVELOPE_HEIGHT * 0.25,
    zIndex: 10,
    alignItems: "center",
    justifyContent: "center",
    width: moderateScale(150),
    height: moderateScale(150),
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
    borderWidth: 2,
    borderColor: Colors.primary[500],
    padding: responsiveSpacing(24),
    justifyContent: "center",
    alignItems: "center",
    zIndex: 4,
    ...Shadows.large,
  },
  dareText: {
    fontSize: responsiveFontSize(20),
    fontFamily: Fonts.secondary.regular,
    color: Colors.primary[500],
    textAlign: "center",
    lineHeight: responsiveFontSize(28),
  },
  completedBadge: {
    marginTop: responsiveSpacing(12),
    alignSelf: "flex-end",
  },
  completedBadgeText: {
    fontSize: responsiveFontSize(14),
    fontFamily: Fonts.secondary.medium,
    color: Colors.secondary[500],
    fontStyle: "italic",
  },
  inProgressBadge: {
    marginTop: responsiveSpacing(12),
    alignSelf: "flex-end",
    backgroundColor: Colors.accent.yellow,
    paddingHorizontal: responsiveSpacing(12),
    paddingVertical: responsiveSpacing(4),
    borderRadius: BorderRadius.md,
  },
  inProgressBadgeText: {
    fontSize: responsiveFontSize(14),
    fontFamily: Fonts.secondary.medium,
    color: Colors.primary[500],
  },
  buttonContainer: {
    marginTop: responsiveSpacing(16),
    alignItems: "center",
    gap: responsiveSpacing(10),
  },
  completeButton: {
    backgroundColor: Colors.primary[500],
    paddingVertical: responsiveSpacing(12),
    paddingHorizontal: responsiveSpacing(24),
    borderRadius: BorderRadius.md,
    alignSelf: "center",
    ...Shadows.medium,
  },
  viewDareButton: {
    backgroundColor: Colors.secondary[500],
  },
  completeButtonText: {
    fontSize: responsiveFontSize(16),
    fontFamily: Fonts.secondary.semiBold,
    color: Colors.white,
  },
  viewDareButtonText: {
    color: Colors.white,
  },
  newDareButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: responsiveSpacing(6),
    paddingVertical: responsiveSpacing(8),
    paddingHorizontal: responsiveSpacing(16),
  },
  newDareButtonText: {
    fontSize: responsiveFontSize(14),
    fontFamily: Fonts.secondary.medium,
    color: Colors.secondary[500],
  },
});
