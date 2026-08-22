import {
  getGetCustomersQueryKey,
  getGetKpisQueryKey,
  getGetOrdersQueryKey,
  useGetCustomers,
  useGetMenuCategories,
  useGetMenuItems,
  useGetOrders,
  useGetSettings,
  usePatchOrdersIdStatus,
  usePostOrders,
} from "@odyssey/api-client";
import { formatCents, formatDateTime, ORDER_STATUSES, type OrderStatus } from "@odyssey/shared";
import {
  Button,
  Card,
  colors,
  Divider,
  EmptyState,
  ErrorState,
  layout,
  Modal,
  Select,
  Skeleton,
  spacing,
  Spinner,
  StatusBadge,
  STATUS_LABELS,
  Text,
  TextField,
  useToast,
} from "@odyssey/ui";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { computeOrderPreviewTotals } from "../lib/orderPreview";

type FilterValue = "all" | OrderStatus;

const NEW_CUSTOMER_VALUE = "__new__";

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  ...ORDER_STATUSES.map((status) => ({ value: status, label: STATUS_LABELS[status] })),
];

function OrderCardSkeleton() {
  return (
    <Card style={{ gap: spacing[4] }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
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
  );
}

export default function OrdersScreen() {
  const [filter, setFilter] = useState<FilterValue>("all");
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data, isLoading, isError, refetch } = useGetOrders(
    filter === "all" ? undefined : { status: filter },
  );

  const transitionMutation = usePatchOrdersIdStatus({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetOrdersQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetKpisQueryKey() });
        showToast("Order status updated", "success");
      },
      onError: () => showToast("Couldn't update order status", "danger"),
    },
  });

  const orders = data?.data ?? [];

  return (
    <ScrollView contentContainerStyle={{ backgroundColor: colors.background }}>
      <View
        style={{
          maxWidth: layout.maxContentWidth,
          width: "100%",
          alignSelf: "center",
          padding: layout.containerPadding,
          gap: spacing[7],
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing[4] }}>
          <View style={{ gap: spacing[2] }}>
            <Text variant="display">Orders</Text>
            <Text variant="body" color="secondary">
              Advance an order's status as it moves through the kitchen.
            </Text>
          </View>
          <NewOrderButton />
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[3] }}>
          {FILTERS.map((f) => (
            <Button
              key={f.value}
              label={f.label}
              size="sm"
              variant={filter === f.value ? "primary" : "secondary"}
              onPress={() => setFilter(f.value)}
            />
          ))}
        </View>

        {isLoading && (
          <View style={{ gap: spacing[4] }}>
            <OrderCardSkeleton />
            <OrderCardSkeleton />
            <OrderCardSkeleton />
          </View>
        )}

        {isError && (
          <Card>
            <ErrorState title="Couldn't load orders" onRetry={() => refetch()} />
          </Card>
        )}

        {!isLoading && !isError && orders.length === 0 && (
          <Card>
            <EmptyState title="No orders" description="Orders matching this filter will show up here." />
          </Card>
        )}

        <View style={{ gap: spacing[4] }}>
          {orders.map((order) => (
            <Card key={order.id} style={{ gap: spacing[4] }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing[3] }}>
                <View style={{ gap: spacing[1] }}>
                  <Text variant="bodyMedium">{order.customer.name}</Text>
                  <Text variant="caption" color="muted">
                    {formatDateTime(order.createdAt)}
                  </Text>
                </View>
                <StatusBadge status={order.status} />
              </View>

              {order.notes ? (
                <Text variant="body" color="secondary">
                  {order.notes}
                </Text>
              ) : null}

              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text variant="h3">{formatCents(order.totalCents)}</Text>

                {order.allowedTransitions.length > 0 ? (
                  <View style={{ flexDirection: "row", gap: spacing[3] }}>
                    {order.allowedTransitions.map((next) => (
                      <Button
                        key={next}
                        label={STATUS_LABELS[next]}
                        size="sm"
                        variant={next === "cancelled" ? "danger" : "secondary"}
                        loading={transitionMutation.isPending && transitionMutation.variables?.id === order.id}
                        onPress={() => transitionMutation.mutate({ id: order.id, data: { status: next } })}
                      />
                    ))}
                  </View>
                ) : (
                  <Text variant="caption" color="muted">
                    No further actions
                  </Text>
                )}
              </View>
            </Card>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function NewOrderButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button label="New order" onPress={() => setOpen(true)} />
      <CreateOrderModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

type LineState = Record<string, number>; // menuItemId -> quantity

function CreateOrderModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const categoriesQuery = useGetMenuCategories();
  const menuItemsQuery = useGetMenuItems();
  const customersQuery = useGetCustomers();
  const settingsQuery = useGetSettings();

  const [customerId, setCustomerId] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<LineState>({});

  const isNewCustomer = customerId === NEW_CUSTOMER_VALUE;

  const availableItems = useMemo(
    () => (menuItemsQuery.data?.data ?? []).filter((item) => item.isAvailable),
    [menuItemsQuery.data],
  );

  const categorizedItems = useMemo(() => {
    const categories = categoriesQuery.data?.data ?? [];
    return categories
      .map((category) => ({
        category,
        items: availableItems.filter((item) => item.categoryId === category.id),
      }))
      .filter((group) => group.items.length > 0);
  }, [categoriesQuery.data, availableItems]);

  function reset() {
    setCustomerId("");
    setNewCustomerName("");
    setNewCustomerEmail("");
    setNotes("");
    setLines({});
  }

  function close() {
    reset();
    onClose();
  }

  function setQuantity(menuItemId: string, quantity: number) {
    setLines((prev) => {
      const next = { ...prev };
      if (quantity <= 0) {
        delete next[menuItemId];
      } else {
        next[menuItemId] = quantity;
      }
      return next;
    });
  }

  const selectedLines = Object.entries(lines);
  const taxRatePercent = settingsQuery.data ? Number.parseFloat(settingsQuery.data.data.taxRatePercent) : 0;
  const { subtotalCents, taxCents, totalCents } = computeOrderPreviewTotals(
    selectedLines.map(([menuItemId, quantity]) => ({ menuItemId, quantity })),
    availableItems,
    taxRatePercent,
  );

  const createOrder = usePostOrders({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetOrdersQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetKpisQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetCustomersQueryKey() });
        showToast("Order created", "success");
        close();
      },
      onError: () => showToast("Couldn't create order", "danger"),
    },
  });

  const canSubmit =
    selectedLines.length > 0 &&
    (isNewCustomer ? newCustomerName.trim().length > 0 : customerId.length > 0);

  function submit() {
    if (!canSubmit) return;
    createOrder.mutate({
      data: {
        ...(isNewCustomer
          ? { customer: { name: newCustomerName, email: newCustomerEmail || undefined } }
          : { customerId }),
        notes: notes || undefined,
        items: selectedLines.map(([menuItemId, quantity]) => ({ menuItemId, quantity })),
      },
    });
  }

  const isLoading =
    categoriesQuery.isLoading || menuItemsQuery.isLoading || customersQuery.isLoading || settingsQuery.isLoading;

  return (
    <Modal visible={open} onClose={close} title="New order">
      <View style={{ gap: spacing[6] }}>
        {isLoading ? (
          <Spinner label="Loading menu…" />
        ) : (
          <>
            <Select
              label="Customer"
              value={customerId}
              onChange={setCustomerId}
              placeholder="Choose a customer"
              options={[
                { value: NEW_CUSTOMER_VALUE, label: "+ Add new customer" },
                ...(customersQuery.data?.data ?? []).map((c) => ({ value: c.id, label: c.name })),
              ]}
            />

            {isNewCustomer && (
              <View style={{ gap: spacing[5] }}>
                <TextField label="Name" value={newCustomerName} onChangeText={setNewCustomerName} />
                <TextField
                  label="Email (optional)"
                  value={newCustomerEmail}
                  onChangeText={setNewCustomerEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            )}

            <Divider />

            <View style={{ gap: spacing[5] }}>
              <Text variant="label" color="secondary">
                ITEMS
              </Text>
              {categorizedItems.length === 0 ? (
                <Text variant="body" color="secondary">
                  No available menu items.
                </Text>
              ) : (
                categorizedItems.map(({ category, items }) => (
                  <View key={category.id} style={{ gap: spacing[3] }}>
                    <Text variant="bodyMedium" color="secondary">
                      {category.name}
                    </Text>
                    {items.map((item) => {
                      const qty = lines[item.id] ?? 0;
                      return (
                        <View
                          key={item.id}
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: spacing[4],
                          }}
                        >
                          <View style={{ flex: 1, gap: spacing[1] }}>
                            <Text variant="body">{item.name}</Text>
                            <Text variant="caption" color="muted">
                              {formatCents(item.priceCents)}
                            </Text>
                          </View>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[3] }}>
                            <Button
                              label="−"
                              size="sm"
                              variant="secondary"
                              disabled={qty === 0}
                              onPress={() => setQuantity(item.id, qty - 1)}
                            />
                            <Text variant="bodyMedium" style={{ minWidth: 20, textAlign: "center" }}>
                              {qty}
                            </Text>
                            <Button label="+" size="sm" variant="secondary" onPress={() => setQuantity(item.id, qty + 1)} />
                          </View>
                        </View>
                      );
                    })}
                  </View>
                ))
              )}
            </View>

            <Divider />

            <TextField label="Notes (optional)" value={notes} onChangeText={setNotes} />

            <View style={{ gap: spacing[2] }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text variant="body" color="secondary">
                  Subtotal
                </Text>
                <Text variant="body">{formatCents(subtotalCents)}</Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text variant="body" color="secondary">
                  Tax ({taxRatePercent}%)
                </Text>
                <Text variant="body">{formatCents(taxCents)}</Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text variant="h3">Total</Text>
                <Text variant="h3">{formatCents(totalCents)}</Text>
              </View>
            </View>

            <Button label="Create order" loading={createOrder.isPending} disabled={!canSubmit} onPress={submit} />
          </>
        )}
      </View>
    </Modal>
  );
}
