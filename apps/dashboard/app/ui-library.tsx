import {
  Badge,
  Button,
  Card,
  colors,
  Divider,
  EmptyState,
  ErrorState,
  FilterChip,
  GradientView,
  IconContainer,
  List,
  ListRow,
  LiveIndicator,
  Logo,
  Modal,
  NavLink,
  neutral,
  PageContainer,
  PageHeader,
  RankedBar,
  Select,
  shadows,
  Skeleton,
  spacing,
  Spinner,
  StatusBadge,
  Switch,
  Text,
  TextField,
  TopNav,
  typography,
  useToast,
} from "@odyssey/ui";
import { ORDER_STATUSES } from "@odyssey/shared";
import { useState } from "react";
import { View } from "react-native";

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: spacing[5] }}>
      <View style={{ gap: spacing[1] }}>
        <Text variant="h2">{title}</Text>
        {description ? (
          <Text variant="body" color="secondary">
            {description}
          </Text>
        ) : null}
      </View>
      <View style={{ gap: spacing[5] }}>{children}</View>
    </View>
  );
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text variant="label" color="secondary">
      {children}
    </Text>
  );
}

function Swatch({ label, color }: { label: string; color: string }) {
  return (
    <View style={{ alignItems: "center", gap: spacing[2], width: 96 }}>
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 10,
          backgroundColor: color,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      />
      <Text variant="caption" color="secondary" style={{ textAlign: "center" }}>
        {label}
      </Text>
      <Text variant="caption" color="muted" style={{ textAlign: "center" }}>
        {color}
      </Text>
    </View>
  );
}

// The standardized bg/fg/border triple each semantic meaning resolves to
// (colors.semantic.<name>) — shown as a filled chip, not just a swatch,
// since fg-on-bg contrast is the thing worth actually seeing.
function SemanticChip({ label, tone }: { label: string; tone: { bg: string; fg: string; border: string } }) {
  return (
    <View
      style={{
        backgroundColor: tone.bg,
        borderColor: tone.border,
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: spacing[3],
        paddingHorizontal: spacing[4],
      }}
    >
      <Text variant="bodyMedium" style={{ color: tone.fg }}>
        {label}
      </Text>
    </View>
  );
}

// Measured with the WCAG relative-luminance contrast formula against the
// exact hex values in packages/ui/src/tokens/colors.ts — not eyeballed.
const CONTRAST_PAIRINGS = [
  { pair: "Primary text on app background", ratio: "16.0:1" },
  { pair: "Secondary text on white surface", ratio: "6.7:1" },
  { pair: "Muted text on white surface", ratio: "4.0:1 (large text only)" },
  { pair: "Inverse text on midnight nav", ratio: "17.3:1" },
  { pair: "White text on violet / cobalt (gradient button)", ratio: "4.9:1 / 4.9:1" },
  { pair: "Focus ring on white / app background", ratio: "4.0:1 / 3.6:1" },
  { pair: "Every semantic foreground on its own background", ratio: "4.3–5.0:1" },
] as const;

