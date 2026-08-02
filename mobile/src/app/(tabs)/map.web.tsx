import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// react-native-maps has no web renderer, so this platform-specific file
// (Metro prefers *.web.tsx over *.tsx when bundling for web) replaces the
// native map with a simple notice instead of crashing the whole app.
export default function FieldMapWebFallback() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center gap-3 bg-background p-6">
      <Ionicons name="phone-portrait-outline" size={32} color="#6b7a75" />
      <Text className="text-center text-sm font-semibold text-foreground">Field Map isn't available on web</Text>
      <Text className="max-w-xs text-center text-xs text-muted-foreground">
        Open this app in Expo Go on an iOS or Android device to view GPS-plotted candidate registrations on the map.
      </Text>
    </SafeAreaView>
  );
}
