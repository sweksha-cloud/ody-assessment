import { View } from "react-native";
import { colors } from "../tokens/colors";
import { spacing } from "../tokens/spacing";
import { Button } from "./Button";
import { Text } from "./Text";

export type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

export function ErrorState({ title = "Something went wrong", description, onRetry }: ErrorStateProps) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center", gap: spacing[3], padding: spacing[8] }}>
      <Text variant="h3" style={{ color: colors.danger[500] }}>
        {title}
      </Text>
      {description ? (
        <Text variant="body" color="secondary" style={{ textAlign: "center" }}>
          {description}
        </Text>
      ) : null}
      {onRetry ? (
        <View style={{ marginTop: spacing[3] }}>
          <Button label="Try again" variant="danger" onPress={onRetry} />
        </View>
      ) : null}
    </View>
  );
}
