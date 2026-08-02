import { Stack } from "expo-router";

import { AccountMenuButton } from "@/components/account-menu";

export const unstable_settings = {
  initialRouteName: "index",
};

export default function YouthsLayout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: "#0f3d24",
        headerTitleStyle: { color: "#101a16" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Youths", headerRight: () => <AccountMenuButton /> }} />
      <Stack.Screen name="new" options={{ title: "Register Youth", presentation: "modal" }} />
      <Stack.Screen name="[id]/index" options={{ title: "Youth Detail" }} />
      <Stack.Screen name="[id]/edit" options={{ title: "Edit Youth", presentation: "modal" }} />
    </Stack>
  );
}
