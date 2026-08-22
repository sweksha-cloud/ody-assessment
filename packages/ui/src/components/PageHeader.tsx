import type { ReactNode } from "react";
import { View } from "react-native";
import { spacing } from "../tokens/spacing";
import { Text } from "./Text";

export type PageHeaderProps = {
  title: string;
  description?: string;
  // A page-level action (e.g. "New order") rendered at the header's
  // trailing edge — kept generic (not a fixed button prop) since some
  // pages have none and others need a non-Button node.
  action?: ReactNode;
};

// The title/description/(optional) primary-action row repeated at the
// top of every page. Standardizes the heading typography and the gap
// between title and description, rather than each page reproducing it.
export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing[4] }}>
      <View style={{ gap: spacing[2], flexShrink: 1 }}>
        <Text variant="display">{title}</Text>
        {description ? (
          <Text variant="body" color="secondary">
            {description}
          </Text>
        ) : null}
      </View>
      {action}
    </View>
  );
}
