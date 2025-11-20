import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, FontSizes, Fonts } from "@/constants/theme";

interface FireBadgeProps {
  days: number;
}

export default function FireBadge({ days }: FireBadgeProps) {
  return (
    <View style={styles.container}>
      <View style={styles.fireIcon}>
        {/* Outer flame - orange */}
        <View style={styles.outerFlame} />

        {/* Middle flame - red-orange */}
        <View style={styles.middleFlame} />

        {/* Inner flame - yellow with number */}
        <View style={styles.innerFlame}>
          <Text style={styles.daysNumber}>{days}</Text>
        </View>
      </View>
      <Text style={styles.daysText}>days</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  fireIcon: {
    width: 80,
    height: 95,
    position: "relative",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 8,
  },
  outerFlame: {
    position: "absolute",
    bottom: 0,
    width: 80,
    height: 95,
    backgroundColor: Colors.accent.orange,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    // Create flame points at the top
    transform: [{ scaleX: 0.8 }],
  },
  middleFlame: {
    position: "absolute",
    bottom: 5,
    width: 65,
    height: 80,
    backgroundColor: Colors.accent.orangeRed,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    transform: [{ scaleX: 0.8 }],
  },
  innerFlame: {
    position: "absolute",
    bottom: 10,
    width: 50,
    height: 65,
    backgroundColor: "#F4C430", // Golden yellow
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    transform: [{ scaleX: 0.8 }],
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  daysNumber: {
    fontSize: 32,
    fontFamily: Fonts.primary.regular,
    color: Colors.accent.orangeRed,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  daysText: {
    fontSize: 16,
    fontFamily: Fonts.secondary.regular,
    color: Colors.accent.orange,
    marginTop: -4,
  },
});
