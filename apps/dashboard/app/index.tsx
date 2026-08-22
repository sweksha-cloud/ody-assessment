import { useGetKpis } from "@odyssey/api-client";
import { formatCents } from "@odyssey/shared";
import { Card, ErrorState, PageContainer, PageHeader, Skeleton, spacing, Text } from "@odyssey/ui";
import { View } from "react-native";

function StatTileSkeleton() {
  return (
    <Card style={{ flexGrow: 1, flexBasis: 220, gap: spacing[3] }}>
      <Skeleton width="60%" height={12} />
      <Skeleton width="40%" height={28} />
    </Card>
  );
}

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
    <PageContainer>
      <PageHeader title="Dashboard" description="Today's activity at a glance." />

      {isLoading && (
        <View style={{ gap: spacing[7] }}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[5] }}>
            <StatTileSkeleton />
            <StatTileSkeleton />
            <StatTileSkeleton />
          </View>
          <Card style={{ gap: spacing[5] }}>
            <Skeleton width="45%" height={20} />
            <View style={{ gap: spacing[4] }}>
              <Skeleton height={16} />
              <Skeleton height={16} />
              <Skeleton height={16} width="70%" />
            </View>
          </Card>
        </View>
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
    </PageContainer>
  );
}
