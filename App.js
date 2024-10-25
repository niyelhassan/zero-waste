import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ActivityIndicator, View } from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState(null);

  // Load fonts
  const [fontsLoaded] = useFonts({
    NunitoSans: require("./assets/fonts/nunito-sans.ttf"),
    NunitoSansBold: require("./assets/fonts/nunito-sans-bold.ttf"),
    NunitoSansSemi: require("./assets/fonts/nunito-sans-semi.ttf"),
    Nunito: require("./assets/fonts/nunito.ttf"),
    NunitoBold: require("./assets/fonts/nunito-bold.ttf"),
  });

  // Handle font loading and splash screen
  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Firebase Auth listener
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      setLoading(false); // Stop loading when auth state is known
    });

    return unsubscribe;
  }, []);

  // Show loading spinner while fonts or auth state is being loaded
  if (!fontsLoaded || loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Render the main app
  return (
    <NavigationContainer>
      <AppNavigator user={user} />
    </NavigationContainer>
  );
}
