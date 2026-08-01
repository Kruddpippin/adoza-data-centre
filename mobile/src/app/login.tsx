import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "@/context/AuthContext";
import { Button, Card, Field, Input } from "@/components/ui";

const DEMO_ACCOUNTS = [
  { label: "Admin", email: "admin@adoza.ng" },
  { label: "Enumerator", email: "enumerator@adoza.ng" },
  { label: "Verifier", email: "verifier@adoza.ng" },
  { label: "Committee", email: "committee@adoza.ng" },
];

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async () => {
    setError("");
    setLoading(true);
    const { error: err } = await signIn(email.trim(), password);
    setLoading(false);
    if (err) {
      setError(err.message === "Invalid login credentials" ? "Incorrect email or password." : err.message);
    }
    // On success, the root layout's Stack.Protected guard reacts to the session change automatically.
  };

  const quickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Password123!");
    setError("");
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-center gap-6 px-5">
        <View className="items-center gap-3">
          <Image source={require("@/assets/images/kogi-logo.png")} className="h-14 w-14 rounded-full" />
          <View className="items-center">
            <Text className="text-2xl font-bold tracking-tight text-foreground">ADOZA Data Centre</Text>
            <Text className="mt-1 text-center text-sm text-muted-foreground">
              SYB Door-to-Door Youth Empowerment — Kogi State
            </Text>
          </View>
        </View>

        <Card className="gap-4 p-5">
          <Field label="Email address" required>
            <Input
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@adoza.ng"
            />
          </Field>
          <Field label="Password" required error={error}>
            <View className="relative justify-center">
              <Input
                secureTextEntry={!showPassword}
                autoComplete="current-password"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••••"
                className="pr-10"
              />
              <Pressable
                onPress={() => setShowPassword((v) => !v)}
                className="absolute right-0 h-11 w-10 items-center justify-center"
                hitSlop={8}
              >
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={18} color="#6b7a75" />
              </Pressable>
            </View>
          </Field>
          <Button onPress={submit} loading={loading}>
            Sign in
          </Button>

          <View className="mt-2 gap-2 border-t border-border pt-4">
            <Text className="text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Demo accounts
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {DEMO_ACCOUNTS.map((d) => (
                <Button key={d.email} variant="outline" className="h-9 flex-1 basis-[45%]" onPress={() => quickFill(d.email)}>
                  {d.label}
                </Button>
              ))}
            </View>
          </View>
        </Card>

        <Text className="text-center text-[11px] text-muted-foreground">
          Authorised programme staff only. Activity is audited.
        </Text>
      </View>
    </SafeAreaView>
  );
}
