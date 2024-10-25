// src/screens/LoginScreen.js

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
} from "react-native";
import { SvgXml } from "react-native-svg";
import { auth } from "../../firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons"; // For icons

// Google SVG
const googleSvg = `
<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
<path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
<path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
<path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
<path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
</svg>
`;

// Facebook SVG
const facebookSvg = `
<svg width="800" height="800" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" fill-rule="evenodd">
    <path d="M24 0v24H0V0z"/>
    <path d="M16.023 4.503c1.83-.126 3.244.942 4.185 2.174.948 1.243 1.601 2.866 1.96 4.462.357 1.596.453 3.311.156 4.773-.285 1.404-1.046 3.01-2.767 3.525-1.62.484-3.04-.22-4.052-1.072-1.016-.855-1.876-2.053-2.552-3.176a25 25 0 0 1-.89-1.616 25 25 0 0 1-.889 1.615c-.676 1.124-1.536 2.322-2.552 3.177-1.013.852-2.432 1.556-4.052 1.072-1.721-.515-2.482-2.12-2.767-3.525-.296-1.462-.2-3.177.157-4.773.358-1.596 1.011-3.22 1.96-4.462.94-1.232 2.354-2.3 4.184-2.174 1.716.12 2.963 1.283 3.74 2.269l.22.289.219-.29c.777-.985 2.024-2.149 3.74-2.268M7.896 7.496c-.42-.029-.97.186-1.592 1.002-.614.805-1.124 1.993-1.417 3.298s-.335 2.579-.144 3.52c.165.81.43 1.101.592 1.203l.068.034.027.01c.232.07.614.05 1.26-.494.645-.542 1.303-1.413 1.914-2.427.272-.453.525-.917.752-1.363l.26-.525.233-.497.206-.458.175-.407.143-.346a9 9 0 0 0-.663-1.119c-.644-.916-1.29-1.394-1.814-1.43m8.335 0c-.524.037-1.17.515-1.814 1.431a9 9 0 0 0-.663 1.119l.227.543.19.434.107.234.234.497.26.525c.227.446.479.91.751 1.363.611 1.014 1.27 1.885 1.913 2.427.601.506.973.558 1.21.507l.052-.013c.13-.04.483-.249.686-1.248.19-.94.149-2.214-.144-3.52-.292-1.304-.802-2.492-1.417-3.297-.623-.816-1.172-1.03-1.592-1.002" fill="#0081FB"/>
  </g>
</svg>
`;

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for showing password

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Navigate to Home screen after successful login
      navigation.navigate("Home");
    } catch (error) {
      Alert.alert("Login Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address to reset your password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert("Password Reset", "A password reset link has been sent to your email.");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const isLoginDisabled = !email || !password;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0FBD83" />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled" // Prevents keyboard from dismissing when tapping outside
    >
      <Text style={styles.title}>Sign In</Text>

      {/* Email Input with Icon */}
      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={24} color="gray" style={styles.icon} />
        <TextInput
          placeholder="Email"
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {/* Password Input with Eye Icon */}
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={24} color="gray" style={styles.icon} />
        <TextInput
          placeholder="Password"
          style={styles.input}
          secureTextEntry={!showPassword} // Toggle password visibility
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
          <Ionicons name={showPassword ? "eye" : "eye-off"} size={24} color="gray" />
        </TouchableOpacity>
      </View>

      {/* Forgot Password Button aligned to the right */}
      <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordContainer}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Sign In Button (disabled until both inputs are filled) */}
      <TouchableOpacity
        style={[styles.signInButton, isLoginDisabled && styles.disabledButton]}
        onPress={handleLogin}
        disabled={isLoginDisabled}
      >
        <Text style={styles.signInText}>Log In</Text>
      </TouchableOpacity>

      {/* Divider with "Or login with" */}
      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.orLoginText}>Or login with</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Social Login Buttons */}
      <View style={styles.socialLoginContainer}>
        <TouchableOpacity style={styles.socialButton}>
          <SvgXml xml={googleSvg} width={24} height={24} />
          <Text style={styles.socialButtonText}>Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <SvgXml xml={facebookSvg} width={24} height={24} />
          <Text style={styles.socialButtonText}>Meta</Text>
        </TouchableOpacity>
      </View>

      {/* Register link */}
      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
          <Text style={styles.registerLink}>Register</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 20,
    backgroundColor: "#fff", // Ensure background color
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    marginBottom: 30,
    color: "#000",
    fontFamily: "NunitoSansBold",
  },
  inputContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 15,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    padding: 15,
    paddingLeft: 10,
    fontSize: 16,
    fontFamily: "NunitoSans",
  },
  icon: {
    paddingLeft: 15,
  },
  eyeIcon: {
    paddingRight: 15,
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
  },
  forgotPasswordText: {
    color: "#0dbf84",
    fontSize: 14,
    marginBottom: 20,
    fontFamily: "NunitoSansBold",
  },
  signInButton: {
    marginTop: 10,
    width: "100%",
    paddingVertical: 15,
    backgroundColor: "#0FBD83",
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 1,
    elevation: 2, // Shadow for Android
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  signInText: {
    color: "#000",
    fontSize: 16,
    fontFamily: "NunitoSansBold",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    width: "100%",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  orLoginText: {
    fontSize: 16,
    marginHorizontal: 10,
    fontFamily: "NunitoSans",
    color: "#555",
  },
  socialLoginContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 30,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: "48%",
  },
  socialButtonText: {
    marginLeft: 10,
    fontSize: 16,
    fontFamily: "NunitoSans",
  },
  registerContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  registerText: {
    fontSize: 15,
    fontFamily: "NunitoSans",
    color: "#555",
  },
  registerLink: {
    fontSize: 15,
    fontFamily: "NunitoSansBold",
    color: "#0FBD83",
  },
});
