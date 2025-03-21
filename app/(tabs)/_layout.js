import { Tabs } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import Feather from '@expo/vector-icons/Feather';
//import Entypo from '@expo/vector-icons/Entypo';

export default function Layout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="home"
        options={{
          tabBarLabel: "Home",
          tabBarLabelStyle: { color: "#008E97" },
          headerShown: false,
          tabBarIcon: ({ focused }) =>
            focused ? (
              <Entypo name="home" size={24} color="black" />
            ) : (
              <AntDesign name="home" size={24} color="black" />
            ),
        }}
      />
      <Tabs.Screen
        name="network"
        options={{
          tabBarLabel: "Network",
          tabBarLabelStyle: { color: "#008E97" },
          headerShown: false,
          tabBarIcon: ({ focused }) =>
            focused ? (
              <Ionicons name="people" size={24} color="black" />
            ) : (
              <Ionicons name="people-outline" size={24} color="black" />
            ),
        }}
      />
<Tabs.Screen
  name="jobs"
  options={{
    tabBarLabel: "Jobs",
    tabBarLabelStyle: { color: "#008E97" },
    headerShown: false,
    tabBarIcon: ({ focused }) =>
      focused ? (
        <Entypo name="briefcase" size={24} color="black" />
      ) : (
        <Feather name="briefcase" size={24} color="black" />
      ),
  }}
/>

      <Tabs.Screen
        name="post"
        options={{
          tabBarLabel: "Post",
          tabBarLabelStyle: { color: "#008E97" },
          headerShown: false,
          tabBarIcon: ({ focused }) =>
            focused ? (
              <AntDesign name="plussquare" size={24} color="black" />
            ) : (
              <AntDesign name="plussquareo" size={24} color="black" />
            ),
        }}
      />
    </Tabs>
  );
}
