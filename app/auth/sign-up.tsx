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

export default function SignUp() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    // Validation
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setLoading(true);
    const { error } = await signUp(
      email.trim(),
      password,
      firstName.trim(),
      lastName.trim()
    );
    setLoading(false);

    if (error) {
      Alert.alert(
        "Sign Up Error",
        error.message || "An error occurred during sign up"
      );
    } else {
      Alert.alert(
        "Success!",
        "Your account has been created. Please check your email to verify your account.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/auth/login"),
          },
        ]
      );
    }
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join DareDrop and start your creative journey!
          </Text>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                placeholder="John"
                placeholderTextColor={Colors.gray[400]}
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Doe"
                placeholderTextColor={Colors.gray[400]}
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                editable={!loading}
              />
            </View>

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
                placeholder="At least 6 characters"
                placeholderTextColor={Colors.gray[400]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                textContentType="oneTimeCode"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Re-enter your password"
                placeholderTextColor={Colors.gray[400]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                textContentType="oneTimeCode"
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.signUpButton,
                loading && styles.signUpButtonDisabled,
              ]}
              onPress={handleSignUp}
              disabled={loading}
            >
              <Text style={styles.signUpButtonText}>
                {loading ? "Creating Account..." : "Sign Up"}
              </Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => router.push("/auth/login")}
                disabled={loading}
              >
                <Text style={styles.loginLink}>Log In</Text>
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
    paddingTop: responsiveSpacing(40),
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
    marginBottom: responsiveSpacing(32),
  },
  formContainer: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: responsiveSpacing(20),
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
  signUpButton: {
    backgroundColor: Colors.primary[500],
    borderRadius: 12,
    paddingVertical: responsiveSpacing(16),
    alignItems: "center",
    marginTop: responsiveSpacing(12),
    shadowColor: Colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signUpButtonDisabled: {
    backgroundColor: Colors.gray[400],
    shadowOpacity: 0,
  },
  signUpButtonText: {
    color: Colors.white,
    fontSize: responsiveFontSize(18),
    fontFamily: Fonts.secondary.semiBold,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: responsiveSpacing(24),
  },
  loginText: {
    fontSize: responsiveFontSize(16),
    fontFamily: Fonts.secondary.regular,
    color: Colors.gray[600],
  },
  loginLink: {
    fontSize: responsiveFontSize(16),
    fontFamily: Fonts.secondary.semiBold,
    color: Colors.primary[500],
  },
});
