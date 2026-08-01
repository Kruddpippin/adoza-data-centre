import { forwardRef, type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
  type PressableProps,
  type TextInputProps,
  type ViewProps,
} from "react-native";

/* ---------------- Button ---------------- */
const buttonVariants = {
  default: "bg-primary",
  destructive: "bg-destructive",
  outline: "border border-input bg-card",
  secondary: "bg-secondary",
  ghost: "bg-transparent",
};
const buttonTextVariants = {
  default: "text-primary-foreground",
  destructive: "text-destructive-foreground",
  outline: "text-foreground",
  secondary: "text-secondary-foreground",
  ghost: "text-foreground",
};

type ButtonProps = PressableProps & {
  variant?: keyof typeof buttonVariants;
  loading?: boolean;
  children: ReactNode;
  className?: string;
};

export function Button({ variant = "default", loading, disabled, children, className = "", ...props }: ButtonProps) {
  return (
    <Pressable
      disabled={disabled || loading}
      className={`h-11 flex-row items-center justify-center gap-2 rounded-lg px-4 ${buttonVariants[variant]} ${
        disabled || loading ? "opacity-50" : ""
      } ${className}`}
      {...props}
    >
      {loading && <ActivityIndicator size="small" />}
      {typeof children === "string" ? (
        <Text className={`text-sm font-semibold ${buttonTextVariants[variant]}`}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

/* ---------------- Card ---------------- */
export function Card({ className = "", ...props }: ViewProps & { className?: string }) {
  return <View className={`rounded-xl border border-border bg-card p-4 ${className}`} {...props} />;
}

/* ---------------- Input ---------------- */
export const Input = forwardRef<TextInput, TextInputProps & { className?: string }>(function Input(
  { className = "", ...props },
  ref
) {
  return (
    <TextInput
      ref={ref}
      placeholderTextColor="#8a9a94"
      className={`h-11 rounded-lg border border-input bg-card px-3 text-sm text-foreground ${className}`}
      {...props}
    />
  );
});

/* ---------------- Field ---------------- */
export function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <View className="gap-1.5">
      <Text className="text-xs font-medium text-muted-foreground">
        {label} {required && <Text className="text-destructive">*</Text>}
      </Text>
      {children}
      {error ? <Text className="text-[11px] font-medium text-destructive">{error}</Text> : null}
    </View>
  );
}

/* ---------------- Badge ---------------- */
export function Badge({ label, bg, fg }: { label: string; bg: string; fg: string }) {
  return (
    <View className="self-start rounded-full px-2 py-0.5" style={{ backgroundColor: bg }}>
      <Text className="text-[11px] font-medium" style={{ color: fg }}>
        {label}
      </Text>
    </View>
  );
}

/* ---------------- Spinner / Empty / Error states ---------------- */
export function Spinner() {
  return (
    <View className="flex-1 items-center justify-center py-16">
      <ActivityIndicator size="large" color="#1a5c3a" />
    </View>
  );
}

export function EmptyState({ title, message }: { title: string; message?: string }) {
  return (
    <View className="items-center justify-center gap-1 py-14">
      <Text className="text-sm font-semibold text-foreground">{title}</Text>
      {message ? <Text className="max-w-xs text-center text-xs text-muted-foreground">{message}</Text> : null}
    </View>
  );
}

export function ErrorState({
  message = "Something went wrong loading data.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center gap-3 py-14">
      <Text className="text-sm text-destructive">{message}</Text>
      {onRetry ? (
        <Button variant="outline" onPress={onRetry} className="h-9 px-4">
          Try again
        </Button>
      ) : null}
    </View>
  );
}
