import { useLocalSearchParams } from "expo-router";
import { YouthForm } from "@/components/youth-form";

export default function EditYouth() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <YouthForm youthId={id} />;
}
