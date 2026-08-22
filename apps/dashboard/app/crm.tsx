import {
  getGetCustomersQueryKey,
  useGetCustomers,
  useGetCustomersId,
  usePatchCustomersId,
  usePostCustomers,
} from "@odyssey/api-client";
import { formatCents, formatDateTime } from "@odyssey/shared";
import {
  Button,
  Card,
  Divider,
  EmptyState,
  ErrorState,
  List,
  ListRow,
  Modal,
  PageContainer,
  PageHeader,
  Skeleton,
  spacing,
  Spinner,
  StatusBadge,
  Text,
  TextField,
  useToast,
} from "@odyssey/ui";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { View } from "react-native";

type CustomerFormState = { name: string; email: string; phone: string };
const EMPTY_FORM: CustomerFormState = { name: "", email: "", phone: "" };

function CustomerRowSkeleton() {
  return (
    <ListRow
      left={
        <>
          <Skeleton width={130} height={14} />
          <Skeleton width={170} height={12} />
        </>
      }
      right={
        <>
          <Skeleton width={60} height={14} />
          <Skeleton width={50} height={12} />
        </>
      }
    />
  );
}

export default function CrmScreen() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const customersQuery = useGetCustomers();

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CustomerFormState>(EMPTY_FORM);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CustomerFormState>(EMPTY_FORM);

  const detailQuery = useGetCustomersId(selectedId ?? "", { query: { enabled: Boolean(selectedId) } });

  const invalidateCustomers = () => queryClient.invalidateQueries({ queryKey: getGetCustomersQueryKey() });

  const createCustomer = usePostCustomers({
    mutation: {
      onSuccess: () => {
        invalidateCustomers();
        showToast("Customer created", "success");
        setCreateOpen(false);
        setCreateForm(EMPTY_FORM);
      },
      onError: () => showToast("Couldn't create customer", "danger"),
    },
  });

  const updateCustomer = usePatchCustomersId({
    mutation: {
      onSuccess: () => {
        invalidateCustomers();
        showToast("Customer updated", "success");
      },
      onError: () => showToast("Couldn't update customer", "danger"),
    },
  });

  function openDetail(id: string, name: string, email: string | null, phone: string | null) {
    setSelectedId(id);
    setEditForm({ name, email: email ?? "", phone: phone ?? "" });
  }

  function submitCreate() {
    if (!createForm.name.trim()) return;
    createCustomer.mutate({
      data: { name: createForm.name, email: createForm.email || null, phone: createForm.phone || null },
    });
  }

  function submitEdit() {
    if (!selectedId || !editForm.name.trim()) return;
    updateCustomer.mutate({
      id: selectedId,
      data: { name: editForm.name, email: editForm.email || null, phone: editForm.phone || null },
    });
  }

  const customers = customersQuery.data?.data ?? [];

  return (
    <>
      <PageContainer>
        <PageHeader
          title="Customers"
          description="Spend and order counts are computed live, never stored on the customer."
          action={<Button label="New customer" variant="secondary" onPress={() => setCreateOpen(true)} />}
        />

        {customersQuery.isLoading && (
          <List>
            <CustomerRowSkeleton />
            <CustomerRowSkeleton />
            <CustomerRowSkeleton />
          </List>
        )}

        {customersQuery.isError && (
          <Card>
            <ErrorState title="Couldn't load customers" onRetry={() => customersQuery.refetch()} />
          </Card>
        )}

        {!customersQuery.isLoading && !customersQuery.isError && customers.length === 0 && (
          <Card>
            <EmptyState
              title="No customers yet"
              description="Customers are created here or inline when placing an order."
              actionLabel="New customer"
              onAction={() => setCreateOpen(true)}
            />
          </Card>
        )}

        <List>
          {customers.map((customer) => (
            <ListRow
              key={customer.id}
              left={
                <>
                  <Button
                    label={customer.name}
                    variant="ghost"
                    size="sm"
                    alignSelf="flex-start"
                    onPress={() => openDetail(customer.id, customer.name, customer.email, customer.phone)}
                  />
                  <Text variant="caption" color="muted">
                    {customer.email ?? "No email"} {customer.phone ? `· ${customer.phone}` : ""}
                  </Text>
                </>
              }
              right={
                <>
                  <Text variant="bodyMedium" style={{ fontVariant: ["tabular-nums"] }}>
                    {formatCents(customer.totalSpentCents)}
                  </Text>
                  <Text variant="caption" color="muted">
                    {customer.orderCount} order{customer.orderCount === 1 ? "" : "s"}
                  </Text>
                </>
              }
            />
          ))}
        </List>
      </PageContainer>

      <Modal visible={createOpen} onClose={() => setCreateOpen(false)} title="New customer">
        <View style={{ gap: spacing[5] }}>
          <TextField label="Name" value={createForm.name} onChangeText={(name) => setCreateForm((f) => ({ ...f, name }))} />
          <TextField
            label="Email"
            value={createForm.email}
            onChangeText={(email) => setCreateForm((f) => ({ ...f, email }))}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextField label="Phone" value={createForm.phone} onChangeText={(phone) => setCreateForm((f) => ({ ...f, phone }))} />
          <Button label="Create" loading={createCustomer.isPending} onPress={submitCreate} />
        </View>
      </Modal>

      <Modal visible={Boolean(selectedId)} onClose={() => setSelectedId(null)} title="Customer detail">
        <View style={{ gap: spacing[6] }}>
          <View style={{ gap: spacing[5] }}>
            <TextField label="Name" value={editForm.name} onChangeText={(name) => setEditForm((f) => ({ ...f, name }))} />
            <TextField
              label="Email"
              value={editForm.email}
              onChangeText={(email) => setEditForm((f) => ({ ...f, email }))}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextField label="Phone" value={editForm.phone} onChangeText={(phone) => setEditForm((f) => ({ ...f, phone }))} />
            <Button label="Save changes" loading={updateCustomer.isPending} onPress={submitEdit} />
          </View>

          <Divider />

          <View style={{ gap: spacing[4] }}>
            <Text variant="h3">Order history</Text>
            {detailQuery.isLoading && <Spinner />}
            {detailQuery.data && detailQuery.data.data.orders.length === 0 && (
              <Text variant="body" color="secondary">
                No orders yet.
              </Text>
            )}
            {detailQuery.data?.data.orders.map((order) => (
              <View key={order.id} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ gap: spacing[1] }}>
                  <Text variant="body" style={{ fontVariant: ["tabular-nums"] }}>
                    {formatCents(order.totalCents)}
                  </Text>
                  <Text variant="caption" color="muted">
                    {formatDateTime(order.createdAt)}
                  </Text>
                </View>
                <StatusBadge status={order.status} />
              </View>
            ))}
          </View>
        </View>
      </Modal>
    </>
  );
}
