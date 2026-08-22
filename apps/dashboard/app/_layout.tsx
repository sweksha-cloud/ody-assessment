import { colors, ToastProvider } from "@odyssey/ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { View } from "react-native";
import { NavBar } from "../components/NavBar";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <NavBar />
          <View style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }} />
          </View>
        </View>
      </ToastProvider>
    </QueryClientProvider>
  );
}
