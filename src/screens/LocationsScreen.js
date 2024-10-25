// src/screens/LocationsScreen.js

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  Platform,
} from "react-native";
import MapView, { Marker, PROVIDER_APPLE } from "react-native-maps";
import * as Location from "expo-location";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons"; // For icons

const LocationsScreen = () => {
  const [location, setLocation] = useState(null);
  const [recycleLocations, setRecycleLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        // Request location permissions
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Denied", "Permission to access location was denied.");
          setError("Location permission denied.");
          setLoading(false);
          return;
        }

        // Get current location
        let loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);

        // Fetch recycling locations from Firestore
        const locationsSnapshot = await getDocs(collection(db, "locations"));
        const locationsList = locationsSnapshot.docs.map((doc) => doc.data());
        setRecycleLocations(locationsList);
      } catch (err) {
        console.error("Error fetching locations:", err);
        Alert.alert("Error", "Failed to fetch recycling locations.");
        setError("Failed to fetch recycling locations.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Function to center map on user's location
  const centerOnUser = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        1000
      ); // Duration in ms
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0FBD83" />
        <Text style={styles.loaderText}>Loading recycling locations...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loader}>
        <Text style={styles.loaderText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === "ios" ? PROVIDER_APPLE : undefined} // Explicitly use Apple Maps on iOS
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false} // We'll add a custom button
        loadingEnabled={true}
      >
        {recycleLocations.map((loc) => (
          <Marker
            key={loc.id}
            coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
            title={loc.title}
            description={loc.description}
            pinColor="#e11d48" // Custom pin color
          />
        ))}
      </MapView>

      {/* Custom User Location Button */}
      <TouchableOpacity style={styles.locationButton} onPress={centerOnUser}>
        <Ionicons name="locate-outline" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default LocationsScreen;

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  map: {
    width: width,
    height: height,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 20,
    backgroundColor: "#fff",
  },
  loaderText: {
    fontSize: 16,
    color: "#333",
    marginTop: 10,
    textAlign: "center",
    fontFamily: "NunitoSans",
  },
  locationButton: {
    position: "absolute",
    bottom: 110,
    right: 30,
    backgroundColor: "#0FBD83",
    padding: 12,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5, // For Android shadow
  },
});
