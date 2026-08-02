import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui";
import { initialsOf, ROLE_LABELS } from "@/lib/utils";

export function AccountMenuButton() {
  const { profile, role, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-primary"
        accessibilityLabel="Account menu"
      >
        <Text className="text-xs font-semibold text-primary-foreground">{initialsOf(profile?.name)}</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 items-center justify-center bg-black/40 p-6" onPress={() => setOpen(false)}>
          <Pressable className="w-full max-w-xs gap-4 rounded-2xl bg-card p-5" onPress={(e) => e.stopPropagation()}>
            <View className="items-center gap-1">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-primary">
                <Text className="text-base font-semibold text-primary-foreground">{initialsOf(profile?.name)}</Text>
              </View>
              <Text className="mt-1 text-sm font-semibold text-foreground">{profile?.name ?? "User"}</Text>
              <Text className="text-xs text-muted-foreground">{profile?.email}</Text>
              {role ? <Text className="mt-0.5 text-[11px] font-medium text-primary">{ROLE_LABELS[role]}</Text> : null}
            </View>
            <Button
              variant="destructive"
              onPress={async () => {
                setOpen(false);
                await signOut();
              }}
            >
              Sign out
            </Button>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
