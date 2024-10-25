import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from "react-native";
import { Camera, CameraView } from "expo-camera";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { db, auth } from "../../firebase";
import {
  doc,
  updateDoc,
  getDoc,
  arrayUnion,
  setDoc,
  collection,
  query,
  where,
  increment,
  getDocs,
} from "firebase/firestore";
import Modal from "react-native-modal";
import { useNavigation } from "@react-navigation/native";
import Svg, { SvgXml } from "react-native-svg";

const recyclingIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M11.047 1.39a3.35 3.35 0 0 1 1.917 0c.745.222 1.278.768 1.737 1.39.453.615.944 1.46 1.542 2.493l1.57 2.707.12-.751a.977.977 0 0 1 1.93.31l-.556 3.459a.977.977 0 0 1-1.31.759l-3.398-1.28a.977.977 0 1 1 .688-1.829l.836.315-1.541-2.659c-.636-1.096-1.072-1.846-1.453-2.363-.382-.517-.597-.64-.724-.678a1.4 1.4 0 0 0-.799 0c-.127.038-.342.16-.723.678-.381.517-.818 1.267-1.454 2.363a.977.977 0 1 1-1.69-.98l.03-.051c.598-1.032 1.088-1.878 1.54-2.492.46-.623.993-1.169 1.738-1.391M7.433 7.815a.98.98 0 0 1 .47.694l.529 3.462a.977.977 0 0 1-1.932.295l-.11-.718-1.621 2.796c-.648 1.118-1.088 1.88-1.344 2.472-.256.594-.233.816-.202.917.057.184.161.356.308.5.096.093.317.225.993.3.671.075 1.587.076 2.92.076a.977.977 0 0 1 0 1.955h-.061c-1.257 0-2.283 0-3.075-.088-.8-.089-1.568-.284-2.143-.846a3.15 3.15 0 0 1-.81-1.32c-.24-.78-.036-1.545.276-2.268.306-.711.807-1.574 1.415-2.623l1.687-2.91-.868.32a.977.977 0 0 1-.675-1.835L6.599 7.74a.98.98 0 0 1 .834.076M19.5 12.839a.977.977 0 0 1 1.336.355l.034.06c.651 1.122 1.186 2.046 1.507 2.806.327.773.529 1.593.223 2.414a3.1 3.1 0 0 1-.632 1.032c-.584.635-1.4.858-2.251.958-.843.1-1.94.1-3.286.1h-2.684l.565.433a.977.977 0 0 1-1.19 1.551l-2.85-2.186a.977.977 0 0 1 0-1.551l2.85-2.186a.977.977 0 1 1 1.19 1.551l-.565.433h2.62c1.425 0 2.406-.001 3.12-.086.718-.084.943-.233 1.041-.34a1.2 1.2 0 0 0 .24-.39c.04-.109.076-.341-.191-.973-.267-.633-.738-1.449-1.432-2.646a.977.977 0 0 1 .355-1.335" fill="#0FBD83"/></svg>`;