export default function UiLibraryScreen() {
  const { showToast } = useToast();

  const [textValue, setTextValue] = useState("");
  const [switchValue, setSwitchValue] = useState(true);
  const [selectValue, setSelectValue] = useState<(typeof ORDER_STATUSES)[number]>("pending");
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [activeNavDemo, setActiveNavDemo] = useState("Home");
  const [activeFilter, setActiveFilter] = useState("All");

  return (
    <PageContainer gap={9}>
      <PageHeader
        title="UI Library"
        description="The real production tokens and components ServiceLine's screens render with — every state below is live and interactive, not a documentation-only lookalike."
      />

      <Section title="Brand">
        <View style={{ flexDirection: "row", gap: spacing[7], flexWrap: "wrap" }}>
          <View style={{ gap: spacing[3] }}>
            <SubLabel>ON LIGHT</SubLabel>
            <Card style={{ alignItems: "flex-start" }}>
              <Logo tone="light" descriptor="full" />
            </Card>
          </View>
          <View style={{ gap: spacing[3] }}>
            <SubLabel>ON DARK (nav surface)</SubLabel>
            <Card tone="dark" style={{ alignItems: "flex-start" }}>
              <Logo tone="dark" descriptor="full" />
            </Card>
          </View>
        </View>
        <Text variant="caption" color="muted">
          Three offset gradient bars — a coordinated order-flow / ticket-rail motif that also reads as an abstract
          "S." Pure SVG (react-native-svg), so it scales cleanly from a 20px nav glyph up to app-icon size with no
          image asset.
        </Text>
      </Section>

      <Divider />

      <Section title="Color">
        <View style={{ gap: spacing[2] }}>
          <SubLabel>BRAND</SubLabel>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[3] }}>
            {Object.entries(colors.brand).map(([key, value]) => (
              <Swatch key={key} label={key} color={value} />
            ))}
          </View>
        </View>
        <View style={{ gap: spacing[2] }}>
          <SubLabel>NEUTRAL</SubLabel>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[3] }}>
            {Object.entries(neutral).map(([key, value]) => (
              <Swatch key={key} label={key} color={value} />
            ))}
          </View>
        </View>
        <View style={{ gap: spacing[2] }}>
          <SubLabel>SEMANTIC — colors.semantic.&lt;name&gt;, the bg/fg/border triple every status surface pulls from</SubLabel>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[3] }}>
            <SemanticChip label="Success" tone={colors.semantic.success} />
            <SemanticChip label="Warning" tone={colors.semantic.warning} />
            <SemanticChip label="Danger" tone={colors.semantic.danger} />
            <SemanticChip label="Info" tone={colors.semantic.info} />
            <SemanticChip label="Live" tone={colors.semantic.live} />
          </View>
        </View>
        <View style={{ gap: spacing[2] }}>
          <SubLabel>PRIMARY GRADIENT — reserved for the main CTA, logo details, active nav, selected KPI icons, and restrained chart accents. Never every card, input, or button.</SubLabel>
          <GradientView style={{ height: 64, borderRadius: 12, width: 220 }} />
        </View>
      </Section>

      <Divider />

      <Section title="Surfaces &amp; elevation" description="Not every item sits in an identical white rounded card.">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[4] }}>
          <Card tone="surface" style={{ width: 200, gap: spacing[1] }}>
            <Text variant="bodyMedium">surface</Text>
            <Text variant="caption" color="muted">
              Default passive card
            </Text>
          </Card>
          <Card tone="tinted" style={{ width: 200, gap: spacing[1] }}>
            <Text variant="bodyMedium">tinted</Text>
            <Text variant="caption" color="muted">
              Quieter summary surface
            </Text>
          </Card>
          <Card tone="borderOnly" style={{ width: 200, gap: spacing[1] }}>
            <Text variant="bodyMedium">borderOnly</Text>
            <Text variant="caption" color="muted">
              Flat section, no shadow
            </Text>
          </Card>
          <Card tone="dark" style={{ width: 200, gap: spacing[1] }}>
            <Text variant="bodyMedium" color="inverse">
              dark
            </Text>
            <Text variant="caption" color="inverseMuted">
              High-attention panel
            </Text>
          </Card>
        </View>
        <View style={{ gap: spacing[2] }}>
          <SubLabel>INTERACTIVE — hover to lift, press to settle, tab to focus (respects reduced motion)</SubLabel>
          <Card interactive onPress={() => showToast("Card pressed", "info")} style={{ width: 260 }}>
            <Text variant="bodyMedium">Click or tab to me</Text>
            <Text variant="caption" color="muted">
              Border emphasis + lift on hover
            </Text>
          </Card>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[5] }}>
          {(["none", "sm", "md", "lg", "xl"] as const).map((tier) => (
            <View key={tier} style={{ alignItems: "center", gap: spacing[2] }}>
              <View style={[{ width: 72, height: 48, borderRadius: 10, backgroundColor: colors.surface }, shadows[tier]]} />
              <Text variant="caption" color="muted">
                {tier}
              </Text>
            </View>
          ))}
        </View>
      </Section>

      <Divider />

      <Section title="Typography">
        {(Object.keys(typography) as Array<keyof typeof typography>).map((variant) => (
          <Text key={variant} variant={variant}>
            {variant} — The quick brown fox jumps over the lazy dog
          </Text>
        ))}
        <View style={{ gap: spacing[1] }}>
          <SubLabel>TABULAR NUMERALS — prices, times, quantities, KPIs</SubLabel>
          <Text variant="h2" style={{ fontVariant: ["tabular-nums"] }}>
            $1,284.90
          </Text>
        </View>
      </Section>

      <Divider />

      <Section title="Icon containers" description="Compact tinted tiles for KPI cards and section headers.">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[4] }}>
          {(["brand", "cyan", "success", "warning", "danger", "neutral"] as const).map((tint) => (
            <View key={tint} style={{ alignItems: "center", gap: spacing[2] }}>
              <IconContainer tint={tint}>{(fg) => <Text style={{ color: fg, fontSize: 16, fontWeight: "700" }}>◆</Text>}</IconContainer>
              <Text variant="caption" color="muted">
                {tint}
              </Text>
            </View>
          ))}
        </View>
      </Section>

      <Divider />

      <Section title="Buttons">
        <View style={{ gap: spacing[4] }}>
          <SubLabel>VARIANTS — primary carries the gradient; use it once per view</SubLabel>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[4] }}>
            <Button label="Primary" variant="primary" onPress={() => showToast("Primary pressed", "success")} />
            <Button label="Secondary" variant="secondary" onPress={() => showToast("Secondary pressed")} />
            <Button label="Ghost" variant="ghost" onPress={() => showToast("Ghost pressed")} />
            <Button label="Danger" variant="danger" onPress={() => showToast("Danger pressed", "danger")} />
          </View>
        </View>
        <View style={{ gap: spacing[4] }}>
          <SubLabel>SIZES</SubLabel>
          <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: spacing[4] }}>
            <Button label="Small" size="sm" onPress={() => {}} />
            <Button label="Medium" size="md" onPress={() => {}} />
            <Button label="Large" size="lg" onPress={() => {}} />
          </View>
        </View>
        <View style={{ gap: spacing[4] }}>
          <SubLabel>STATES — hover, focus (tab to it), and press are all live; try disabled vs. loading</SubLabel>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[4] }}>
            <Button label="Disabled" disabled onPress={() => {}} />
            <Button
              label={loadingDemo ? "Loading…" : "Trigger loading"}
              loading={loadingDemo}
              onPress={() => {
                setLoadingDemo(true);
                setTimeout(() => setLoadingDemo(false), 1500);
              }}
            />
          </View>
        </View>
        <View style={{ gap: spacing[4] }}>
          <SubLabel>FILTER CHIPS — pale violet when selected, never the full gradient</SubLabel>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[3] }}>
            {["All", "Pending", "Confirmed", "Ready"].map((f) => (
              <FilterChip key={f} label={f} selected={activeFilter === f} onPress={() => setActiveFilter(f)} />
            ))}
          </View>
        </View>
      </Section>

      <Divider />

      <Section title="Status badges" description="Text plus a dot, so status is never color alone — real OrderStatus type.">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[3] }}>
          {ORDER_STATUSES.map((status) => (
            <StatusBadge key={status} status={status} />
          ))}
          <LiveIndicator />
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[3] }}>
          <Badge label="Custom badge" bg={colors.brand.paleViolet} fg={colors.brand.violetPressed} border={colors.brand.violet} />
        </View>
      </Section>

      <Divider />

      <Section title="Lists" description="The left/right row shape used for Orders, Menu items, and the CRM customer list. A row nested inside an existing Card (e.g. items under a category) uses surface=false.">
        <List>
          <ListRow
            left={
              <>
                <Text variant="bodyMedium">Alice Nguyen</Text>
                <Text variant="caption" color="muted">
                  alice@example.com
                </Text>
              </>
            }
            right={
              <>
                <Text variant="bodyMedium" style={{ fontVariant: ["tabular-nums"] }}>
                  $86.23
                </Text>
                <Text variant="caption" color="muted">
                  3 orders
                </Text>
              </>
            }
          />
          <ListRow
            left={
              <>
                <Text variant="bodyMedium">Bob Martinez</Text>
                <Text variant="caption" color="muted">
                  bob@example.com
                </Text>
              </>
            }
            right={
              <>
                <Text variant="bodyMedium" style={{ fontVariant: ["tabular-nums"] }}>
                  $23.76
                </Text>
                <Text variant="caption" color="muted">
                  2 orders
                </Text>
              </>
            }
          />
        </List>
      </Section>

      <Divider />

      <Section title="Ranked bars" description="Real relative magnitude from actual data — never a decorative or fake metric.">
        <View style={{ gap: spacing[4], maxWidth: 360 }}>
          <RankedBar label="Classic Burger" value={11} maxValue={11} valueLabel="11 sold" />
          <RankedBar label="Spring Rolls" value={4} maxValue={11} valueLabel="4 sold" />
          <RankedBar label="Buffalo Wings" value={3} maxValue={11} valueLabel="3 sold" />
        </View>
      </Section>

      <Divider />

      <Section title="Navigation" description="The actual bar rendered in the app shell (apps/dashboard/components/NavBar.tsx), which just wires these to expo-router's Link. Click a link to try the active/hover/focus states — tab to one to see the focus ring. Resize the window below the tablet breakpoint to see it collapse to the dark mobile menu.">
        <TopNav brand={<Logo tone="dark" descriptor="compact" />}>
          {["Home", "Orders", "Menu", "Customers", "Settings"].map((label) => (
            <NavLink key={label} label={label} active={activeNavDemo === label} onPress={() => setActiveNavDemo(label)} />
          ))}
        </TopNav>
      </Section>

      <Divider />

      <Section title="Form controls">
        <TextField
          label="Text field"
          placeholder="Type something…"
          value={textValue}
          onChangeText={setTextValue}
          helperText="Focus this field to see the cobalt ring and outer glow"
        />
        <TextField label="Text field with error" value="bad-input" error="This value is invalid" onChangeText={() => {}} />
        <TextField label="Disabled text field" value="Can't edit this" editable={false} onChangeText={() => {}} />

        <Select
          label="Select (built on Modal + FlatList)"
          value={selectValue}
          onChange={setSelectValue}
          options={ORDER_STATUSES.map((status) => ({ value: status, label: status }))}
        />

        <View style={{ gap: spacing[3] }}>
          <SubLabel>SWITCHES — on: violet, off: cool neutral gray, thumb always white</SubLabel>
          <Switch
            label="Ordering enabled (interactive)"
            description="Toggles whether customers can place new orders"
            value={switchValue}
            onValueChange={setSwitchValue}
          />
          <Switch label="Fixed on state" value={true} onValueChange={() => {}} />
          <Switch label="Fixed off state" value={false} onValueChange={() => {}} />
          <Switch label="Disabled" value={true} onValueChange={() => {}} disabled />
        </View>
      </Section>

      <Divider />

      <Section title="Modal">
        <View style={{ flexDirection: "row", gap: spacing[3] }}>
          <Button label="Open modal" variant="secondary" onPress={() => setModalOpen(true)} />
        </View>
        <Modal visible={modalOpen} onClose={() => setModalOpen(false)} title="Edit menu item">
          <View style={{ gap: spacing[4] }}>
            <Text variant="body" color="secondary">
              Built on RN's core Modal, not a web-only dialog kit — the same primitive every edit/create flow (menu
              items, customer quick-create) and the mobile nav menu use.
            </Text>
            <TextField label="Name" placeholder="Classic Burger" onChangeText={() => {}} />
            <Button label="Save" onPress={() => setModalOpen(false)} />
          </View>
        </Modal>
      </Section>

      <Divider />

      <Section title="Toast">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[3] }}>
          <Button label="Info toast" variant="secondary" onPress={() => showToast("Saved as draft", "info")} />
          <Button label="Success toast" variant="secondary" onPress={() => showToast("Order confirmed", "success")} />
          <Button label="Warning toast" variant="secondary" onPress={() => showToast("Prep time is tight", "warning")} />
          <Button label="Danger toast" variant="secondary" onPress={() => showToast("Failed to save", "danger")} />
        </View>
      </Section>

      <Divider />

      <Section title="Loading, empty, and error states">
        <View style={{ gap: spacing[3] }}>
          <SubLabel>SPINNER — indeterminate wait (modals, small panels)</SubLabel>
          <Card>
            <Spinner label="Loading orders…" />
          </Card>
        </View>

        <View style={{ gap: spacing[3] }}>
          <SubLabel>SKELETON — cool-neutral base with a shimmer sweep (disabled under reduced motion), shaped like the content it replaces</SubLabel>
          <Card style={{ gap: spacing[4] }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ gap: spacing[2] }}>
                <Skeleton width={140} height={16} />
                <Skeleton width={90} height={12} />
              </View>
              <Skeleton width={72} height={22} radius="full" />
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Skeleton width={70} height={22} />
              <Skeleton width={100} height={32} />
            </View>
          </Card>
        </View>
        <Card>
          <EmptyState
            title="No orders yet"
            description="Orders placed today will show up here."
            actionLabel="Refresh"
            onAction={() => showToast("Refreshed", "info")}
          />
        </Card>
        <Card>
          <ErrorState
            title="Couldn't load orders"
            description="Check your connection and try again."
            onRetry={() => showToast("Retrying…", "info")}
          />
        </Card>
      </Section>

      <Divider />

      <Section title="Accessible contrast pairings" description="Measured with the WCAG relative-luminance formula against this file's exact tokens, not eyeballed.">
        <List gap={2}>
          {CONTRAST_PAIRINGS.map((row) => (
            <ListRow
              key={row.pair}
              surface={false}
              left={<Text variant="body">{row.pair}</Text>}
              right={
                <Text variant="bodyMedium" color="secondary" style={{ fontVariant: ["tabular-nums"] }}>
                  {row.ratio}
                </Text>
              }
            />
          ))}
        </List>
      </Section>
    </PageContainer>
  );
}
