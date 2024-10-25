// src/screens/LearnScreen.js

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  TextInput,
  FlatList,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { SvgXml } from "react-native-svg";
import Modal from "react-native-modal";
import { db } from "../../firebase"; // Ensure the correct path
import { collection, getDocs, query, onSnapshot, orderBy } from "firebase/firestore";

// Sample SVG for Material Icon (Replace with actual SVGs as needed)
// Define SVG code strings for each icon
const materialSvgs = {
  plastic: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#80deea" d="M31.96 13.61c-.01-.07-.03-.15-.05-.23-.05-.24-.14-.52-.25-.83-.59-1.63-2.91-3.96-4.66-5.35V5h-6v2.2c-1.76 1.4-4.08 3.75-4.66 5.37h-.01c-.05.15-.1.29-.14.43-.07.25-.13.47-.16.66-.02.13-.03.24-.03.34h16c0-.11-.01-.24-.04-.39"/><path fill="#3f51b5" d="M27 3a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v4h6z"/><path fill="#b2ebf2" d="M30 16c0 .55.45 1 1 1h1v2h-1c-.55 0-1 .45-1 1s.45 1 1 1h1v15h-1c-.55 0-1 .45-1 1s.45 1 1 1h1v2h-1c-.55 0-1 .45-1 1s.45 1 1 1h1v1c0 1.66-1.34 3-3 3H19c-1.66 0-3-1.34-3-3v-1h1c.55 0 1-.45 1-1s-.45-1-1-1h-1v-2h1c.55 0 1-.45 1-1s-.45-1-1-1h-1V21h1c.55 0 1-.45 1-1s-.45-1-1-1h-1v-2h1c.55 0 1-.45 1-1s-.45-1-1-1h-1v-1c0-.1.01-.21.03-.34.03-.19.09-.41.16-.66.04-.14.09-.28.14-.43h.01C17 12 17.45 11.95 18 12c1.26.11 2.55.97 3.76 1.3 1.08.29 4.11.7 5.24.7.84 0 1.58-.21 2.38-.5.45-.16.92-.33 1.37-.5.33-.12.63-.28.91-.45.11.31.2.59.25.83.02.08.04.16.05.23.03.15.04.28.04.39v1h-1c-.55 0-1 .45-1 1"/></svg>`,
  mixed_plastics: `<svg xmlns="http://www.w3.org/2000/svg" baseProfile="basic" viewBox="0 0 48 48"><path fill="#7cb342" d="M43.221 4.001s2.317 10.42-1.494 15.913c-2.619 3.775-7.393 5.344-11.372 3.047s-5.827-7.714-3.047-11.372c5.325-7.007 15.913-7.588 15.913-7.588M3.168 29.053s2.676 8.505 7.726 10.887c3.471 1.637 7.58.778 9.499-2.545s.994-8.014-2.545-9.499c-6.778-2.845-14.68 1.157-14.68 1.157"/><path fill="#827717" d="M42.465 34.502c-2.785-1.159-6.056-1.747-10.092-1.436-1.591 1.585-1.847 3.234-.492 4.96 2.858-.318 6.513-.059 9.371.978 1.463-1.197 2.042-2.697 1.213-4.502"/><path fill="#afb42b" fill-rule="evenodd" d="M44.463 25.75a1.515 1.515 0 1 1-.002 3.03 1.515 1.515 0 0 1 .002-3.03" clip-rule="evenodd"/><circle cx="22.449" cy="44.185" r="1.514" fill="#afb42b" fill-rule="evenodd" clip-rule="evenodd"/><circle cx="22.509" cy="4.25" r="1.514" fill="#afb42b" fill-rule="evenodd" clip-rule="evenodd"/><circle cx="7.509" cy="8.25" r="1.514" fill="#afb42b" fill-rule="evenodd" clip-rule="evenodd"/><circle cx="5.538" cy="20.222" r="1.514" fill="#afb42b" fill-rule="evenodd" clip-rule="evenodd"/><path fill="#558b2f" d="M10.976 32.047c4.1.987 9.888 4.921 12.001 7.947l1.003-1.927c-3.053-2.837-8.977-6.366-13.004-6.02m15.011-7.023c2.047-5.98 5.9-9.994 10.957-12.924-3.933 3.893-6.943 6.943-8.99 14.971z"/><ellipse cx="41.799" cy="36.718" fill="#afb42b" rx="2.368" ry="1.097" transform="rotate(-76.856 41.801 36.718)"/><path fill="#827717" d="M16.995 9.278c-1.931 2.317-3.461 5.268-4.358 9.215 1.044 1.989 2.543 2.722 4.592 1.937.542-2.824 1.871-6.239 3.707-8.662-.71-1.752-1.972-2.748-3.941-2.49"/><ellipse cx="18.914" cy="10.569" fill="#afb42b" rx="1.097" ry="2.368" transform="rotate(-59.647 18.915 10.57)"/><path fill="#7cb342" d="M25.666 36.24c-1.466-2.176-1.846-4.999-1.47-8.271.631 3.306 1.85 5.657 3.546 7.229z"/></svg>`,
  glass: `<svg xmlns="http://www.w3.org/2000/svg" baseProfile="basic" viewBox="0 0 48 48"><path fill="#90caf9" d="M8 3h32l-3 42H11z"/><path fill="#42a5f5" d="M37.286 41 37 45H11l-.286-4z"/><path fill="#fafafa" d="M13.15 33h3.007L14.443 9h-3.007z"/></svg>`,
  cans: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#4fc3f7" d="m25.244 13.241-1.941-.481 2.727-11a1 1 0 0 1 .86-.753l9-1 .221 1.987-8.307.923z"/><path fill="#9fa8da" d="M31 45H17a3.51 3.51 0 0 1-3.5-3.5A3.51 3.51 0 0 1 17 38h14a3.51 3.51 0 0 1 3.5 3.5A3.51 3.51 0 0 1 31 45"/><path fill="#d32f2f" d="M32 9H16c0 1.097-4 5.129-4 7v5l21 2 3-2v-5c0-1.935-4-5.968-4-7M12 41h24v-9l-20-2-4 2z"/><path fill="#c5cae9" d="M34 43H14c-1.65 0-2-2-2-2h24s-.35 2-2 2M33 8a1 1 0 0 0-1-1H16a1 1 0 0 0 0 2h16a1 1 0 0 0 1-1"/><path fill="#ffd740" d="M36 21s-3 1-6 1-6-1-6-1-3-1-6-1-6 1-6 1v11s3-1 6-1 6 1 6 1 3 1 6 1 6-1 6-1z"/></svg>`,
  paper: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-281 373 48 48"><path fill="#90caf9" d="M-241,409v-30h-32v33c0,1.7,1.3,3,3,3h23C-243.7,415-241,412.3-241,409z"/><path fill="#42a5f5" d="M-247.5,415c-0.2,0-0.3,0-0.5,0h-24c-3.3,0-6-2.7-6-6v-2h25v2C-253,412.1-250.6,414.7-247.5,415z"/></svg>`,
  electronic: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#455a64" d="M42 32H6V7a1 1 0 0 1 1-1h34c.555 0 1 .445 1 1z"/><path fill="#bbdefb" d="M8 8h32v20H8z"/><path fill="#b0bec5" d="M0 40h48v2H0z"/><path fill="#cfd8dc" d="M42 30H6L0 40h48z"/><path fill="#546e7a" d="M8 32h32l3 6H5z"/><path fill="#90a4ae" d="M16.545 38 16 40h16l-.545-2z"/></svg>`,
  battery: `<svg xmlns="http://www.w3.org/2000/svg" data-name="Слой 1" viewBox="0 0 48 48"><path fill="#889097" d="M29 5v4H19V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2"/><path fill="#fede00" d="M36 10v11H12V10a3.01 3.01 0 0 1 3-3h18a3.01 3.01 0 0 1 3 3"/><path fill="#889097" d="M36 20v21a3.01 3.01 0 0 1-3 3H15a3.01 3.01 0 0 1-3-3V20Z"/></svg>`,
  textile: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path fill="#D81B60" d="M40,10H6c0,0.021,0,24.002,0,28c0,4,4,4,4,4h30l2-2l-2-2l2-1.995L40,34l2-2.005L40,30l2-1.999L40,26l2-1.997L40,22l2-1.997L40,18l2-1.999L40,14l2-1.999L40,10z"/><path fill="#AD1457" d="M28,10c0,3.647,0,21.557,0,26H9c-1.657,0-3,1.343-3,3s1.343,3,3,3h3h13c3,0,5-2,5-5c0-2.76,0-23.393,0-27H28z"/><path fill="#FF4081" d="M24.5,6h-15C7.567,6,6,7.566,6,9.5S6,39,6,39c0-1.657,1.343-3,3-3h15.988C25.45,36.012,26,36.194,26,37s-0.55,0.988-1,1H9c-0.552,0-1,0.447-1,1s0.448,1,1,1h16c1.206,0,3-0.799,3-3c0,0,0-24.016,0-27c0-0.223,0-0.402,0-0.5C28,7.566,26.434,6,24.5,6z"/></svg>`,
  steel: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#64717c" d="M30.81 18H17.18a1.1 1.1 0 0 1-.73-.27 1.15 1.15 0 0 1-.43-1.14l1.17-5.97A1.994 1.994 0 0 1 19.15 9h9.65a1.95 1.95 0 0 1 1.33.52 1.97 1.97 0 0 1 .63 1.09l1.2 5.97A1.178 1.178 0 0 1 30.81 18m0 18H17.18a1.1 1.1 0 0 1-.73-.27 1.15 1.15 0 0 1-.43-1.14l1.17-5.97A1.994 1.994 0 0 1 19.15 27h9.65a1.95 1.95 0 0 1 1.33.52 1.97 1.97 0 0 1 .63 1.09l1.2 5.97A1.178 1.178 0 0 1 30.81 36"/><path fill="#64717c" d="M46.825 36h-13.63a1.1 1.1 0 0 1-.73-.27 1.15 1.15 0 0 1-.43-1.14l1.17-5.97a1.994 1.994 0 0 1 1.96-1.62h9.65a1.95 1.95 0 0 1 1.33.52 1.97 1.97 0 0 1 .63 1.09l1.2 5.97a1.178 1.178 0 0 1-1.15 1.42m-32.013 0H1.182a1.1 1.1 0 0 1-.73-.27 1.15 1.15 0 0 1-.43-1.14l1.17-5.97A1.994 1.994 0 0 1 3.152 27h9.65a1.95 1.95 0 0 1 1.33.52 1.97 1.97 0 0 1 .63 1.09l1.2 5.97a1.178 1.178 0 0 1-1.15 1.42"/><path fill="#64717c" d="M22.812 27H9.182a1.1 1.1 0 0 1-.73-.27 1.15 1.15 0 0 1-.43-1.14l1.17-5.97a1.994 1.994 0 0 1 1.96-1.62h9.65a1.95 1.95 0 0 1 1.33.52 1.97 1.97 0 0 1 .63 1.09l1.2 5.97a1.178 1.178 0 0 1-1.15 1.42"/><path fill="#64717c" d="M38.828 27h-13.63a1.1 1.1 0 0 1-.73-.27 1.15 1.15 0 0 1-.43-1.14l1.17-5.97a1.994 1.994 0 0 1 1.96-1.62h9.65a1.95 1.95 0 0 1 1.33.52 1.97 1.97 0 0 1 .63 1.09l1.2 5.97a1.178 1.178 0 0 1-1.15 1.42"/><path d="m30.13 9.52-13.68 8.21a1.15 1.15 0 0 1-.43-1.14l1.17-5.97A1.994 1.994 0 0 1 19.15 9h9.65a1.95 1.95 0 0 1 1.33.52m0 18-13.68 8.21a1.15 1.15 0 0 1-.43-1.14l1.17-5.97A1.994 1.994 0 0 1 19.15 27h9.65a1.95 1.95 0 0 1 1.33.52m16.015 0-13.68 8.21a1.15 1.15 0 0 1-.43-1.14l1.17-5.97a1.994 1.994 0 0 1 1.96-1.62h9.65a1.95 1.95 0 0 1 1.33.52m-32.013 0L.452 35.73a1.15 1.15 0 0 1-.43-1.14l1.17-5.97A1.994 1.994 0 0 1 3.152 27h9.65a1.95 1.95 0 0 1 1.33.52m8-9-13.68 8.21a1.15 1.15 0 0 1-.43-1.14l1.17-5.97a1.994 1.994 0 0 1 1.96-1.62h9.65a1.95 1.95 0 0 1 1.33.52m16.016 0-13.68 8.21a1.15 1.15 0 0 1-.43-1.14l1.17-5.97a1.994 1.994 0 0 1 1.96-1.62h9.65a1.95 1.95 0 0 1 1.33.52" fill="#889097"/></svg>`,
  organic: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path fill="#68362B" d="M41 31.5a2.5 2.5 0 0 1-2.5 2.5h-29a2.5 2.5 0 1 1 0-5h29a2.5 2.5 0 0 1 2.5 2.5M38.5 18s-.252-.3-2-1c-2.5-1-23.5-1-25 0-1.044.696-2 1-2 1a2.5 2.5 0 1 0 0 5h29a2.5 2.5 0 1 0 0-5"/><path fill="#FFC107" d="M8 35v4.75A2.25 2.25 0 0 0 10.25 42h27.5A2.25 2.25 0 0 0 40 39.75V35zM24 6C15.164 6 8 10.478 8 16h32c0-5.522-7.163-10-16-10"/><path fill="#FF3D00" d="M7 24h34v4H7z"/><path fill="#CE8106" d="M16 12a1 1 0 1 0 0 2 1 1 0 1 0 0-2m2-3a1 1 0 1 0 0 2 1 1 0 1 0 0-2m2 3a1 1 0 1 0 0 2 1 1 0 1 0 0-2"/><path fill="#8BC34A" d="M41.911 35.403c-.285-.855-.956-1.509-1.805-2.003-.435.37-.991.6-1.606.6h-29a2.48 2.48 0 0 1-1.673-.654c-.577.576-1.027 1.224-1.202 1.809-.409 1.361-.635 3.548 1.254 3.417a4.7 4.7 0 0 0 2.426-.906c1.094-.794 1.548-1.021 2.366-.008.795.984 1.428 1.834 2.438.647 1.048-1.233 1.182-1.913 2.974-1.548 1.876.383 3.45 1.683 5.364 1.986.932.146 1.337.128 1.89-.672.451-.652.862-2.06 1.734-2.193 1.422-.217.349 1.371.308 2.09-.106 1.82 1.893.265 2.426-.357.333-.389.825-1.193 1.431-1.039.66.17.322.52.466 1.063.134.506.586 1.372 1.197 1.364.749-.01 1.101-1.332 1.479-1.868.307-.432.879-1.183 1.479-1.146.665.042.847.873 1.181 1.418.686 1.119 2.586 2.152 3.811 1.258.784-.573 1.383-2.296 1.062-3.258m-1.806-19.668H8.069c-.958.406-1.687.917-1.862 1.5-.412 1.361-.356 2.467 1.548 2.336a4.76 4.76 0 0 0 2.444-.906c1.103-.794 1.56-1.021 2.385-.008.801.984 1.439 1.834 2.456.647 1.056-1.233 1.191-1.913 2.996-1.548 1.892.383 3.477 1.683 5.407 1.986.938.146 1.349.128 1.903-.672.455-.652.869-2.06 1.749-2.193 1.433-.217.352 1.371.31 2.09-.106 1.82 1.907.265 2.444-.357.336-.389.832-1.193 1.442-1.039.665.17.325.52.47 1.063.135.506.591 1.372 1.206 1.364.756-.01 1.11-1.332 1.492-1.868.308-.432.885-1.183 1.489-1.146.67.042.854.873 1.189 1.418.691 1.119 2.607 2.152 3.841 1.258.791-.573.8-.963.475-1.925-.243-.728-.731-1.401-1.348-2"/><path fill="#FFEB3B" d="M39 29c-15 0-21 3-21 3s-4-3-9-3v-1h30zM9 24c15 0 21 3 21 3s4-3 9-3v-1H9z"/></svg>`,
};

const LearnScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [materials, setMaterials] = useState([]); // All materials fetched from Firestore
  const [filteredMaterials, setFilteredMaterials] = useState([]); // Materials after filtering
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);

  // Ref for ScrollView inside Modal
  const scrollViewRef = useRef(null);

  // Fetch materials from Firestore on component mount
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        setError(null);
        const materialsCollectionRef = collection(db, "materials");
        const q = query(materialsCollectionRef, orderBy("name", "asc")); // Optional: Order by name
        const querySnapshot = await getDocs(q);
        const fetchedMaterials = querySnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setMaterials(fetchedMaterials);
        setFilteredMaterials(fetchedMaterials);
      } catch (err) {
        console.error("Error fetching materials:", err);
        setError("Failed to load materials. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();

    // Optional: Real-time updates
    const unsubscribe = onSnapshot(
      query(collection(db, "materials"), orderBy("name", "asc")),
      (snapshot) => {
        const updatedMaterials = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setMaterials(updatedMaterials);
        // Apply current search query to the updated list
        if (searchQuery === "") {
          setFilteredMaterials(updatedMaterials);
        } else {
          const filtered = updatedMaterials.filter((material) =>
            material.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setFilteredMaterials(filtered);
        }
      },
      (error) => {
        console.error("Error with real-time updates:", error);
        setError("Real-time updates failed. You may experience outdated data.");
      }
    );

    return () => unsubscribe();
  }, [db, searchQuery]);

  // Handle search functionality
  useEffect(() => {
    if (searchQuery === "") {
      setFilteredMaterials(materials);
    } else {
      const filtered = materials.filter((material) =>
        material.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMaterials(filtered);
    }
  }, [searchQuery, materials]);

  // Function to open modal with selected material
  const openModal = (material) => {
    setSelectedMaterial(material);
    setIsModalVisible(true);
  };

  // Function to close modal
  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedMaterial(null);
    setScrollOffset(0);
  };

  // Handle onScroll event
  const handleOnScroll = (event) => {
    setScrollOffset(event.nativeEvent.contentOffset.y);
  };

  // Handle scrollTo event (required by react-native-modal for scrollable modals)
  const handleScrollTo = (p) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo(p);
    }
  };

  // Calculate scrollOffsetMax based on content height and ScrollView height
  const scrollOffsetMax = contentHeight > scrollViewHeight ? contentHeight - scrollViewHeight : 0;

  // Render each material item
  const renderMaterialItem = ({ item }) => (
    <TouchableOpacity
      style={styles.materialCard}
      onPress={() => openModal(item)}
      accessibilityLabel={`Learn more about ${item.name}`}
      accessibilityRole="button"
    >
      <View style={styles.iconContainer}>
        <SvgXml xml={materialSvgs[item.icon]} width={50} height={50} />
      </View>
      <View style={styles.materialInfo}>
        <Text style={styles.materialName}>{item.name}</Text>
        <Text style={styles.materialDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Render Header for FlatList
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTextContainer}>
        <Text style={styles.headerTitle}>Learn to Recycle</Text>
        <Text style={styles.headerSubtitle}>
          Discover how to recycle various materials effectively.
        </Text>
      </View>
      {/* Optionally, you can add an info button or any other element here */}
    </View>
  );

  // Render Search Bar for FlatList
  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <Feather name="search" size={20} color="#555" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search materials..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor="#999"
        accessibilityLabel="Search recyclable materials"
      />
    </View>
  );

  // Render Empty List Component
  const renderEmptyComponent = () => (
    <Text style={styles.noResultsText}>No materials found. Try a different search.</Text>
  );

  // Render Footer if needed (e.g., loading indicator)
  const renderFooter = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#0FBD83" />;
    }
    return null;
  };

  // Render Error Message
  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity
        onPress={() => {
          setLoading(true);
          setError(null);
          // Re-fetch materials
          const fetchMaterials = async () => {
            try {
              const materialsCollectionRef = collection(db, "materials");
              const q = query(materialsCollectionRef, orderBy("name", "asc"));
              const querySnapshot = await getDocs(q);
              const fetchedMaterials = querySnapshot.docs.map((docSnap) => ({
                id: docSnap.id,
                ...docSnap.data(),
              }));
              setMaterials(fetchedMaterials);
              setFilteredMaterials(fetchedMaterials);
            } catch (err) {
              console.error("Error fetching materials:", err);
              setError("Failed to load materials. Please try again later.");
            } finally {
              setLoading(false);
            }
          };
          fetchMaterials();
        }}
      >
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading && !materials.length ? (
        // Initial Loading Indicator
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0FBD83" />
        </View>
      ) : error ? (
        // Error Message
        renderError()
      ) : (
        <FlatList
          data={filteredMaterials}
          renderItem={renderMaterialItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <>
              {renderHeader()}
              {renderSearchBar()}
            </>
          }
          ListEmptyComponent={renderEmptyComponent}
          ListFooterComponent={renderFooter}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Always render the modal to avoid conditional rendering issues */}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={closeModal}
        onSwipeComplete={closeModal}
        swipeDirection={["down"]}
        style={styles.modal}
        scrollTo={handleScrollTo}
        scrollOffset={scrollOffset}
        scrollOffsetMax={scrollOffsetMax}
        propagateSwipe={true}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        useNativeDriver={true} // Improves animation performance
      >
        {selectedMaterial ? (
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHandle} />
            </View>
            <ScrollView
              contentContainerStyle={styles.modalScrollContent}
              ref={scrollViewRef}
              onScroll={handleOnScroll}
              scrollEventThrottle={16}
              onContentSizeChange={(w, h) => setContentHeight(h)}
              onLayout={(event) => setScrollViewHeight(event.nativeEvent.layout.height)}
            >
              <Image
                source={{ uri: selectedMaterial.image }}
                style={styles.modalImage}
                resizeMode="cover"
              />
              <Text style={styles.modalTitle}>{selectedMaterial.name}</Text>
              <Text style={styles.modalDescription}>{selectedMaterial.description}</Text>
              <Text style={styles.modalBlogTitle}>How to Recycle</Text>
              {selectedMaterial.blogPost.split("\\n").map((line, index) => (
                <Text key={index} style={styles.modalBlogContent}>
                  {line}
                </Text>
              ))}
            </ScrollView>
          </View>
        ) : (
          <View style={styles.modalContent} /> // Empty view to satisfy children prop
        )}
      </Modal>
    </SafeAreaView>
  );
};

export default LearnScreen;

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginVertical: 20,
  },
  headerTextContainer: {
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "NunitoSansBold",
    color: "#000",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: "NunitoSans",
    color: "#555",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 30,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "NunitoSans",
    color: "#000",
  },
  materialCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  iconContainer: {
    backgroundColor: "#f0fff4",
    padding: 8,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  materialInfo: {
    flex: 1,
    marginLeft: 15,
  },
  materialName: {
    fontSize: 18,
    fontFamily: "NunitoSansBold",
    color: "#0FBD83",
    marginBottom: 5,
  },
  materialDescription: {
    fontSize: 14,
    fontFamily: "NunitoSans",
    color: "#555",
  },
  noResultsText: {
    textAlign: "center",
    fontSize: 16,
    color: "#555",
    fontFamily: "NunitoSans",
    marginTop: 20,
  },
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: SCREEN_HEIGHT * 0.8, // 70% of screen height
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 10,
  },
  modalHandle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#ccc",
  },
  modalScrollContent: {
    paddingBottom: 20,
  },
  modalImage: {
    width: "100%",
    height: 200,
    borderRadius: 15,
    marginVertical: 15,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: "NunitoSansBold",
    color: "#000",
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 16,
    fontFamily: "NunitoSans",
    color: "#555",
    marginBottom: 20,
  },
  modalBlogTitle: {
    fontSize: 18,
    fontFamily: "NunitoSansBold",
    color: "#000",
    marginBottom: 10,
  },
  modalBlogContent: {
    fontSize: 16,
    fontFamily: "NunitoSans",
    color: "#555",
    lineHeight: 22,
  },
});
