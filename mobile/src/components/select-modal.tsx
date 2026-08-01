import { useState } from "react";
import { FlatList, Modal, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Option = { label: string; value: string };

export function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder = "Any",
}: {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        className="h-11 flex-row items-center justify-between rounded-lg border border-input bg-card px-3"
      >
        <Text className={`text-sm ${selected ? "text-foreground" : "text-muted-foreground"}`} numberOfLines={1}>
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#6b7a75" />
      </Pressable>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 justify-end bg-black/40" onPress={() => setOpen(false)}>
          <Pressable className="max-h-[70%] rounded-t-2xl bg-card p-4" onPress={(e) => e.stopPropagation()}>
            <Text className="mb-2 text-base font-bold text-foreground">{label}</Text>
            <FlatList
              data={[{ label: placeholder, value: "" }, ...options]}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                  className="flex-row items-center justify-between border-b border-border py-3"
                >
                  <Text className="text-sm text-foreground">{item.label}</Text>
                  {item.value === value ? <Ionicons name="checkmark" size={18} color="#1a5c3a" /> : null}
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
