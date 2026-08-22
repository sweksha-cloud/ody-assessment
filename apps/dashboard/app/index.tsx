import { useGetKpis } from "@odyssey/api-client";
import { formatCents } from "@odyssey/shared";
import { Card, ErrorState, IconContainer, type IconContainerTint, PageContainer, PageHeader, RankedBar, Skeleton, spacing, Text } from "@odyssey/ui";
import { View } from "react-native";

function StatTileSkeleton() {
  return (
    <Card style={{ flexGrow: 1, flexBasis: 220, gap: spacing[4] }}>
      <Skeleton width={40} height={40} radius="md" />
      <View style={{ gap: spacing[2] }}>
        <Skeleton width="60%" height={12} />
        <Skeleton width="40%" height={28} />
      </View>
    </Card>
  );
}

function StatTile({ label, value, glyph, tint }: { label: string; value: string; glyph: string; tint: IconContainerTint }) {
  return (
    <Card style={{ flexGrow: 1, flexBasis: 220, gap: spacing[4] }}>
      <IconContainer tint={tint}>{(fg) => <Text style={{ color: fg, fontSize: 16, fontWeight: "700" }}>{glyph}</Text>}</IconContainer>
      <View style={{ gap: spacing[2] }}>
        <Text variant="label" color="secondary">
          {label.toUpperCase()}
        </Text>
        <Text variant="display" style={{ fontVariant: ["tabular-nums"] }}>
          {value}
        </Text>
      </View>
    </Card>
  );
}

export default function HomeScreen() {
  const { data, isLoading, isError, refetch } = useGetKpis();
  const maxQuantitySold = Math.max(1, ...(data?.data.popularItems.map((item) => item.quantitySold) ?? [1]));

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
            <StatTile label="Orders today" value={String(data.data.totalOrdersToday)} glyph="#" tint="brand" />
            <StatTile label="Revenue today" value={formatCents(data.data.revenueCentsToday)} glyph="$" tint="success" />
            <StatTile label="Pending orders" value={String(data.data.pendingOrders)} glyph="!" tint="warning" />
          </View>

          <Card style={{ gap: spacing[5] }}>
            <Text variant="h3">Popular items (last 30 days)</Text>
            {data.data.popularItems.length === 0 ? (
              <Text variant="body" color="secondary">
                No orders placed in the last 30 days.
              </Text>
            ) : (
              <View style={{ gap: spacing[4] }}>
                {data.data.popularItems.map((item) => (
                  <RankedBar
                    key={item.menuItemId}
                    label={item.name}
                    value={item.quantitySold}
                    maxValue={maxQuantitySold}
                    valueLabel={`${item.quantitySold} sold`}
                  />
                ))}
              </View>
            )}
          </Card>
        </>
      )}
    </PageContainer>
  );
}