export default function ScanScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [productData, setProductData] = useState(null); // Initialize as null
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);

  // Ref for ScrollView inside Modal
  const scrollViewRef = useRef(null);
  const cameraRef = useRef(null);
  const navigation = useNavigation();

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  const handleBarcodeScanned = async ({ type, data }) => {
    setScanned(true);

    // Fetch product data from OpenFoodFacts API
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://world.openfoodfacts.net/api/v3/product/${data}?fields=code,product_name,packagings,brands,categories,ecoscore_grade,ecoscore_score`
      );
      const result = await response.json();

      if (result.status === "success") {
        const product = result.product;

        if (!product.code) {
          throw new Error("Product code is missing.");
        }

        setProductData(product);
        setModalVisible(true);

        // *** Begin: Save Product Data to Firebase ***
        try {
          const productsCollectionRef = collection(db, "products");
          const productDocRef = doc(productsCollectionRef, product.code);
          await setDoc(productDocRef, product, { merge: true });
          console.log(`Product ${product.code} saved to Firestore.`);
        } catch (saveError) {
          console.error("Error saving product to Firestore:", saveError);
        }
        // *** End: Save Product Data to Firebase ***

        // Update user stats in Firestore
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            await updateDoc(userDocRef, {
              points: (userData.points || 0) + 10, // Increment points by 10
              recycledItems: (userData.recycledItems || 0) + 1, // Increment recycled items by 1
              items: arrayUnion({
                code: product.code || "Unknown Code",
                product_name: product.product_name || "Unknown Product",
                packagings: product.packagings || [],
                scanned_at: new Date(),
              }),
            });

            // *** Begin: Update recyclingData ***
            try {
              const recyclingCollectionRef = collection(db, "users", user.uid, "recyclingData");

              // Get today's date at midnight
              const today = new Date();
              today.setHours(0, 0, 0, 0);

              // Create a query to check if a document for today exists
              const recyclingQueryRef = query(recyclingCollectionRef, where("date", "==", today));

              const recyclingSnapshot = await getDocs(recyclingQueryRef);

              if (!recyclingSnapshot.empty) {
                // Document for today exists, increment recycledCount
                const recyclingDocRef = recyclingSnapshot.docs[0].ref;
                await updateDoc(recyclingDocRef, {
                  recycledCount: increment(1),
                });
                console.log("Recycled count incremented for today.");
              } else {
                // No document for today, create one with recycledCount = 1
                await setDoc(doc(recyclingCollectionRef), {
                  date: today,
                  recycledCount: 1,
                });
                console.log("Recycling data for today created.");
              }
            } catch (recyclingError) {
              console.error("Error updating recycling data:", recyclingError);
              // Optionally, you can set an error state or notify the user
            }
            // *** End: Update recyclingData ***
          } else {
            Alert.alert("Error", "User data not found.");
          }
        }
      } else {
        setError("Product not found.");
        Alert.alert("Error", "Product not found.");
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching product data.");
      Alert.alert("Error", err.message || "An error occurred while fetching product data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setScanned(false);
    setProductData(null);
    setError(null);
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

  const handleClose = () => {
    navigation.navigate("Home"); // Ensure "Home" is the correct route name
  };

  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color="#0FBD83" />
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>No access to camera.</Text>
        <TouchableOpacity
          onPress={() =>
            Camera.requestCameraPermissionsAsync().then(({ status }) =>
              setHasPermission(status === "granted")
            )
          }
          style={styles.permissionButton}
        >
          <Text style={styles.permissionButtonText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <Ionicons name="close" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Camera View */}
      <CameraView
        ref={cameraRef}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["upc_a", "ean8", "ean13"],
        }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Overlay with Scan Box */}
      <View style={styles.overlay}>
        <View style={styles.scanBox} />
        <Text style={styles.scanInstruction}>Align the barcode within the frame to scan</Text>
      </View>

      {/* Packaging Information Modal */}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={closeModal}
        onBackButtonPress={closeModal}
        style={styles.modal}
        swipeDirection={["down"]}
        onSwipeComplete={closeModal}
        propagateSwipe
        scrollTo={handleScrollTo}
        scrollOffset={scrollOffset}
        scrollOffsetMax={scrollOffsetMax}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHandle} />
          </View>
          <ScrollView
            contentContainerStyle={styles.modalBody}
            ref={scrollViewRef}
            onScroll={handleOnScroll}
            scrollEventThrottle={16}
            onContentSizeChange={(w, h) => setContentHeight(h)}
            onLayout={(event) => setScrollViewHeight(event.nativeEvent.layout.height)}
          >
            {/* Product Information */}
            <View style={[styles.section, styles.productSection]}>
              <Text style={styles.productName}>
                {productData?.product_name || "Unknown Product"}
              </Text>
              {productData?.brands && <Text style={styles.brandName}>{productData.brands}</Text>}
            </View>

            {/* Recycling Information */}
            <View style={[styles.section, styles.recyclingSection]}>
              <Text style={styles.sectionTitle}>
                <SvgXml xml={recyclingIcon} /> Recycling Information
              </Text>
              {productData?.packagings && productData.packagings.length > 0 ? (
                productData.packagings.map((packaging, index) => (
                  <View key={index} style={styles.packagingInfo}>
                    {packaging.material && (
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Material:</Text>
                        <Text style={styles.infoText}>{packaging.material.id}</Text>
                      </View>
                    )}
                    {packaging.recycling && (
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Recycling:</Text>
                        <Text style={styles.infoText}>{packaging.recycling.id}</Text>
                      </View>
                    )}
                    {packaging.shape && (
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Shape:</Text>
                        <Text style={styles.infoText}>{packaging.shape.id}</Text>
                      </View>
                    )}
                    {packaging.weight_measured && (
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Weight:</Text>
                        <Text style={styles.infoText}>{packaging.weight_measured}g</Text>
                      </View>
                    )}
                  </View>
                ))
              ) : (
                <Text style={styles.noPackagingText}>No recycling information available.</Text>
              )}
            </View>

            {/* Ecoscore */}
            {productData?.ecoscore_grade && (
              <View style={[styles.section, styles.ecoscoreSection]}>
                <Text style={styles.sectionTitle}>
                  <Ionicons name="leaf" size={24} color="#0FBD83" /> Ecoscore
                </Text>
                <View style={styles.ecoscoreContainer}>
                  <Text style={styles.ecoscoreGrade}>
                    Grade: {productData.ecoscore_grade.toUpperCase()}
                  </Text>
                  <Text style={styles.ecoscoreScore}>Score: {productData.ecoscore_score}</Text>
                </View>
              </View>
            )}

            {/* Additional Information */}
            <View style={[styles.section, styles.additionalInfoSection]}>
              {productData?.categories && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Categories:</Text>
                  <Text style={styles.infoText}>{productData.categories}</Text>
                </View>
              )}
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Barcode:</Text>
                <Text style={styles.infoText}>{productData?.code}</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000", // Ensures the background is black behind the camera
  },
  closeButton: {
    position: "absolute",
    top: 80, // Adjust based on status bar height
    left: 30,
    zIndex: 10,
    backgroundColor: "rgba(15, 189, 131, 0.7)",
    borderRadius: 25,
    padding: 8,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 20,
    backgroundColor: "#fff",
  },
  permissionText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginTop: 10,
    fontFamily: "NunitoSans",
  },
  permissionButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 25,
    backgroundColor: "#0FBD83",
    borderRadius: 25,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "NunitoSansBold",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  scanBox: {
    width: width * 0.7,
    height: width * 0.5,
    borderWidth: 4,
    borderColor: "#0FBD83",
    borderRadius: 20,
    backgroundColor: "rgba(15, 189, 131, 0.2)",
  },
  scanInstruction: {
    paddingHorizontal: 10,
    marginTop: 20,
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    fontFamily: "NunitoSansBold",
  },
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContent: {
    height: height * 0.7,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    paddingHorizontal: 20,
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
  modalBody: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  productSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  productName: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "NunitoSansBold",
    textAlign: "center",
  },
  brandName: {
    fontSize: 18,
    color: "#666",
    fontFamily: "NunitoSans",
    textAlign: "center",
    marginTop: 5,
  },
  recyclingSection: {
    borderWidth: 1,
    borderColor: "#d9d9d9",
    padding: 20,
    borderRadius: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0FBD83",
    marginBottom: 15,
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
  noPackagingText: {
    fontSize: 16,
    color: "#555",
    fontFamily: "NunitoSans",
  },
  ecoscoreSection: {
    backgroundColor: "#edf7f2",
    padding: 20,
    borderRadius: 15,
  },
  ecoscoreContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  ecoscoreGrade: {
    fontSize: 18,
    color: "#000",
    fontWeight: "bold",
    fontFamily: "NunitoSansBold",
  },
  ecoscoreScore: {
    fontSize: 18,
    color: "#000",
    fontWeight: "bold",
    fontFamily: "NunitoSansBold",
  },
  additionalInfoSection: {
    padding: 20,
    borderRadius: 15,
    backgroundColor: "#fff5e6",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 10,
    fontFamily: "NunitoSans",
  },
  errorContainer: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: "rgba(255, 0, 0, 0.8)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: "center",
    zIndex: 10,
  },
  errorText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    fontFamily: "NunitoSans",
  },
});
