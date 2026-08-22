import { useGetKpis } from "@odyssey/api-client";
import { formatCents } from "@odyssey/shared";
import { Card, colors, ErrorState, layout, spacing, Spinner, Text } from "@odyssey/ui";
import { ScrollView, View } from "react-native";

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <Card style={{ flexGrow: 1, flexBasis: 220, gap: spacing[2] }}>
      <Text variant="label" color="secondary">
        {label.toUpperCase()}
      </Text>
      <Text variant="display">{value}</Text>
    </Card>
  );
}

export default function HomeScreen() {
  const { data, isLoading, isError, refetch } = useGetKpis();

  return (
    <ScrollView contentContainerStyle={{ backgroundColor: colors.background }}>
      <View
        style={{
          maxWidth: layout.maxContentWidth,
          width: "100%",
          alignSelf: "center",
          padding: layout.containerPadding,
          gap: spacing[8],
        }}
      >
        <View style={{ gap: spacing[2] }}>
          <Text variant="display">Dashboard</Text>
          <Text variant="body" color="secondary">
            Today's activity at a glance.
          </Text>
        </View>

        {isLoading && (
          <Card>
            <Spinner label="Loading KPIs…" />
          </Card>
        )}

        {isError && (
          <Card>
            <ErrorState
              title="Couldn't load KPIs"
              description="Check that the backend is running and try again."
              onRetry={() => refetch()}
            />
          </Card>
        )}

        {data && (
          <>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[5] }}>
              <StatTile label="Orders today" value={String(data.data.totalOrdersToday)} />
              <StatTile label="Revenue today" value={formatCents(data.data.revenueCentsToday)} />
              <StatTile label="Pending orders" value={String(data.data.pendingOrders)} />
            </View>

            <Card style={{ gap: spacing[5] }}>
              <Text variant="h3">Popular items (last 30 days)</Text>
              {data.data.popularItems.length === 0 ? (
                <Text variant="body" color="secondary">
                  No orders placed in the last 30 days.
                </Text>
              ) : (
                <View style={{ gap: spacing[4] }}>
                  {data.data.popularItems.map((item, i) => (
                    <View
                      key={item.menuItemId}
                      style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
                    >
                      <Text variant="body">
                        {i + 1}. {item.name}
                      </Text>
                      <Text variant="bodyMedium" color="secondary">
                        {item.quantitySold} sold
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </Card>
          </>
        )}
      </View>
    </ScrollView>
  );
}
