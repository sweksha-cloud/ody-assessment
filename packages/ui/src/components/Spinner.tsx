import { ActivityIndicator, View } from "react-native";
import { colors } from "../tokens/colors";
import { spacing } from "../tokens/spacing";
import { Text } from "./Text";

export function Spinner({ label }: { label?: string }) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center", gap: spacing[3], padding: spacing[7] }}>
      <ActivityIndicator size="large" color={colors.brand[500]} />
      {label ? (
        <Text variant="body" color="secondary">
          {label}
        </Text>
      ) : null}
    </View>
  );
}
