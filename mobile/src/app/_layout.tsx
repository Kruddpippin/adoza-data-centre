import "@/global.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Button, Spinner } from "@/components/ui";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

function RootNavigator() {
  const { session, profile, profileError, profileErrorCode, loading, signOut } = useAuth();

  if (loading) return <Spinner />;

  if (session && profileError) {
    const isNotStaff = profileErrorCode === "PGRST116";
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-background px-6">
        <Text className="text-center text-base font-semibold text-foreground">
          {isNotStaff ? "Access restricted" : "Couldn't load your profile"}
        </Text>
        <Text className="text-center text-sm text-muted-foreground">{profileError}</Text>
        <Button onPress={() => signOut()}>{isNotStaff ? "Sign out" : "Sign out and try again"}</Button>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!session && !!profile}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={!session || !profile}>
        <Stack.Screen name="login" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <StatusBar style="dark" />
          <RootNavigator />
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
