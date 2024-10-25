// src/navigation/AppNavigator.js

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OnboardScreen from "../screens/OnBoardScreen.js";
import SignUpScreen from "../screens/SignUpScreen.js";
import LoginScreen from "../screens/LoginScreen.js";
import MainTabNavigator from "./MainTabNavigator";
import ProfileScreen from "../screens/ProfileScreen"; // Import ProfileScreen

const Stack = createNativeStackNavigator();

const AppNavigator = ({ user }) => {
  return (
    <Stack.Navigator>
      {user ? (
        <>
          {/* Main Tab Navigator */}
          <Stack.Screen name="Back" options={{ headerShown: false }}>
            {(props) => <MainTabNavigator {...props} user={user} />}
          </Stack.Screen>

          {/* Profile Screen */}
          <Stack.Screen
            name="Profile"
            options={{
              title: "Profile",
              headerStyle: { backgroundColor: "#0FBD83" },
              headerTintColor: "#fff",
              headerTitleStyle: { fontFamily: "NunitoSansBold" },
            }}
          >
            {(props) => <ProfileScreen {...props} user={user} />}
          </Stack.Screen>
        </>
      ) : (
        // Authentication Screens
        <>
          <Stack.Screen name="Onboard" component={OnboardScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Signup" component={SignUpScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Signin" component={LoginScreen} options={{ headerShown: false }} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
