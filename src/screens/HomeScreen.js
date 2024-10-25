// src/screens/HomeScreen.js

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
  Dimensions,
} from "react-native";
import { auth, db } from "../../firebase";
import { Ionicons } from "@expo/vector-icons";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  limit,
  onSnapshot,
} from "firebase/firestore";
import * as Animatable from "react-native-animatable";
import { BarChart } from "react-native-gifted-charts"; // Import BarChart
import { SvgXml } from "react-native-svg";

const screenWidth = Dimensions.get("window").width;

// Define SVG XML strings
const ribbonSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#1976d2" d="M39 43h-6.79l-3.89 4.85L21.92 33h12.47z"/><path fill="#1e88e5" d="m27.18 33-6.5 14.85L16.79 43H10l4.61-10z"/><path fill="#ffa000" d="M40.325 22.596a3.31 3.31 0 0 1 0-3.191l.262-.476a3.31 3.31 0 0 0-1.187-4.428l-.465-.282a3.31 3.31 0 0 1-1.596-2.763l-.012-.544a3.31 3.31 0 0 0-3.241-3.241l-.544-.012a3.3 3.3 0 0 1-2.763-1.596l-.282-.465a3.31 3.31 0 0 0-4.428-1.187l-.476.262a3.31 3.31 0 0 1-3.191 0l-.475-.261A3.31 3.31 0 0 0 17.5 5.599l-.282.465a3.31 3.31 0 0 1-2.763 1.596l-.544.012a3.31 3.31 0 0 0-3.241 3.241l-.012.544a3.3 3.3 0 0 1-1.596 2.763l-.465.282A3.31 3.31 0 0 0 7.41 18.93l.262.476a3.31 3.31 0 0 1 0 3.191l-.261.475A3.31 3.31 0 0 0 8.598 27.5l.465.282a3.31 3.31 0 0 1 1.596 2.763l.012.544a3.31 3.31 0 0 0 3.241 3.241l.544.012a3.3 3.3 0 0 1 2.763 1.596l.282.465a3.31 3.31 0 0 0 4.428 1.187l.476-.262a3.31 3.31 0 0 1 3.191 0l.476.262a3.31 3.31 0 0 0 4.428-1.187l.282-.465a3.31 3.31 0 0 1 2.763-1.596l.544-.012a3.31 3.31 0 0 0 3.241-3.241l.012-.544a3.3 3.3 0 0 1 1.596-2.763l.465-.282a3.31 3.31 0 0 0 1.187-4.428z"/><path fill="#ffb300" d="M23.999 9a12 12 0 1 0 0 24 12 12 0 1 0 0-24"/><path fill="#ffca28" d="M24 34.001c-7.168 0-13-5.832-13-13S16.831 8 24 8s13 5.832 13 13-5.832 13.001-13 13.001M24 10c-6.066 0-11 4.935-11 11s4.935 11 11 11 11-4.935 11-11-4.935-11-11-11"/></svg>
`;

const leafSvg = `
<svg xmlns="http://www.w3.org/2000/svg" baseProfile="basic" viewBox="0 0 64 64"><path fill="#cd2e42" d="M25 18h-6l1.793-7.275a1 1 0 0 1 .961-.725h.491c.446 0 .839.296.962.725zM15 37h14V23a2 2 0 0 0-2-2H17a2 2 0 0 0-2 2z"/><path fill="#fd3c4f" d="M27 21H17a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1"/><path fill="#ffce29" d="M39 42H27V14c0-5 2.686-10 6-10s6 5 6 10z"/><path fill="orange" d="M31.5 15c-.311 0-.618-.064-.877-.189-.391-.188-.623-.489-.623-.811 0-.763.848-2.242 4.026-2.948a2.14 2.14 0 0 1 1.351.137c.391.188.623.49.623.811 0 .763-.848 2.242-4.026 2.948A2.2 2.2 0 0 1 31.5 15m0 7c-.311 0-.618-.064-.877-.189-.391-.188-.623-.489-.623-.811 0-.763.848-2.242 4.026-2.948a2.14 2.14 0 0 1 1.351.137c.391.188.623.49.623.811 0 .763-.848 2.242-4.026 2.948A2.2 2.2 0 0 1 31.5 22"/><path fill="#a0effe" d="M46 19.114V14h-7v5.114c0 1.208-.48 2.366-1.334 3.22l-.555.555A7.2 7.2 0 0 0 35 27.986V36h15v-8.014a7.2 7.2 0 0 0-2.111-5.097l-.555-.555A4.55 4.55 0 0 1 46 19.114"/><path fill="#008aa9" d="M46 17h-7a2 2 0 1 1 0-4h7a2 2 0 1 1 0 4"/><path fill="#bd6300" d="M46.004 55H18.097a6 6 0 0 1-5.911-4.972L9.05 32h46l-3.135 18.028A6 6 0 0 1 46.004 55"/><path fill="orange" d="M54.55 34h-45a2.5 2.5 0 1 1 0-5h45a2.5 2.5 0 1 1 0 5"/><path fill="orange" d="M54.55 29h-45a2.5 2.5 0 1 0 0 5h45a2.5 2.5 0 1 0 0-5"/></svg>
`;

const trophySvg = `
<svg xmlns="http://www.w3.org/2000/svg" baseProfile="basic" viewBox="0 0 64 64"><path fill="orange" d="M15 41a3 3 0 0 1-3-3c0-.638-1.055-1.354-2.664-2.373C6.813 34.029 3 31.614 3 26.5c0-5.238 4.262-9.5 9.5-9.5s9.5 4.262 9.5 9.5a3 3 0 1 1-6 0c0-1.93-1.57-3.5-3.5-3.5S9 24.57 9 26.5c0 1.648 1.026 2.462 3.547 4.059C14.849 32.017 18 34.013 18 38a3 3 0 0 1-3 3m34 0a3 3 0 0 1-3-3c0-3.987 3.151-5.983 5.453-7.441C53.974 28.962 55 28.148 55 26.5c0-1.93-1.57-3.5-3.5-3.5S48 24.57 48 26.5a3 3 0 1 1-6 0c0-5.238 4.262-9.5 9.5-9.5s9.5 4.262 9.5 9.5c0 5.114-3.813 7.529-6.336 9.127C53.055 36.646 52 37.362 52 38a3 3 0 0 1-3 3"/><path fill="#ffce29" d="M32 47c-8.837 0-16-7.163-16-16V10h32v21c0 8.837-7.163 16-16 16"/><path fill="orange" d="M48.5 14h-33a2.5 2.5 0 1 1 0-5h33a2.5 2.5 0 1 1 0 5"/><path fill="#ffce29" d="M28 42h8v13h-8z"/><path fill="orange" d="M42.5 56h-21a2.5 2.5 0 1 1 0-5h21a2.5 2.5 0 1 1 0 5"/></svg>
`;

const flameSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path fill="#DD2C00" d="M39 28c0 8.395-6.606 15-15.001 15S9 36.395 9 28 22.479 12.6 20.959 5C24 5 39 15.841 39 28"/><path fill="#FF5722" d="M33 32c0-7.599-9-15-9-15 0 6.08-9 8.921-9 15 0 5.036 3.963 9 9 9s9-3.964 9-9"/><path fill="#FFC107" d="M18.999 35.406C19 32 24 30.051 24 27c0 0 4.999 3.832 4.999 8.406 0 2.525-2.237 4.574-5 4.574s-5.001-2.048-5-4.574"/></svg>
`;

const profileSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 1.25C6.063 1.25 1.25 6.063 1.25 12S6.063 22.75 12 22.75 22.75 17.937 22.75 12 17.937 1.25 12 1.25m-.008 5A3.25 3.25 0 0 0 8.738 9.5a3.25 3.25 0 0 0 3.254 3.25 3.25 3.25 0 0 0 3.253-3.25 3.25 3.25 0 0 0-3.253-3.25m.008 8a7.95 7.95 0 0 0-5.52 2.209.75.75 0 0 0 0 1.082A7.95 7.95 0 0 0 12 19.75a7.95 7.95 0 0 0 5.52-2.209.75.75 0 0 0 0-1.082A7.95 7.95 0 0 0 12 14.25" fill="#0FBD83"/></svg>`;

const welcomeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#c77600" d="m17.51 16.51 8.715-8.285.002-.003.003-.002s.776-.719 1.363-1.143c4.299-3.096 10.323-2.722 14.19 1.145s4.241 9.892 1.145 14.191c-.423.588-1.143 1.364-1.143 1.364l-.002.002-.002.002-9.001 9.001z"/><path fill="#ffb74d" d="M40.323 26.767 21.781 8.224l-.002-.003-.003-.002S21 7.5 20.413 7.076C16.114 3.98 10.09 4.354 6.223 8.221s-4.241 9.892-1.145 14.191C5.5 23 6.22 23.776 6.22 23.776l.002.002.002.002 18.633 18.633c.39.391.902.586 1.414.586.56 0 1.121-.234 1.522-.703.693-.81.556-2.047-.198-2.801l.026.026a.999.999 0 1 1 1.414-1.414l.063.063c.39.391.902.586 1.414.586.56 0 1.121-.234 1.522-.703.693-.81.556-2.047-.198-2.801l.026.026a.999.999 0 1 1 1.414-1.414l.063.063c.39.391.902.586 1.414.586.56 0 1.121-.234 1.522-.703.693-.81.556-2.047-.198-2.801l.026.026a.999.999 0 1 1 1.414-1.414l.063.063c.39.391.902.586 1.414.586.56 0 1.121-.234 1.522-.703.697-.81.561-2.047-.193-2.8"/><path fill="#ffb74d" d="M40.52 29.57c-.4.47-.96.7-1.52.7l1.32-3.5c.76.75.89 1.99.2 2.8"/><path fill="#c77600" d="M26.225 8.224s-8.196 7.782-10.917 10.387a.96.96 0 0 0-.308.702c0 .429 1.023 1.684 3.718 1.684 1.591 0 3.443-.54 4.766-1.604l7.768-6.143zm-6.464 28.037a2.482 2.482 0 1 0-3.511-3.511l-1.5 1.5a2.482 2.482 0 1 0 3.511 3.511z"/><path fill="#ebae55" d="m16.43 33.99.53-.53c.28-.28.65-.44 1.05-.44.39 0 .76.16 1.04.44.58.58.58 1.52 0 2.09l-.53.53z"/><path fill="#c77600" d="M16.25 32.75a2.482 2.482 0 1 0-3.511-3.511l-1.5 1.5a2.482 2.482 0 1 0 3.511 3.511z"/><path fill="#ebae55" d="m12.92 30.48.53-.53c.28-.28.65-.44 1.04-.44.4 0 .77.16 1.05.44s.44.65.44 1.04c0 .4-.16.77-.44 1.05l-.53.53z"/><path fill="#c77600" d="M12.739 29.239a2.482 2.482 0 1 0-3.511-3.511l-1.5 1.5a2.482 2.482 0 1 0 3.511 3.511z"/><path fill="#ebae55" d="m9.4 26.96.53-.53c.29-.28.67-.43 1.05-.43s.76.15 1.05.43c.58.58.58 1.52 0 2.1l-.53.53z"/><path fill="#c77600" d="M23.273 36.261a2.48 2.48 0 0 0-3.511 0l-1.5 1.5a2.482 2.482 0 1 0 3.511 3.511l1.5-1.5a2.484 2.484 0 0 0 0-3.511"/><path fill="#ebae55" d="m19.94 37.5.53-.53c.29-.29.67-.44 1.05-.44s.76.15 1.05.44c.57.58.57 1.52 0 2.1l-.53.53z"/></svg>`;

