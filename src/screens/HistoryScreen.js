// HistoryScreen.js

import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  FlatList,
  Share,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { db, auth } from "../../firebase"; // Adjust the path as necessary
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import Modal from "react-native-modal";
import { useNavigation } from "@react-navigation/native";

export default function HistoryScreen() {
  const [items, setItems] = useState([]); // List of scanned items with product details
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [selectedItem, setSelectedItem] = useState(null); // Item selected for modal
  const navigation = useNavigation();

  useEffect(() => {
    fetchScannedItems();
  }, []);

  // Function to fetch scanned items from Firestore
  const fetchScannedItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated.");
      }

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const fetchedItems = userData.items || [];

        if (fetchedItems.length === 0) {
          setItems([]);
          return;
        }

        // Extract unique product codes
        const uniqueCodes = [...new Set(fetchedItems.map((item) => item.code))];

        // Firestore 'in' queries can handle up to 10 items per query
        const chunks = chunkArray(uniqueCodes, 10);
        let products = [];

        for (const chunk of chunks) {
          const productsQuery = query(collection(db, "products"), where("code", "in", chunk));
          const querySnapshot = await getDocs(productsQuery);
          querySnapshot.forEach((doc) => {
            products.push(doc.data());
          });
        }

        // Create a map for quick lookup
        const productsMap = {};
        products.forEach((product) => {
          productsMap[product.code] = product;
        });

        // Merge scanned items with product details
        const mergedItems = fetchedItems.map((item) => ({
          ...item,
          product: productsMap[item.code] || {},
        }));

        // Sort items by scanned_at descending
        mergedItems.sort((a, b) => b.scanned_at.seconds - a.scanned_at.seconds);
        setItems(mergedItems);
      } else {
        throw new Error("User data not found.");
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to chunk an array into smaller arrays
  const chunkArray = (array, size) => {
    const results = [];
    for (let i = 0; i < array.length; i += size) {
      results.push(array.slice(i, i + size));
    }
    return results;
  };

  // Function to handle sharing of a product
  const handleShare = async (item) => {
    try {
      const product = item.product;
      if (!product || !product.code) {
        Alert.alert("Error", "Product information is incomplete.");
        return;
      }
      const message = `${product.product_name}\nCheck it out here: https://world.openfoodfacts.net/product/${product.code}`;
      await Share.share({
        message,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share the product.");
      console.error(error);
    }
  };

  // Function to render each item in the FlatList
  const renderItem = ({ item }) => {
    const product = item.product;
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => {
          setSelectedItem(item);
        }}
      >
        <View style={styles.itemInfo}>
          <Ionicons name="pricetag" size={24} color="#0FBD83" />
          <View style={styles.itemText}>
            <Text style={styles.itemName}>{product.product_name || "Unknown Product"}</Text>
            <Text style={styles.itemDate}>
              Scanned on {new Date(item.scanned_at.seconds * 1000).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#ccc" />
      </TouchableOpacity>
    );
  };

  // Function to close the modal
  const closeModal = () => {
    setSelectedItem(null);
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#0FBD83" />
        <Text style={styles.loadingText}>Loading your scanned items...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <MaterialIcons name="error-outline" size={48} color="#FF6347" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchScannedItems}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <FontAwesome5 name="history" size={64} color="#ccc" />
        <Text style={styles.emptyText}>No scanned items found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>
        <TouchableOpacity onPress={fetchScannedItems}>
          <Ionicons name="refresh" size={28} color="#0FBD83" />
        </TouchableOpacity>
      </View>

      {/* List of Scanned Items */}
      <FlatList
        data={items}
        keyExtractor={(item, index) => `${item.code}-${index}`}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />

      {/* Conditionally Render Modal Only When an Item is Selected */}
      {selectedItem && (
        <Modal
          isVisible={true}
          onBackdropPress={closeModal}
          onBackButtonPress={closeModal}
          style={styles.modal}
          swipeDirection={["down"]}
          onSwipeComplete={closeModal}
          propagateSwipe
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHandle} />
            </View>
            {/* Content */}
            <View style={styles.modalContent}>
              {/* Product Name */}
              <Text style={styles.modalProductName}>
                {selectedItem.product?.product_name || "Unknown Product"}
              </Text>

              {/* Brands */}
              {selectedItem.product?.brands && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Brands</Text>
                  <Text style={styles.modalSectionContent}>{selectedItem.product.brands}</Text>
                </View>
              )}

              {/* Categories */}
              {selectedItem.product?.categories && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Categories</Text>
                  <Text style={styles.modalSectionContent}>{selectedItem.product.categories}</Text>
                </View>
              )}

              {/* Ecoscore */}
              {selectedItem.product?.ecoscore_grade && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Ecoscore</Text>
                  <View style={styles.ecoscoreContainer}>
                    <View style={styles.ecoscoreGradeContainer}>
                      <Text style={styles.ecoscoreGrade}>
                        Grade: {selectedItem.product.ecoscore_grade.toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.ecoscoreScoreContainer}>
                      <Text style={styles.ecoscoreScore}>
                        Score: {selectedItem.product.ecoscore_score}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Packaging Details */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Recycling Information</Text>
                <View style={styles.recyclingSection}>
                  {selectedItem.product?.packagings &&
                  selectedItem.product.packagings.length > 0 ? (
                    selectedItem.product.packagings.map((packaging, index) => (
                      <View key={index} style={styles.packagingInfo}>
                        {packaging.material && (
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Material:</Text>
                            <Text style={styles.infoText}>{packaging.material.id}</Text>
                          </View>
                        )}
                        {packaging.shape && (
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Shape:</Text>
                            <Text style={styles.infoText}>{packaging.shape.id}</Text>
                          </View>
                        )}
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noPackagingText}>No recycling information available.</Text>
                  )}
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

// Styling
const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    fontFamily: "NunitoSansBold",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  itemInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemText: {
    marginLeft: 15,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    fontFamily: "NunitoSansBold",
  },
  itemDate: {
    fontSize: 14,
    color: "#666",
    fontFamily: "NunitoSans",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#0FBD83",
    fontFamily: "NunitoSans",
  },
  errorText: {
    marginTop: 15,
    fontSize: 16,
    color: "#FF6347",
    textAlign: "center",
    fontFamily: "NunitoSans",
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#0FBD83",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "NunitoSansBold",
  },
  emptyText: {
    marginTop: 20,
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    fontFamily: "NunitoSans",
  },
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContainer: {
    height: height * 0.85,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  modalProductName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "NunitoSansBold",
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0FBD83",
    marginBottom: 5,
    fontFamily: "NunitoSansBold",
  },
  modalSectionContent: {
    fontSize: 18,
    color: "#333",
    fontFamily: "NunitoSans",
  },
  ecoscoreContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ecoscoreGradeContainer: {
    backgroundColor: "#D4EDDA",
    padding: 8,
    borderRadius: 8,
  },
  ecoscoreGrade: {
    fontSize: 16,
    color: "#155724",
    fontWeight: "bold",
    fontFamily: "NunitoSansBold",
  },
  ecoscoreScoreContainer: {
    backgroundColor: "#F8D7DA",
    padding: 8,
    borderRadius: 8,
  },
  ecoscoreScore: {
    fontSize: 16,
    color: "#721C24",
    fontWeight: "bold",
    fontFamily: "NunitoSansBold",
  },
  packagingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  packagingHeader: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    color: "#333",
    fontFamily: "NunitoSansBold",
  },
  packagingText: {
    fontSize: 14,
    marginBottom: 3,
    color: "#555",
    fontFamily: "NunitoSans",
  },
  boldText: {
    fontWeight: "bold",
    color: "#333",
    fontFamily: "NunitoSansBold",
  },
  noPackagingText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    fontFamily: "NunitoSans",
    marginTop: 10,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  shareButton: {
    flexDirection: "row",
    backgroundColor: "#0FBD83",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignItems: "center",
  },
  shareButtonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 8,
    fontFamily: "NunitoSansBold",
  },
  favoriteButton: {
    flexDirection: "row",
    backgroundColor: "#FF6347",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignItems: "center",
  },
  favoriteButtonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 8,
    fontFamily: "NunitoSansBold",
  },
  packagingInfo: {
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
    fontFamily: "NunitoSansBold",
    width: 120,
  },
  infoText: {
    fontSize: 16,
    color: "#555",
    fontFamily: "NunitoSans",
    flexShrink: 1,
  },
  recyclingSection: {
    backgroundColor: "#F5F5F5",
    padding: 20,
    borderRadius: 15,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 10,
  },
  modalHandle: {
    width: 50,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#ccc",
  },
});
