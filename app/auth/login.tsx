import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { Colors, Fonts, responsiveFontSize, responsiveSpacing } from "@/constants/theme";

export default function Login() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);

    if (error) {
      Alert.alert("Login Error", error.message || "Invalid email or password");
    }
    // Navigation will be handled automatically by the auth state change
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>
            Log in to continue your dare streak
          </Text>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="john@example.com"
                placeholderTextColor={Colors.gray[400]}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={Colors.gray[400]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                textContentType="oneTimeCode"
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.loginButton,
                loading && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? "Logging In..." : "Log In"}
              </Text>
            </TouchableOpacity>

            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => router.push("/auth/sign-up")}
                disabled={loading}
              >
                <Text style={styles.signUpLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: responsiveSpacing(24),
    paddingTop: responsiveSpacing(60),
    paddingBottom: responsiveSpacing(20),
  },
  title: {
    fontSize: responsiveFontSize(48),
    fontFamily: Fonts.primary.regular,
    color: Colors.primary[500],
    marginBottom: responsiveSpacing(8),
  },
  subtitle: {
    fontSize: responsiveFontSize(18),
    fontFamily: Fonts.secondary.regular,
    color: Colors.gray[600],
    marginBottom: responsiveSpacing(48),
  },
  formContainer: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: responsiveSpacing(24),
  },
  label: {
    fontSize: responsiveFontSize(16),
    fontFamily: Fonts.secondary.medium,
    color: Colors.gray[700],
    marginBottom: responsiveSpacing(8),
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.gray[300],
    borderRadius: 12,
    paddingHorizontal: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(14),
    fontSize: responsiveFontSize(16),
    fontFamily: Fonts.secondary.regular,
    color: Colors.gray[900],
  },
  loginButton: {
    backgroundColor: Colors.primary[500],
    borderRadius: 12,
    paddingVertical: responsiveSpacing(16),
    alignItems: "center",
    marginTop: responsiveSpacing(8),
    shadowColor: Colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    backgroundColor: Colors.gray[400],
    shadowOpacity: 0,
  },
  loginButtonText: {
    color: Colors.white,
    fontSize: responsiveFontSize(18),
    fontFamily: Fonts.secondary.semiBold,
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: responsiveSpacing(24),
  },
  signUpText: {
    fontSize: responsiveFontSize(16),
    fontFamily: Fonts.secondary.regular,
    color: Colors.gray[600],
  },
  signUpLink: {
    fontSize: responsiveFontSize(16),
    fontFamily: Fonts.secondary.semiBold,
    color: Colors.primary[500],
  },
});
