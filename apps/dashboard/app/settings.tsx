import { getGetSettingsQueryKey, useGetSettings, usePatchSettings } from "@odyssey/api-client";
import {
  Button,
  Card,
  ErrorState,
  layout,
  PageContainer,
  PageHeader,
  spacing,
  Spinner,
  Switch,
  TextField,
  useToast,
} from "@odyssey/ui";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

type FormState = {
  isOrderingEnabled: boolean;
  estimatedPrepTimeMinutes: string;
  taxRatePercent: string;
  currency: string;
};

export default function SettingsScreen() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { data, isLoading, isError, refetch } = useGetSettings();

  const [form, setForm] = useState<FormState | null>(null);

  useEffect(() => {
    if (data && !form) {
      setForm({
        isOrderingEnabled: data.data.isOrderingEnabled,
        estimatedPrepTimeMinutes: String(data.data.estimatedPrepTimeMinutes),
        taxRatePercent: data.data.taxRatePercent,
        currency: data.data.currency,
      });
    }
  }, [data, form]);

  const saveSettings = usePatchSettings({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
        showToast("Settings saved", "success");
      },
      onError: () => showToast("Couldn't save settings", "danger"),
    },
  });

  const prepTime = form ? Number.parseInt(form.estimatedPrepTimeMinutes, 10) : Number.NaN;
  const taxRate = form ? Number.parseFloat(form.taxRatePercent) : Number.NaN;
  const prepTimeValid = Number.isInteger(prepTime) && prepTime >= 0;
  const taxRateValid = !Number.isNaN(taxRate) && taxRate >= 0;
  const currencyValid = Boolean(form?.currency.trim());

  function submit() {
    if (!form || !prepTimeValid || !taxRateValid || !currencyValid) return;
    saveSettings.mutate({
      data: {
        isOrderingEnabled: form.isOrderingEnabled,
        estimatedPrepTimeMinutes: prepTime,
        taxRatePercent: taxRate.toFixed(2),
        currency: form.currency.trim().toUpperCase(),
      },
    });
  }

  return (
    <PageContainer maxWidth={layout.maxFormWidth}>
      <PageHeader title="Settings" description="Ordering settings apply immediately across the dashboard." />

      {isLoading && (
        <Card>
          <Spinner label="Loading settings…" />
        </Card>
      )}

      {isError && (
        <Card>
          <ErrorState title="Couldn't load settings" onRetry={() => refetch()} />
        </Card>
      )}

      {form && (
        <Card style={{ gap: spacing[6] }}>
          <Switch
            label="Ordering enabled"
            description="Turn off to stop accepting new orders"
            value={form.isOrderingEnabled}
            onValueChange={(isOrderingEnabled) => setForm((f) => (f ? { ...f, isOrderingEnabled } : f))}
          />

          <TextField
            label="Estimated prep time (minutes)"
            value={form.estimatedPrepTimeMinutes}
            onChangeText={(estimatedPrepTimeMinutes) => setForm((f) => (f ? { ...f, estimatedPrepTimeMinutes } : f))}
            keyboardType="number-pad"
            error={!prepTimeValid ? "Enter a whole number of minutes" : undefined}
          />

          <TextField
            label="Tax rate (%)"
            value={form.taxRatePercent}
            onChangeText={(taxRatePercent) => setForm((f) => (f ? { ...f, taxRatePercent } : f))}
            keyboardType="decimal-pad"
            error={!taxRateValid ? "Enter a valid percentage" : undefined}
          />

          <TextField
            label="Currency code"
            value={form.currency}
            onChangeText={(currency) => setForm((f) => (f ? { ...f, currency } : f))}
            autoCapitalize="characters"
            maxLength={3}
            error={!currencyValid ? "Currency is required" : undefined}
          />

          <Button
            label="Save changes"
            loading={saveSettings.isPending}
            disabled={!prepTimeValid || !taxRateValid || !currencyValid}
            onPress={submit}
          />
        </Card>
      )}
    </PageContainer>
  );
}
