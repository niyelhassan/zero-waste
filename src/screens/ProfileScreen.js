// src/screens/ProfileScreen.js

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
} from "react-native";
import { auth, db } from "../../firebase";
import { signOut } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import * as Animatable from "react-native-animatable";

const ProfileScreen = ({ navigation, user }) => {
  const [userData, setUserData] = useState(null);
  const [displayName, setDisplayName] = useState(""); // State for editable username
  const [isEditing, setIsEditing] = useState(false); // State to manage edit mode
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); // State for saving indicator

  const handleSignOut = () => {
    signOut(auth).catch((error) => Alert.alert("Sign Out Error", error.message));
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setDisplayName(data.displayName || ""); // Initialize displayName state
        } else {
          Alert.alert("Error", "User data not found.");
        }
      } catch (error) {
        Alert.alert("Error", "Failed to fetch user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleSave = async () => {
    if (displayName.trim() === "") {
      Alert.alert("Validation Error", "Username cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { displayName });
      Alert.alert("Success", "Username updated successfully.");
      setIsEditing(false);
    } catch (error) {
      Alert.alert("Error", "Failed to update username.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0FBD83" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>User data not available.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>Hello, {userData.displayName || user.email}</Text>
          </View>
          <TouchableOpacity
            onPress={handleSignOut}
            style={styles.profileButton}
            accessible={true}
            accessibilityLabel="Sign Out"
          >
            <Ionicons name="log-out-outline" size={28} color="#0FBD83" />
          </TouchableOpacity>
        </View>

        {/* Profile Details */}
        <Animatable.View animation="fadeInUp" delay={100} style={styles.detailsContainer}>
          {/* Email - Non-editable */}
          <View style={styles.detailRow}>
            <Ionicons name="mail-outline" size={24} color="#0FBD83" />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Email</Text>
              <Text style={styles.detailText}>{user.email}</Text>
            </View>
          </View>

          {/* Username - Editable */}
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={24} color="#0FBD83" />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Username</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Enter your username"
                />
              ) : (
                <Text style={styles.detailText}>{displayName || "N/A"}</Text>
              )}
            </View>
            <TouchableOpacity
              onPress={() => setIsEditing(!isEditing)}
              style={styles.editButton}
              accessible={true}
              accessibilityLabel="Edit Username"
            >
              <Ionicons
                name={isEditing ? "close-outline" : "create-outline"}
                size={20}
                color="#0FBD83"
              />
            </TouchableOpacity>
          </View>

          {/* Save Button */}
          {isEditing && (
            <TouchableOpacity onPress={handleSave} style={styles.saveButton} disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          )}

          {/* Password - Non-editable */}
          <View style={styles.detailRow}>
            <Ionicons name="lock-closed-outline" size={24} color="#0FBD83" />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Password</Text>
              <Text style={styles.detailText}>••••••••</Text>
            </View>
          </View>
        </Animatable.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // White background
  },
  scrollContainer: {
    padding: 20,
    alignItems: "center",
    paddingBottom: 100, // To ensure content is above the sign out button
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  profileButton: {
    padding: 5,
  },
  greetingContainer: {
    flex: 1,
    marginLeft: 15,
  },
  greeting: {
    fontSize: 24, // Slightly larger font size for better readability
    color: "#000", // Gray color
    fontFamily: "NunitoSans",
  },
  detailsContainer: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1, // Added border
    borderColor: "#e0e0e0", // Light gray border color
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  detailTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0FBD83",
    fontFamily: "NunitoSansBold",
  },
  detailText: {
    fontSize: 16,
    color: "#555",
    fontFamily: "NunitoSans",
    marginTop: 2, // Added margin for better spacing
  },
  editButton: {
    padding: 5,
  },
  achievementsContainer: {
    width: "100%",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0FBD83",
    marginBottom: 15,
    fontFamily: "NunitoSansBold",
  },
  achievementCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fff4",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    borderWidth: 1, // Added border
    borderColor: "#e0e0e0", // Light gray border color
  },
  achievementTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    fontFamily: "NunitoSansBold",
  },
  achievementDescription: {
    fontSize: 14,
    color: "#555",
    marginTop: 3,
    fontFamily: "NunitoSans",
  },
  noAchievementsText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    fontFamily: "NunitoSans",
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0FBD83",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginTop: 20,
    // Removed elevation and shadow properties
  },
  signOutText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 10,
    fontFamily: "NunitoSansBold",
  },
  input: {
    fontSize: 16,
    color: "#555",
    fontFamily: "NunitoSans",
    marginTop: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 5,
  },
  saveButton: {
    backgroundColor: "#0FBD83",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: "flex-end",
    marginTop: 5,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "NunitoSansBold",
  },
});
