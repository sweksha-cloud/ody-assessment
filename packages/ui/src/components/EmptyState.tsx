import { View } from "react-native";
import { spacing } from "../tokens/spacing";
import { Button } from "./Button";
import { Text } from "./Text";

export type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center", gap: spacing[3], padding: spacing[8] }}>
      <Text variant="h3">{title}</Text>
      {description ? (
        <Text variant="body" color="secondary" style={{ textAlign: "center" }}>
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <View style={{ marginTop: spacing[3] }}>
          <Button label={actionLabel} variant="secondary" onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}