const HomeScreen = ({ navigation, user }) => {
  const [userData, setUserData] = useState(null);
  const [recyclingData, setRecyclingData] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [achievements, setAchievements] = useState([]); // State for achievements
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch User Data
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          Alert.alert("Error", "User data not found.");
          setLoading(false);
          return;
        }

        // Fetch Recycling Data (Past 7 Days)
        const recyclingCollectionRef = collection(db, "users", user.uid, "recyclingData");

        // Define days of the week from Sunday to Saturday
        const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        // Get the current date and find the Sunday of the current week
        const today = new Date();
        const currentDay = today.getDay(); // 0 (Sun) to 6 (Sat)
        const sunday = new Date(today);
        sunday.setDate(today.getDate() - currentDay);
        sunday.setHours(0, 0, 0, 0); // Reset time

        // Create a list of dates from Sunday to Saturday
        const weekDates = [];
        for (let i = 0; i < 7; i++) {
          const date = new Date(sunday);
          date.setDate(sunday.getDate() + i);
          weekDates.push(date);
        }

        // Query recycling data for the past 7 days
        const recyclingQuery = query(
          recyclingCollectionRef,
          where("date", ">=", sunday),
          orderBy("date", "asc")
        );

        const recyclingSnapshot = await getDocs(recyclingQuery);
        const recyclingMap = {};

        // Initialize recyclingMap with all days set to 0
        daysOfWeek.forEach((day) => {
          recyclingMap[day] = 0;
        });

        // Populate recyclingMap with actual data
        recyclingSnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const date = data.date.toDate(); // Assuming 'date' is a Firestore Timestamp
          const dayLabel = daysOfWeek[date.getDay()];
          if (recyclingMap.hasOwnProperty(dayLabel)) {
            recyclingMap[dayLabel] += data.recycledCount; // Assuming 'recycledCount' field
          }
        });

        // Convert recyclingMap to an array suitable for the chart, ensuring Sun to Sat order
        const recyclingArray = daysOfWeek.map((day) => ({
          label: day,
          value: recyclingMap[day],
        }));

        setRecyclingData(recyclingArray);

        // Fetch Leaderboard Data (Top 5 Users)
        const usersCollectionRef = collection(db, "users");
        const leaderboardQuery = query(usersCollectionRef, orderBy("points", "desc"), limit(5));
        const leaderboardSnapshot = await getDocs(leaderboardQuery);
        const topUsers = leaderboardSnapshot.docs
          .map((docSnap) => ({
            id: docSnap.id,
            name: docSnap.data().displayName || docSnap.data().email,
            points: docSnap.data().points,
          }))
          .sort((a, b) => b.points - a.points) // Explicitly sort by points descending
          .map((user, index) => ({ ...user, rank: index + 1 })); // Assign rank based on sorted order
        setLeaderboard(topUsers);

        // Fetch Achievements from Subcollection
        const achievementsCollectionRef = collection(db, "users", user.uid, "achievements");
        const achievementsSnapshot = await getDocs(achievementsCollectionRef);
        const userAchievements = achievementsSnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          title: docSnap.data().title,
          description: docSnap.data().description,
          achievedAt: docSnap.data().achievedAt.toDate(), // Assuming 'achievedAt' is a Firestore Timestamp
        }));
        setAchievements(userAchievements);
      } catch (error) {
        console.error("Error fetching data:", error);
        Alert.alert("Error", "Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();

    // Set up real-time listeners for dynamic updates
    const unsubscribeUser = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    });

    const unsubscribeLeaderboard = onSnapshot(
      query(collection(db, "users"), orderBy("points", "desc"), limit(5)),
      (snapshot) => {
        const topUsers = snapshot.docs
          .map((docSnap) => ({
            id: docSnap.id,
            name: docSnap.data().displayName || docSnap.data().email,
            points: docSnap.data().points,
          }))
          .sort((a, b) => b.points - a.points) // Explicitly sort by points descending
          .map((user, index) => ({ ...user, rank: index + 1 })); // Assign rank based on sorted order
        setLeaderboard(topUsers);
      }
    );

    const unsubscribeAchievements = onSnapshot(
      collection(db, "users", user.uid, "achievements"),
      (snapshot) => {
        const userAchievements = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          title: docSnap.data().title,
          description: docSnap.data().description,
          achievedAt: docSnap.data().achievedAt.toDate(),
        }));
        setAchievements(userAchievements);
      }
    );

    return () => {
      unsubscribeUser();
      unsubscribeLeaderboard();
      unsubscribeAchievements();
    };
  }, [user]);

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

  const navigateToProfile = () => {
    navigation.navigate("Profile");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>Hello, {userData.displayName || user.email}</Text>
            <Text style={styles.subTitle}>Let's Recycle!</Text>
          </View>
          <TouchableOpacity onPress={navigateToProfile} style={styles.profileButton}>
            <SvgXml xml={profileSvg} width={40} height={40} />
          </TouchableOpacity>
        </View>

        {/* Stats Title */}
        <Text style={styles.sectionTitle}>Your 7-Day Stats</Text>

        {/* Bar Chart for Recycling Data */}
        <View style={styles.chartContainer}>
          <BarChart
            data={recyclingData}
            barWidth={10}
            height={150}
            barBorderRadius={10} // Rounded corners
            yAxisThickness={0}
            xAxisThickness={0}
            frontColor="#0FBD83"
            hideRules
            hideYAxisText
            disableScroll
            isAnimated
            spacing={30}
            initialSpacing={15}
            noOfSections={4}
            yAxisColor="transparent"
            xAxisColor="transparent"
            maxValue={15}
          />
        </View>

        {/* User Stats - Two per Row */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <Animatable.View animation="fadeInUp" delay={300} style={styles.statCard}>
              <SvgXml xml={ribbonSvg} width={35} height={35} style={styles.statIcon} />
              <View style={styles.statTextContainer}>
                <Text style={styles.statNumber}>{userData.points}</Text>
                <Text style={styles.statLabel}>Points</Text>
              </View>
            </Animatable.View>
            <Animatable.View animation="fadeInUp" delay={400} style={styles.statCard}>
              <SvgXml xml={leafSvg} width={35} height={35} style={styles.statIcon} />
              <View style={styles.statTextContainer}>
                <Text style={styles.statNumber}>{userData.recycledItems}</Text>
                <Text style={styles.statLabel}>Recycled Items</Text>
              </View>
            </Animatable.View>
          </View>
          <View style={styles.statsRow}>
            <Animatable.View animation="fadeInUp" delay={500} style={styles.statCard}>
              <SvgXml xml={trophySvg} width={35} height={35} style={styles.statIcon} />
              <View style={styles.statTextContainer}>
                <Text style={styles.statNumber}>{achievements.length}</Text>
                <Text style={styles.statLabel}>Achievements</Text>
              </View>
            </Animatable.View>
            <Animatable.View animation="fadeInUp" delay={600} style={styles.statCard}>
              <SvgXml xml={flameSvg} width={35} height={35} style={styles.statIcon} />
              <View style={styles.statTextContainer}>
                <Text style={styles.statNumber}>{userData.streak || 0}</Text>
                <Text style={styles.statLabel}>Streak</Text>
              </View>
            </Animatable.View>
          </View>
        </View>

        {/* Daily Challenge */}
        <Animatable.View animation="fadeInUp" delay={900} style={styles.challengeContainer}>
          <View style={styles.challengeCard}>
            <Ionicons name="calendar-outline" size={24} color="#0FBD83" />
            <View style={styles.challengeTextContainer}>
              <Text style={styles.challengeTitle}>Daily Challenge</Text>
              <Text style={styles.challengeDescription}>
                Recycle 5 plastic bottles today and earn 50 points!
              </Text>
            </View>
            <TouchableOpacity
              style={styles.challengeButton}
              onPress={() => Alert.alert("Challenge Accepted", "Great job!")}
            >
              <Text style={styles.challengeButtonText}>Accept</Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>

        {/* Leaderboard */}
        <Animatable.View animation="fadeInUp" delay={700} style={styles.leaderboardContainer}>
          <Text style={styles.sectionTitle}>Leaderboard</Text>
          {leaderboard.length > 0 ? (
            leaderboard.map((leader) => {
              const isCurrentUser = leader.id === user.uid;
              return (
                <View
                  key={leader.id}
                  style={[
                    styles.leaderboardItem,
                    isCurrentUser && styles.currentUserLeaderboardItem, // Highlight if current user
                  ]}
                >
                  <Text style={[styles.leaderPosition, isCurrentUser && styles.currentUserText]}>
                    {leader.rank}.
                  </Text>
                  <Text style={[styles.leaderName, isCurrentUser && styles.currentUserText]}>
                    {leader.name}
                  </Text>
                  <Text style={[styles.leaderPoints, isCurrentUser && styles.currentUserText]}>
                    {leader.points} pts
                  </Text>
                </View>
              );
            })
          ) : (
            <Text style={styles.noLeaderboardText}>No leaderboard data available.</Text>
          )}
        </Animatable.View>

        {/* Featured Achievements */}
        <Animatable.View animation="fadeInUp" delay={800} style={styles.achievementsContainer}>
          <Text style={styles.sectionTitle}>Your Achievements</Text>
          {achievements.length > 0 ? (
            achievements.map((achievement) => (
              <View key={achievement.id} style={styles.achievementCard}>
                <SvgXml xml={welcomeSvg} width={35} height={35} />
                <View style={styles.achievementTextContainer}>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDescription}>{achievement.description}</Text>
                  <Text style={styles.achievementDate}>
                    Achieved on: {achievement.achievedAt.toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noAchievementsText}>
              No achievements yet. Start recycling to earn points!
            </Text>
          )}
        </Animatable.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // White background as per requirement
  },
  scrollContainer: {
    padding: 30,
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
    alignItems: "center",
    marginBottom: 30,
  },
  profileButton: {
    padding: 5,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 16, // Smaller font size
    color: "#666", // Gray color
    fontFamily: "NunitoSans",
    paddingBottom: 5,
  },
  subTitle: {
    fontSize: 32, // Bigger font size
    color: "#000",
    fontFamily: "NunitoSansBold",
  },
  chartTitle: {
    fontSize: 18,
    color: "#333",
    fontFamily: "NunitoSansBold",
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  chartContainer: {
    width: "100%",
    backgroundColor: "#fff",
    paddingLeft: 15,
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 16,
    borderWidth: 1, // Added border
    borderColor: "#e0e0e0", // Light gray border color
    marginBottom: 20,
    alignItems: "center",
  },
  statsContainer: {
    width: "100%",
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  statCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingHorizontal: 5,
    paddingVertical: 10,
    alignItems: "center",
    flex: 0.48, // To ensure two cards fit in a row with spacing
    borderWidth: 1, // Added border
    borderColor: "#e0e0e0", // Light gray border color
  },
  statIcon: {
    marginRight: 10,
  },
  statTextContainer: {
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0FBD83",
    fontFamily: "NunitoSansBold",
  },
  statLabel: {
    fontSize: 14,
    color: "#555",
    marginTop: 2,
    fontFamily: "NunitoSans",
  },
  currentUserLeaderboardItem: {
    backgroundColor: "#e8fdf5",
  },
  currentUserText: {
    fontFamily: "NunitoSansBold",
  },
  progressContainer: {
    width: "100%",
    alignItems: "center",
    marginVertical: 20,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
    fontFamily: "NunitoSans",
  },
  progressBarBackground: {
    width: "100%",
    height: 20,
    backgroundColor: "#e6f9f2",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#0FBD83",
  },
  progressText: {
    marginTop: 5,
    fontSize: 14,
    color: "#555",
    fontFamily: "NunitoSans",
  },
  achievementsContainer: {
    width: "100%",
    marginTop: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
    marginBottom: 15,
    fontFamily: "NunitoBold",
    alignSelf: "flex-start",
  },
  achievementCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
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
  achievementDate: {
    fontSize: 12,
    color: "#999",
    marginTop: 5,
  },
  noAchievementsText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    fontFamily: "NunitoSans",
  },
  challengeContainer: {
    width: "100%",
    marginBottom: 20,
  },
  challengeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fff4",
    padding: 15,
    borderRadius: 15,
    borderWidth: 1, // Added border
    borderColor: "#e0e0e0", // Light gray border color
  },
  challengeTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0FBD83",
    fontFamily: "NunitoSansBold",
  },
  challengeDescription: {
    fontSize: 14,
    color: "#555",
    marginTop: 3,
    fontFamily: "NunitoSans",
  },
  challengeButton: {
    backgroundColor: "#0FBD83",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  challengeButtonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "NunitoSansBold",
  },
  leaderboardContainer: {
    marginTop: 10,
    width: "100%",
    marginBottom: 20,
  },
  leaderboardItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
  },
  leaderPosition: {
    fontSize: 16,
    fontWeight: "700",
    width: 30,
    color: "#333",
    fontFamily: "NunitoSansBold",
  },
  leaderName: {
    fontSize: 16,
    flex: 1,
    color: "#333",
    fontFamily: "NunitoSans",
  },
  leaderPoints: {
    fontSize: 16,
    color: "#0FBD83",
    fontFamily: "NunitoSansBold",
  },
  signOutButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0FBD83",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  signOutText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 10,
    fontFamily: "NunitoSansBold",
  },
});
