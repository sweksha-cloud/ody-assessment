import { colors, layout, spacing, Text } from "@odyssey/ui";
import { Link, usePathname } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/orders", label: "Orders" },
  { href: "/menu", label: "Menu" },
  { href: "/crm", label: "Customers" },
  { href: "/settings", label: "Settings" },
  { href: "/ui-library", label: "UI Library" },
] as const;

export function NavBar() {
  const pathname = usePathname();

  return (
    <View style={{ backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <View
        style={{
          maxWidth: layout.maxContentWidth,
          width: "100%",
          alignSelf: "center",
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: layout.containerPadding,
          paddingVertical: spacing[4],
          gap: spacing[6],
        }}
      >
        <Text variant="h3">🍊 Odyssey</Text>
        <View style={{ flexDirection: "row", gap: spacing[5], flexWrap: "wrap" }}>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return <NavLink key={item.href} href={item.href} label={item.label} active={active} />;
          })}
        </View>
      </View>
    </View>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link href={href} asChild>
      <Pressable
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : hovered ? 0.85 : 1 })}
      >
        <Text
          variant="bodyMedium"
          color={active ? "primary" : "secondary"}
          style={active ? { textDecorationLine: "underline" } : undefined}
        >
          {label}
        </Text>
      </Pressable>
    </Link>
  );
}
