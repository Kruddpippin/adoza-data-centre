import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button, Card, Field, Input } from "@/components/ui";

WebBrowser.maybeCompleteAuthSession();

const DEMO_ACCOUNTS = [
  { label: "Admin", email: "admin@adoza.ng" },
  { label: "Enumerator", email: "enumerator@adoza.ng" },
  { label: "Validator", email: "verifier@adoza.ng" },
  { label: "Committee", email: "committee@adoza.ng" },
];

// Deliberately not using the URL/URLSearchParams API here — avoids depending on
// whether this RN/Hermes version has a spec-compliant polyfill. Handles both the
// PKCE ("?code=...") and implicit ("#access_token=...&refresh_token=...") shapes.
function parseRedirectParams(url: string): Record<string, string> {
  const query = url.split(/[?#]/).slice(1).join("&");
  const params: Record<string, string> = {};
  for (const pair of query.split("&")) {
    if (!pair) continue;
    const [key, value] = pair.split("=");
    if (key) params[decodeURIComponent(key)] = decodeURIComponent(value ?? "");
  }
  return params;
}

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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

  const continueWithGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      const redirectUri = Linking.createURL("/login");
      const { data, error: startErr } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: redirectUri, skipBrowserRedirect: true },
      });
      if (startErr || !data?.url) throw startErr ?? new Error("Could not start Google sign-in.");

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
      if (result.type !== "success") return;

      const params = parseRedirectParams(result.url);
      if (params.code) {
        const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(params.code);
        if (exchangeErr) throw exchangeErr;
      } else if (params.access_token && params.refresh_token) {
        const { error: sessionErr } = await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        });
        if (sessionErr) throw sessionErr;
      } else if (params.error_description) {
        throw new Error(params.error_description);
      } else {
        throw new Error("Google sign-in did not return a session.");
      }
      // AuthContext's onAuthStateChange listener picks up the new session automatically.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
    } finally {
      setGoogleLoading(false);
    }
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
              SYB Door-to-Door Candidate Empowerment — Kogi State
            </Text>
          </View>
        </View>

        <Card className="gap-4 p-5">
          <Button variant="outline" loading={googleLoading} disabled={loading} onPress={continueWithGoogle}>
            <Ionicons name="logo-google" size={16} color="#1a5c3a" />
            <Text className="text-sm font-semibold text-foreground">Continue with Google</Text>
          </Button>

          <View className="flex-row items-center gap-3">
            <View className="h-px flex-1 bg-border" />
            <Text className="text-[11px] uppercase tracking-wider text-muted-foreground">or</Text>
            <View className="h-px flex-1 bg-border" />
          </View>

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
          <Button onPress={submit} loading={loading} disabled={googleLoading}>
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

        <Text className="text-center text-xs text-muted-foreground">
          New staff? Sign in with Google above — you'll be taken straight to the application form.
        </Text>
        <Text className="text-center text-[11px] text-muted-foreground">
          Authorised programme staff only. Activity is audited.
        </Text>
      </View>
    </SafeAreaView>
  );
}
