import {
  Badge,
  Button,
  Card,
  colors,
  Divider,
  EmptyState,
  ErrorState,
  layout,
  List,
  ListRow,
  Modal,
  NavLink,
  neutral,
  Select,
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
import { ScrollView, View } from "react-native";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: spacing[5] }}>
      <Text variant="h2">{title}</Text>
      <View style={{ gap: spacing[5] }}>{children}</View>
    </View>
  );
}

function Swatch({ label, color }: { label: string; color: string }) {
  return (
    <View style={{ alignItems: "center", gap: spacing[2], width: 88 }}>
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
    </View>
  );
}

export default function UiLibraryScreen() {
  const { showToast } = useToast();

  const [textValue, setTextValue] = useState("");
  const [switchValue, setSwitchValue] = useState(true);
  const [selectValue, setSelectValue] = useState<(typeof ORDER_STATUSES)[number]>("pending");
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [activeNavDemo, setActiveNavDemo] = useState("Home");

  return (
    <ScrollView contentContainerStyle={{ backgroundColor: colors.background }}>
      <View
        style={{
          maxWidth: layout.maxContentWidth,
          width: "100%",
          alignSelf: "center",
          padding: layout.containerPadding,
          gap: spacing[9],
        }}
      >
        <View style={{ gap: spacing[2] }}>
          <Text variant="display">UI Library</Text>
          <Text variant="body" color="secondary">
            Design tokens and primitives that back every screen in the dashboard — every state below is live and
            interactive, not a static mock.
          </Text>
        </View>

        <Section title="Color">
          <View style={{ gap: spacing[2] }}>
            <Text variant="label" color="secondary">
              BRAND
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[3] }}>
              {Object.entries(colors.brand).map(([key, value]) => (
                <Swatch key={key} label={key} color={value} />
              ))}
            </View>
          </View>
          <View style={{ gap: spacing[2] }}>
            <Text variant="label" color="secondary">
              NEUTRAL
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[3] }}>
              {Object.entries(neutral).map(([key, value]) => (
                <Swatch key={key} label={key} color={value} />
              ))}
            </View>
          </View>
          <View style={{ gap: spacing[2] }}>
            <Text variant="label" color="secondary">
              SEMANTIC
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[3] }}>
              <Swatch label="success" color={colors.success[500]} />
              <Swatch label="warning" color={colors.warning[500]} />
              <Swatch label="danger" color={colors.danger[500]} />
              <Swatch label="info" color={colors.info[500]} />
            </View>
          </View>
        </Section>

        <Divider />

        <Section title="Typography">
          {(Object.keys(typography) as Array<keyof typeof typography>).map((variant) => (
            <Text key={variant} variant={variant}>
              {variant} — The quick brown fox jumps over the lazy dog
            </Text>
          ))}
        </Section>

        <Divider />

        <Section title="Buttons">
          <View style={{ gap: spacing[4] }}>
            <Text variant="label" color="secondary">
              VARIANTS
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[4] }}>
              <Button label="Primary" variant="primary" onPress={() => showToast("Primary pressed", "success")} />
              <Button label="Secondary" variant="secondary" onPress={() => showToast("Secondary pressed")} />
              <Button label="Ghost" variant="ghost" onPress={() => showToast("Ghost pressed")} />
              <Button label="Danger" variant="danger" onPress={() => showToast("Danger pressed", "danger")} />
            </View>
          </View>
          <View style={{ gap: spacing[4] }}>
            <Text variant="label" color="secondary">
              SIZES
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: spacing[4] }}>
              <Button label="Small" size="sm" onPress={() => {}} />
              <Button label="Medium" size="md" onPress={() => {}} />
              <Button label="Large" size="lg" onPress={() => {}} />
            </View>
          </View>
          <View style={{ gap: spacing[4] }}>
            <Text variant="label" color="secondary">
              STATES — hover, focus (tab to it), and press are all live; try disabled vs. loading
            </Text>
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
        </Section>

        <Divider />

        <Section title="Status badges (real OrderStatus type)">
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[3] }}>
            {ORDER_STATUSES.map((status) => (
              <StatusBadge key={status} status={status} />
            ))}
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[3] }}>
            <Badge label="Custom badge" bg={colors.brand[100]} fg={colors.brand[700]} border={colors.brand[500]} />
          </View>
        </Section>

        <Divider />

        <Section title="Card">
          <Card>
            <View style={{ gap: spacing[2] }}>
              <Text variant="h3">Card title</Text>
              <Text variant="body" color="secondary">
                Cards use the shadow/elevation and radius tokens directly — this is the base container for stat
                tiles, list rows, and form panels throughout the app.
              </Text>
            </View>
          </Card>
        </Section>

        <Divider />

        <Section title="Lists">
          <View style={{ gap: spacing[3] }}>
            <Text variant="label" color="secondary">
              LIST + LISTROW — the left/right row shape used for Orders, Menu items, and the CRM customer list. A
              row nested inside an existing Card (e.g. items under a category) uses surface=false.
            </Text>
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
                    <Text variant="bodyMedium">$86.23</Text>
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
                    <Text variant="bodyMedium">$23.76</Text>
                    <Text variant="caption" color="muted">
                      2 orders
                    </Text>
                  </>
                }
              />
            </List>
          </View>
        </Section>

        <Divider />

        <Section title="Navigation">
          <View style={{ gap: spacing[3] }}>
            <Text variant="label" color="secondary">
              TOPNAV + NAVLINK — the actual bar rendered in the app shell (apps/dashboard/components/NavBar.tsx),
              which just wires these to expo-router's Link. Click a link below to try the active/hover/focus
              states — tab to one to see the focus ring.
            </Text>
            <TopNav brand={<Text variant="h3">🍊 Odyssey</Text>}>
              {["Home", "Orders", "Menu", "Customers", "Settings"].map((label) => (
                <NavLink key={label} label={label} active={activeNavDemo === label} onPress={() => setActiveNavDemo(label)} />
              ))}
            </TopNav>
          </View>
        </Section>

        <Divider />

        <Section title="Form controls">
          <TextField
            label="Text field"
            placeholder="Type something…"
            value={textValue}
            onChangeText={setTextValue}
            helperText="Focus this field to see the focus ring state"
          />
          <TextField label="Text field with error" value="bad-input" error="This value is invalid" onChangeText={() => {}} />
          <TextField label="Disabled text field" value="Can't edit this" editable={false} onChangeText={() => {}} />

          <Select
            label="Select (built on Modal + FlatList)"
            value={selectValue}
            onChange={setSelectValue}
            options={ORDER_STATUSES.map((status) => ({ value: status, label: status }))}
          />

          <Switch
            label="Ordering enabled"
            description="Toggles whether customers can place new orders"
            value={switchValue}
            onValueChange={setSwitchValue}
          />
        </Section>

        <Divider />

        <Section title="Modal">
          <View>
            <Button label="Open modal" variant="secondary" onPress={() => setModalOpen(true)} />
          </View>
          <Modal visible={modalOpen} onClose={() => setModalOpen(false)} title="Edit menu item">
            <View style={{ gap: spacing[4] }}>
              <Text variant="body" color="secondary">
                This is the same Modal primitive Phase 7's edit/create flows (menu items, customer quick-create) will
                use — built on RN's core Modal, not a web-only dialog kit.
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
            <Text variant="label" color="secondary">
              SPINNER — indeterminate wait (modals, small panels)
            </Text>
            <Card>
              <Spinner label="Loading orders…" />
            </Card>
          </View>

          <View style={{ gap: spacing[3] }}>
            <Text variant="label" color="secondary">
              SKELETON — previews the shape of content that's about to arrive, so the layout doesn't jump once it
              loads. Used for page-level list/card loading (Home, Orders, Menu, CRM).
            </Text>
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
      </View>
    </ScrollView>
  );
}
