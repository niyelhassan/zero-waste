// src/screens/SignUpScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import { auth, db } from "../../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, collection, Timestamp } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons"; // For icons

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Confirm Password State
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Toggle Password Visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Toggle Confirm Password Visibility

  // Determine if the Sign Up button should be disabled
  const isSignUpDisabled = !email || !password || !confirmPassword;

  const handleSignUp = async () => {
    // Validate input fields
    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update user profile (optional)
      await updateProfile(user, {
        displayName: email.split("@")[0],
      });

      // Create user document in Firestore
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || email.split("@")[0],
        points: 0,
        recycledItems: 0,
        achievements: [], // Initialize as empty array
        streak: 0,
        isGuest: false,
        createdAt: Timestamp.fromDate(new Date()),
      });

      // Initialize recyclingData subcollection with past 7 days
      const recyclingDataCollectionRef = collection(db, "users", user.uid, "recyclingData");

      const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const today = new Date();
      const currentDay = today.getDay(); // 0 (Sun) to 6 (Sat)

      // Start from the Sunday of the current week
      const sunday = new Date(today);
      sunday.setDate(today.getDate() - currentDay);
      sunday.setHours(0, 0, 0, 0); // Reset time

      // Create documents for the past 7 days
      const recyclingPromises = [];

      for (let i = 0; i < 7; i++) {
        const date = new Date(sunday);
        date.setDate(sunday.getDate() + i);
        const dayLabel = daysOfWeek[date.getDay()];
        const docRef = doc(recyclingDataCollectionRef, dayLabel);
        recyclingPromises.push(
          setDoc(docRef, {
            date: Timestamp.fromDate(date),
            recycledCount: 0,
          })
        );
      }

      await Promise.all(recyclingPromises);

      // Optionally, initialize default achievements
      // Example: Give a welcome achievement
      const achievementsCollectionRef = collection(userDocRef, "achievements");
      await setDoc(doc(achievementsCollectionRef, "welcome"), {
        title: "Welcome!",
        description: "Thank you for joining our recycling community.",
        achievedAt: Timestamp.fromDate(new Date()),
      });

      Alert.alert("Success", "Account created successfully!");
      navigation.navigate("Home"); // Navigate to Home after successful sign-up
    } catch (error) {
      console.error("Sign Up Error:", error);
      Alert.alert("Sign Up Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0FBD83" />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>Create Account</Text>

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
            returnKeyType="next"
            onSubmitEditing={() => {
              // Focus on the next input (Password)
              passwordRef.current.focus();
            }}
            blurOnSubmit={false}
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
            ref={passwordRef}
            returnKeyType="next"
            onSubmitEditing={() => {
              // Focus on the next input (Confirm Password)
              confirmPasswordRef.current.focus();
            }}
            blurOnSubmit={false}
          />
          <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? "eye" : "eye-off"} size={24} color="gray" />
          </TouchableOpacity>
        </View>

        {/* Confirm Password Input with Eye Icon */}
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={24} color="gray" style={styles.icon} />
          <TextInput
            placeholder="Confirm Password"
            style={styles.input}
            secureTextEntry={!showConfirmPassword} // Toggle password visibility
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            ref={confirmPasswordRef}
            returnKeyType="done"
            onSubmitEditing={handleSignUp}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Ionicons name={showConfirmPassword ? "eye" : "eye-off"} size={24} color="gray" />
          </TouchableOpacity>
        </View>

        {/* Sign Up Button (disabled until all fields are filled) */}
        <TouchableOpacity
          style={[styles.signUpButton, isSignUpDisabled && styles.disabledButton]}
          onPress={handleSignUp}
          disabled={isSignUpDisabled}
        >
          <Text style={styles.signUpText}>Sign Up</Text>
        </TouchableOpacity>

        {/* Navigate to Sign In */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Signin")}>
            <Text style={styles.registerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

// Create refs for navigation between inputs
const passwordRef = React.createRef();
const confirmPasswordRef = React.createRef();

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1, // Take up the full screen
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 20,
    backgroundColor: "#fff",
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
  signUpButton: {
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
    elevation: 2, // For Android shadow
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  signUpText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "NunitoSansBold",
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
