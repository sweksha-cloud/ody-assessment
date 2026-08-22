import { NavLink, Text, TopNav } from "@odyssey/ui";
import { Link, usePathname } from "expo-router";

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
    <TopNav brand={<Text variant="h3">🍊 Odyssey</Text>}>
      {NAV_ITEMS.map((item) => (
        <Link key={item.href} href={item.href} asChild>
          <NavLink label={item.label} active={pathname === item.href} />
        </Link>
      ))}
    </TopNav>
  );
}
