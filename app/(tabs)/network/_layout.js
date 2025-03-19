import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="connections" />
      <Stack.Screen
        name="profile-id/[userId]"
        options={{ headerShown: true, title: "Profile" }}
      />
    </Stack>
  );
}
