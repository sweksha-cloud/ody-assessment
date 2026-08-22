import { useGetHealth } from "@odyssey/api-client";
import { Text, View } from "react-native";

// Home page — wired up to real data and the other 4 pages in Phase 6.
// For now this just proves the Drizzle -> Hono/OpenAPI -> Orval -> hook
// pipeline works end to end by rendering the live /health response.
export default function HomeScreen() {
  const { data, isLoading, isError, error } = useGetHealth();

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 8 }}>
      <Text>Odyssey Dashboard</Text>
      {isLoading && <Text>Checking backend health…</Text>}
      {isError && <Text>Health check failed: {String(error)}</Text>}
      {data && (
        <Text>
          status: {data.data.status} @ {data.data.timestamp}
        </Text>
      )}
    </View>
  );
}
