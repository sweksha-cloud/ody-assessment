import { breakpoints, Logo, NavLink, TopNav, useHasMounted } from "@odyssey/ui";
import { Link, usePathname } from "expo-router";
import { useWindowDimensions } from "react-native";

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
  const { width } = useWindowDimensions();
  const hasMounted = useHasMounted();
  // The compact "Restaurant Ops" descriptor only fits once the nav links
  // themselves have room to breathe — a stricter threshold than TopNav's
  // own mobile/desktop collapse. Gated on hasMounted for the same reason
  // TopNav's isCompact is: this static-exported page has no real window
  // during its server render, so trusting `width` on the very first
  // client render mismatches the server-rendered markup.
  const showDescriptor = hasMounted && width >= breakpoints.lg;

  return (
    <TopNav brand={<Logo tone="dark" descriptor={showDescriptor ? "compact" : "none"} />} activeKey={pathname}>
      {NAV_ITEMS.map((item) => (
        <Link key={item.href} href={item.href} asChild>
          <NavLink label={item.label} active={pathname === item.href} />
        </Link>
      ))}
    </TopNav>
  );
}
