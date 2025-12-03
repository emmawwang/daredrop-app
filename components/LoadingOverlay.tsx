import React from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Image,
  Text,
} from "react-native";
import { Colors, Shadows, Fonts } from "@/constants/theme";

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export default function LoadingOverlay({
  visible,
  message,
}: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="none">
      <View style={styles.container} pointerEvents="none">
        <Image
          source={require("@/assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <ActivityIndicator
          size="large"
          color={Colors.primary[500]}
          style={styles.spinner}
        />
        {message && (
          <Text style={styles.message}>{message}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  container: {
    backgroundColor: Colors.background,
    borderRadius: 24,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 200,
    minHeight: 200,
    ...Shadows.large,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  spinner: {
    marginTop: 8,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: Fonts.secondary.regular,
    color: Colors.primary[500],
    textAlign: "center",
  },
});

