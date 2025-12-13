import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { Colors, Fonts, responsiveFontSize, responsiveSpacing } from "@/constants/theme";
import { LogOut, User, Mail, ChevronLeft } from "lucide-react-native";

export default function Settings() {
  const router = useRouter();
  const { profile, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/auth/login");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ChevronLeft size={28} color={Colors.primary[500]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <User size={20} color={Colors.gray[600]} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>
                  {profile?.first_name} {profile?.last_name}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Mail size={20} color={Colors.gray[600]} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{profile?.email}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <LogOut size={20} color={Colors.accent.orangeRed} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>DareDrop v1.0.0</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: responsiveSpacing(20),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: responsiveSpacing(16),
    marginBottom: responsiveSpacing(20),
  },
  backButton: {
    padding: responsiveSpacing(4),
  },
  headerTitle: {
    fontSize: responsiveFontSize(24),
    fontFamily: Fonts.secondary.semiBold,
    color: Colors.primary[500],
  },
  placeholder: {
    width: responsiveSpacing(36),
  },
  section: {
    marginBottom: responsiveSpacing(32),
  },
  sectionTitle: {
    fontSize: responsiveFontSize(18),
    fontFamily: Fonts.secondary.semiBold,
    color: Colors.primary[500],
    marginBottom: responsiveSpacing(12),
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: responsiveSpacing(20),
    shadowColor: Colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: responsiveSpacing(8),
  },
  infoContent: {
    marginLeft: responsiveSpacing(16),
    flex: 1,
  },
  infoLabel: {
    fontSize: responsiveFontSize(14),
    fontFamily: Fonts.secondary.regular,
    color: Colors.gray[500],
    marginBottom: responsiveSpacing(4),
  },
  infoValue: {
    fontSize: responsiveFontSize(16),
    fontFamily: Fonts.secondary.regular,
    color: Colors.primary[500],
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray[200],
    marginVertical: responsiveSpacing(12),
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.red[50],
    borderRadius: 12,
    shadowColor: Colors.accent.orangeRed,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 0.1,
    borderColor: Colors.accent.orangeRed,
    elevation: 2,
    paddingVertical: responsiveSpacing(16),
    marginTop: responsiveSpacing(20),
  },
  signOutText: {
    fontSize: responsiveFontSize(16),
    fontFamily: Fonts.secondary.semiBold,
    color: Colors.accent.orangeRed,
    marginLeft: responsiveSpacing(8),
  },
  versionText: {
    fontSize: responsiveFontSize(14),
    fontFamily: Fonts.secondary.regular,
    color: Colors.gray[400],
    textAlign: "center",
    marginTop: "auto",
    marginBottom: responsiveSpacing(20),
  },
});
