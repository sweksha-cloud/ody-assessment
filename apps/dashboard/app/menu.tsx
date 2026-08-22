import {
  getGetMenuCategoriesQueryKey,
  getGetMenuItemsQueryKey,
  useGetMenuCategories,
  useGetMenuItems,
  usePatchMenuCategoriesId,
  usePatchMenuItemsId,
  usePostMenuCategories,
  usePostMenuItems,
} from "@odyssey/api-client";
import type { MenuCategory, MenuItem } from "@odyssey/types";
import { formatCents } from "@odyssey/shared";
import {
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
  Select,
  Skeleton,
  spacing,
  Switch,
  Text,
  TextField,
  useToast,
} from "@odyssey/ui";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ScrollView, View } from "react-native";

function dollarsToCents(value: string): number | null {
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed) || parsed < 0) return null;
  return Math.round(parsed * 100);
}

function centsToDollarsString(cents: number): string {
  return (cents / 100).toFixed(2);
}

type CategoryFormState = { name: string };
type ItemFormState = { name: string; description: string; price: string; categoryId: string };

function MenuCategorySkeleton() {
  return (
    <Card style={{ gap: spacing[5] }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Skeleton width={120} height={18} />
        <Skeleton width={90} height={28} />
      </View>
      <Divider />
      <List gap={4}>
        {[0, 1].map((i) => (
          <ListRow
            key={i}
            surface={false}
            left={
              <>
                <Skeleton width={160} height={14} />
                <Skeleton width={90} height={12} />
              </>
            }
            right={<Skeleton width={44} height={24} />}
          />
        ))}
      </List>
    </Card>
  );
}

export default function MenuScreen() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const categoriesQuery = useGetMenuCategories();
  const itemsQuery = useGetMenuItems();

  const [categoryModal, setCategoryModal] = useState<{ open: boolean; editing?: MenuCategory }>({ open: false });
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>({ name: "" });

  const [itemModal, setItemModal] = useState<{ open: boolean; editing?: MenuItem }>({ open: false });
  const [itemForm, setItemForm] = useState<ItemFormState>({ name: "", description: "", price: "", categoryId: "" });

  const invalidateCategories = () => queryClient.invalidateQueries({ queryKey: getGetMenuCategoriesQueryKey() });
  const invalidateItems = () => queryClient.invalidateQueries({ queryKey: getGetMenuItemsQueryKey() });

  const createCategory = usePostMenuCategories({
    mutation: {
      onSuccess: () => {
        invalidateCategories();
        showToast("Category created", "success");
        setCategoryModal({ open: false });
      },
      onError: () => showToast("Couldn't create category", "danger"),
    },
  });
  const updateCategory = usePatchMenuCategoriesId({
    mutation: {
      onSuccess: () => {
        invalidateCategories();
        showToast("Category updated", "success");
        setCategoryModal({ open: false });
      },
      onError: () => showToast("Couldn't update category", "danger"),
    },
  });

  const createItem = usePostMenuItems({
    mutation: {
      onSuccess: () => {
        invalidateItems();
        showToast("Menu item created", "success");
        setItemModal({ open: false });
      },
      onError: () => showToast("Couldn't create menu item", "danger"),
    },
  });
  const updateItem = usePatchMenuItemsId({
    mutation: {
      onSuccess: () => {
        invalidateItems();
        showToast("Menu item updated", "success");
        setItemModal({ open: false });
      },
      onError: () => showToast("Couldn't update menu item", "danger"),
    },
  });

  function openCreateCategory() {
    setCategoryForm({ name: "" });
    setCategoryModal({ open: true });
  }
  function openEditCategory(category: MenuCategory) {
    setCategoryForm({ name: category.name });
    setCategoryModal({ open: true, editing: category });
  }
  function submitCategory() {
    if (!categoryForm.name.trim()) return;
    if (categoryModal.editing) {
      updateCategory.mutate({ id: categoryModal.editing.id, data: { name: categoryForm.name } });
    } else {
      createCategory.mutate({ data: { name: categoryForm.name, sortOrder: categoriesQuery.data?.data.length ?? 0 } });
    }
  }

  function openCreateItem(categoryId?: string) {
    setItemForm({ name: "", description: "", price: "", categoryId: categoryId ?? categoriesQuery.data?.data[0]?.id ?? "" });
    setItemModal({ open: true });
  }
  function openEditItem(item: MenuItem) {
    setItemForm({
      name: item.name,
      description: item.description ?? "",
      price: centsToDollarsString(item.priceCents),
      categoryId: item.categoryId,
    });
    setItemModal({ open: true, editing: item });
  }
  function submitItem() {
    const priceCents = dollarsToCents(itemForm.price);
    if (!itemForm.name.trim() || priceCents === null || !itemForm.categoryId) return;
    const payload = {
      name: itemForm.name,
      description: itemForm.description || null,
      priceCents,
      categoryId: itemForm.categoryId,
    };
    if (itemModal.editing) {
      updateItem.mutate({ id: itemModal.editing.id, data: payload });
    } else {
      createItem.mutate({ data: { ...payload, isAvailable: true, sortOrder: 0, imageUrl: null } });
    }
  }

  function toggleAvailability(item: MenuItem) {
    updateItem.mutate({ id: item.id, data: { isAvailable: !item.isAvailable } });
  }

  const isLoading = categoriesQuery.isLoading || itemsQuery.isLoading;
  const isError = categoriesQuery.isError || itemsQuery.isError;
  const categories = categoriesQuery.data?.data ?? [];
  const items = itemsQuery.data?.data ?? [];

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
            <Text variant="display">Menu</Text>
            <Text variant="body" color="secondary">
              Toggle availability instantly — items are never deleted, only marked unavailable.
            </Text>
          </View>
          <Button label="New category" variant="secondary" onPress={openCreateCategory} />
        </View>

        {isLoading && (
          <View style={{ gap: spacing[5] }}>
            <MenuCategorySkeleton />
            <MenuCategorySkeleton />
          </View>
        )}

        {isError && (
          <Card>
            <ErrorState title="Couldn't load menu" onRetry={() => { categoriesQuery.refetch(); itemsQuery.refetch(); }} />
          </Card>
        )}

        {!isLoading && !isError && categories.length === 0 && (
          <Card>
            <EmptyState title="No categories yet" description="Create a category to start building the menu." actionLabel="New category" onAction={openCreateCategory} />
          </Card>
        )}

        {categories.map((category) => {
          const categoryItems = items.filter((item) => item.categoryId === category.id);
          return (
            <Card key={category.id} style={{ gap: spacing[5] }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Button label={category.name} variant="ghost" size="sm" onPress={() => openEditCategory(category)} />
                <Button label="Add item" size="sm" variant="secondary" onPress={() => openCreateItem(category.id)} />
              </View>
              <Divider />
              {categoryItems.length === 0 ? (
                <Text variant="body" color="muted">
                  No items in this category yet.
                </Text>
              ) : (
                <List gap={4}>
                  {categoryItems.map((item) => (
                    <ListRow
                      key={item.id}
                      surface={false}
                      left={
                        <>
                          <Button
                            label={item.name}
                            variant="ghost"
                            size="sm"
                            alignSelf="flex-start"
                            onPress={() => openEditItem(item)}
                          />
                          {item.description ? (
                            <Text variant="caption" color="muted">
                              {item.description}
                            </Text>
                          ) : null}
                        </>
                      }
                      right={
                        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[4] }}>
                          <Text variant="bodyMedium">{formatCents(item.priceCents)}</Text>
                          <Switch value={item.isAvailable} onValueChange={() => toggleAvailability(item)} />
                        </View>
                      }
                    />
                  ))}
                </List>
              )}
            </Card>
          );
        })}
      </View>

      <Modal
        visible={categoryModal.open}
        onClose={() => setCategoryModal({ open: false })}
        title={categoryModal.editing ? "Edit category" : "New category"}
      >
        <View style={{ gap: spacing[5] }}>
          <TextField label="Name" value={categoryForm.name} onChangeText={(name) => setCategoryForm({ name })} />
          <Button
            label="Save"
            loading={createCategory.isPending || updateCategory.isPending}
            onPress={submitCategory}
          />
        </View>
      </Modal>

      <Modal visible={itemModal.open} onClose={() => setItemModal({ open: false })} title={itemModal.editing ? "Edit menu item" : "New menu item"}>
        <View style={{ gap: spacing[5] }}>
          <TextField label="Name" value={itemForm.name} onChangeText={(name) => setItemForm((f) => ({ ...f, name }))} />
          <TextField
            label="Description"
            value={itemForm.description}
            onChangeText={(description) => setItemForm((f) => ({ ...f, description }))}
          />
          <TextField
            label="Price (USD)"
            value={itemForm.price}
            onChangeText={(price) => setItemForm((f) => ({ ...f, price }))}
            keyboardType="decimal-pad"
            placeholder="0.00"
            error={itemForm.price && dollarsToCents(itemForm.price) === null ? "Enter a valid price" : undefined}
          />
          <Select
            label="Category"
            value={itemForm.categoryId}
            onChange={(categoryId) => setItemForm((f) => ({ ...f, categoryId }))}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />
          <Button label="Save" loading={createItem.isPending || updateItem.isPending} onPress={submitItem} />
        </View>
      </Modal>
    </ScrollView>
  );
}
