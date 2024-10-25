import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SvgXml } from "react-native-svg"; // For inline SVGs

import HomeScreen from "../screens/HomeScreen";
import ScanScreen from "../screens/ScanScreen";
import LocationsScreen from "../screens/LocationsScreen";
import LearnScreen from "../screens/LearnScreen";
import HistoryScreen from "../screens/HistoryScreen";

// Define your SVG XML strings
const homeIconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24"><path d="M9.002 16.999 9 21.001A1 1 0 0 1 8 22H5a2 2 0 0 1-2-2v-9.935a2 2 0 0 1 .762-1.57l7-5.519a2 2 0 0 1 2.476 0l7 5.518A2 2 0 0 1 21 10.065V20a2 2 0 0 1-2 2h-3a1 1 0 0 1-1-1v-4a2 2 0 0 0-2-2h-1.998a2 2 0 0 0-2 1.999" stroke="#b3b3b3" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
`;

const homeIconActiveSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" color="#0FBD83"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.298 2.387a2.75 2.75 0 0 1 3.405 0l7 5.519a2.75 2.75 0 0 1 1.047 2.16V20A2.75 2.75 0 0 1 19 22.75h-3A1.75 1.75 0 0 1 14.25 21v-4c0-.69-.56-1.25-1.25-1.25h-1.998c-.69 0-1.25.56-1.25 1.25l-.002 4A1.75 1.75 0 0 1 8 22.751H5A2.75 2.75 0 0 1 2.25 20v-9.936a2.75 2.75 0 0 1 1.047-2.16z" fill="#0FBD83"/></svg>
`;

const scanIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M2 4v16M5 4v16M15 4v16m-7-2V6c0-.943 0-1.414.293-1.707S9.057 4 10 4s1.414 0 1.707.293S12 5.057 12 6v12c0 .943 0 1.414-.293 1.707S10.943 20 10 20s-1.414 0-1.707-.293S8 18.943 8 18m10 0V6c0-.943 0-1.414.293-1.707S19.057 4 20 4s1.414 0 1.707.293S22 5.057 22 6v12c0 .943 0 1.414-.293 1.707S20.943 20 20 20s-1.414 0-1.707-.293S18 18.943 18 18" stroke="#b3b3b3" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const scanIconActiveSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10.08 3.25h.09c.433 0 .83 0 1.152.043.356.048.731.16 1.04.47s.422.684.47 1.04c.043.323.043.72.043 1.152v12.09c0 .433 0 .83-.043 1.152-.048.356-.16.731-.47 1.04s-.684.422-1.04.47c-.323.043-.72.043-1.152.043h-.09c-.433 0-.83 0-1.152-.043-.356-.048-.731-.16-1.04-.47s-.422-.684-.47-1.04c-.043-.323-.043-.72-.043-1.152V5.955c0-.433 0-.83.043-1.152.048-.356.16-.731.47-1.04s.684-.422 1.04-.47c.323-.043.72-.043 1.152-.043" fill="#0FBD83"/><path fill-rule="evenodd" clip-rule="evenodd" d="M2.125 3.25c.552 0 1 .435 1 .972v15.556c0 .537-.448.972-1 .972s-1-.435-1-.972V4.222c0-.537.448-.972 1-.972m3 0c.552 0 1 .435 1 .972v15.556c0 .537-.448.972-1 .972s-1-.435-1-.972V4.222c0-.537.448-.972 1-.972m10 0c.552 0 1 .435 1 .972v15.556c0 .537-.448.972-1 .972s-1-.435-1-.972V4.222c0-.537.448-.972 1-.972" fill="#0FBD83"/><path d="M20.08 3.25h.09c.433 0 .83 0 1.152.043.356.048.731.16 1.04.47s.422.684.47 1.04c.043.323.043.72.043 1.152v12.09c0 .433 0 .83-.043 1.152-.048.356-.16.731-.47 1.04s-.684.422-1.04.47c-.323.043-.72.043-1.152.043h-.09c-.433 0-.83 0-1.152-.043-.356-.048-.731-.16-1.04-.47s-.422-.684-.47-1.04c-.043-.323-.043-.72-.043-1.152V5.955c0-.433 0-.83.043-1.152.048-.356.16-.731.47-1.04s.684-.422 1.04-.47c.323-.043.72-.043 1.152-.043" fill="#0FBD83"/></svg>`;

const locationsIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none"><path d="M13.618 21.367A2.37 2.37 0 0 1 12 22a2.37 2.37 0 0 1-1.617-.633C6.412 17.626 1.09 13.447 3.685 7.38 5.09 4.1 8.458 2 12.001 2s6.912 2.1 8.315 5.38c2.592 6.06-2.717 10.259-6.698 13.987Z" stroke="#b3b3b3" stroke-width="1.5"/><path d="M15.5 11a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" stroke="#b3b3b3" stroke-width="1.5"/></svg>`;
const locationsIconActiveSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" ><path fill-rule="evenodd" clip-rule="evenodd" d="M12.002 1.25c-3.827 0-7.477 2.263-9.005 5.835-1.422 3.324-.652 6.152.95 8.574 1.315 1.986 3.231 3.759 4.96 5.358h.001q.496.458.963.896l.001.002a3.12 3.12 0 0 0 2.13.835c.79 0 1.554-.297 2.129-.836q.441-.412.908-.84c1.748-1.611 3.691-3.402 5.02-5.413 1.6-2.425 2.367-5.256.947-8.576-1.528-3.572-5.178-5.835-9.004-5.835M12 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8" fill="#0FBD83"/></svg>`;

const historyIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="none">
    <circle cx="12" cy="12" r="10" stroke="#b3b3b3" stroke-width="1.5" />
    <path d="M12 8V12L14 14" stroke="#b3b3b3" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
</svg>`;
const historyIconActiveSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 1.25C6.063 1.25 1.25 6.063 1.25 12S6.063 22.75 12 22.75 22.75 17.937 22.75 12 17.937 1.25 12 1.25M13 8a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l2 2a1 1 0 0 0 1.414-1.414L13 11.586z" fill="#0FBD83"/></svg>`;

const learnIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none"><path d="M5.98 3.285c3.342.637 5.333 1.967 6.02 2.731.687-.764 2.678-2.094 6.02-2.73 1.692-.323 2.538-.484 3.26.134.72.617.72 1.62.72 3.626v7.209c0 1.834 0 2.751-.463 3.324-.462.572-1.48.766-3.518 1.154-1.815.346-3.232.896-4.258 1.45-1.01.545-1.514.817-1.761.817s-.752-.272-1.76-.817c-1.027-.553-2.444-1.104-4.26-1.45-2.036-.388-3.055-.582-3.517-1.154C2 17.006 2 16.089 2 14.255V7.046c0-2.006 0-3.009.72-3.626.722-.618 1.568-.457 3.26-.135" stroke="#b3b3b3" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 6v15" stroke="#b3b3b3" stroke-width="1.5" stroke-linecap="round"/></svg>`;
const learnIconActiveSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="m6.058 2.54.063.013c1.984.383 3.54 1.011 4.662 1.653.221.126.332.19.4.306.067.117.067.253.067.525V21.63c0 .088-.09.147-.17.108-.299-.146-.69-.36-1.178-.627l-.019-.01c-.956-.523-2.3-1.056-4.043-1.393l-.042-.008c-.983-.19-1.777-.343-2.38-.525-.608-.183-1.16-.432-1.539-.906-.363-.456-.503-1.004-.567-1.6-.062-.58-.062-1.311-.062-2.203V7.053c0-.966 0-1.778.099-2.423.106-.694.341-1.3.884-1.771C2.76 2.4 3.34 2.246 3.99 2.25c.582.004 1.275.138 2.067.29m6.76 1.972c.067-.116.178-.18.4-.306 1.12-.642 2.677-1.27 4.661-1.653l.063-.012c.792-.153 1.485-.287 2.067-.29.65-.005 1.23.149 1.758.608.543.471.777 1.077.884 1.77.1.646.099 1.458.099 2.424v7.413c0 .892 0 1.624-.062 2.202-.064.597-.204 1.145-.567 1.601-.378.474-.931.723-1.538.906-.604.182-1.399.336-2.382.525l-.041.008c-1.743.337-3.087.87-4.043 1.393l-.019.01c-.488.267-.88.481-1.178.627a.118.118 0 0 1-.17-.108V5.037c0-.272 0-.408.068-.525" fill="#0FBD83"/></svg>`;
// StaticTabBarIcon Component
const StaticTabBarIcon = ({ svgXmlData, size }) => {
  return <SvgXml xml={svgXmlData} width={size} height={size} fill="#ffffff" />;
};

const Tab = createBottomTabNavigator();

const MainTabNavigator = ({ user }) => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false, // Hide header for tab screens
        tabBarIcon: ({ focused, size }) => {
          let iconSvg;

          switch (route.name) {
            case "Home":
              iconSvg = focused ? homeIconActiveSvg : homeIconSvg;
              break;
            case "Scan":
              iconSvg = focused ? scanIconActiveSvg : scanIconSvg;
              break;
            case "Locations":
              iconSvg = focused ? locationsIconActiveSvg : locationsIconSvg;
              break;
            case "History":
              iconSvg = focused ? historyIconActiveSvg : historyIconSvg;
              break;
            case "Learn":
              iconSvg = focused ? learnIconActiveSvg : learnIconSvg;
              break;
            default:
              iconSvg = ""; // Fallback SVG or empty string
          }

          return <StaticTabBarIcon svgXmlData={iconSvg} size={size} />;
        },
        tabBarActiveTintColor: "#0FBD83",
        tabBarInactiveTintColor: "#b3b3b3",
        tabBarStyle: {
          paddingBottom: 35,
          paddingTop: 10,
          height: 90,
          backgroundColor: "#ffffff",
          borderTopRightRadius: 40,
          borderTopLeftRadius: 40,
          borderTopWidth: 1,
          borderTopColor: "#d9d9d9",
          position: "absolute",
          borderColor: "#d9d9d9",
          borderWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: "NunitoSansBold",
        },
      })}
    >
      <Tab.Screen name="Home">{(props) => <HomeScreen {...props} user={user} />}</Tab.Screen>
      <Tab.Screen name="Learn" component={LearnScreen} />
      <Tab.Screen name="Scan" component={ScanScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Locations" component={LocationsScreen} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
