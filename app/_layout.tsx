import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitle: "SnapScheduli",
        headerStyle: {
          backgroundColor: "#f5f5f5",
        },
        headerTintColor: "#333",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    />
  );
}