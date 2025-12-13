import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, FontSizes, Fonts, responsiveFontSize, moderateScale, responsiveSpacing } from "@/constants/theme";

interface FireBadgeProps {
  days: number;
}

export default function FireBadge({ days }: FireBadgeProps) {
  return (
    <View style={styles.container}>
      <View style={styles.fireIcon}>
        {/* Orange flame layer */}
        <Ionicons
          name="flame"
          size={90}
          color={Colors.accent.orangeRed}
          style={styles.redFlame}
        />

        {/* Yellow flame layer in middle */}
        <Ionicons
          name="flame"
          size={70}
          color={Colors.accent.orange}
          style={styles.orangeFlame}
        />
        {/* orange flame layer on top */}
        <Ionicons
          name="flame"
          size={55}
          opacity={0.5}
          color={Colors.accent.yellow}
          style={styles.yellowFlame}
        />

        {/* Days number */}
        <View style={styles.numberContainer}>
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
    width: moderateScale(90),
    height: moderateScale(95),
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  redFlame: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  yellowFlame: {
    position: "absolute",
    top: moderateScale(22),
    left: moderateScale(18),
  },
  orangeFlame: {
    position: "absolute",
    top: moderateScale(10),
    left: moderateScale(10),
  },
  numberContainer: {
    position: "absolute",
    top: moderateScale(35),
    alignItems: "center",
    justifyContent: "center",
  },
  daysNumber: {
    fontSize: responsiveFontSize(32),
    fontFamily: Fonts.secondary.semiBold,
    color: Colors.accent.orangeRed,
    fontWeight: "bold",
    textShadowColor: Colors.white,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
  },
  daysText: {
    fontSize: responsiveFontSize(18),
    fontFamily: Fonts.secondary.regular,
    color: Colors.accent.orange,
    marginTop: responsiveSpacing(-8),
  },
});
