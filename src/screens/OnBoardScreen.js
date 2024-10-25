import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { getAuth, signInAnonymously } from "firebase/auth";
import { db, Timestamp, collection } from "../../firebase"; // Import your Firebase Firestore setup
import { doc, setDoc } from "firebase/firestore"; // Firestore methods
import { StatusBar } from "expo-status-bar";

const OnboardScreen = ({ navigation }) => {
  const [loading, setLoading] = React.useState(false);

  // Function to handle anonymous sign in
  const handleGuestSignIn = async () => {
    setLoading(true);
    const auth = getAuth();
    try {
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;

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
    } catch (error) {
      Alert.alert("Guest Sign-In Error", error.message);
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
    <View style={styles.container}>
      {/* Logo */}
      <Image source={require("../../assets/images/onboard_logo.png")} style={styles.logo} />

      {/* Description Text */}
      <Text style={styles.description}>
        Learn to recycle effortlessly and reduce your environmental impact!
      </Text>

      {/* Create Account Button */}
      <TouchableOpacity
        style={styles.createAccountButton}
        onPress={() => navigation.navigate("Signup")}
      >
        <Text style={styles.createAccountText}>Create an Account</Text>
      </TouchableOpacity>

      {/* Sign In Button */}
      <TouchableOpacity style={styles.signInButton} onPress={() => navigation.navigate("Signin")}>
        <Text style={styles.signInText}>Sign In</Text>
      </TouchableOpacity>

      {/* Continue as Guest */}
      <TouchableOpacity onPress={handleGuestSignIn}>
        <Text style={styles.guestText}>Continue as Guest</Text>
      </TouchableOpacity>
      <StatusBar style="dark" />
    </View>
  );
};

export default OnboardScreen;

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  logo: {
    width: width * 0.75,
    height: width * 0.75,
    resizeMode: "contain",
    marginBottom: 10,
  },
  description: {
    fontSize: 18,
    color: "#000",
    textAlign: "center",
    marginBottom: 150,
    lineHeight: 24,
    paddingHorizontal: 10,
    fontWeight: "bold",
    fontFamily: "NunitoSansSemi",
  },
  createAccountButton: {
    width: "100%",
    paddingVertical: 15,
    backgroundColor: "#0FBD83",
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 15,
  },
  createAccountText: {
    color: "#000",
    fontSize: 16,
    fontFamily: "NunitoSansBold",
  },
  signInButton: {
    width: "100%",
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#d9d9d9",
    alignItems: "center",
  },
  signInText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "NunitoSansBold",
  },
  guestText: {
    color: "#0dbf84", // Green color for the guest text
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 20,
    fontFamily: "NunitoSansBold",
  },
});
