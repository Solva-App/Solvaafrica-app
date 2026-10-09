import "../patch-ethereum";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="(tabs)"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="(auth)"
          options={{ headerShown: false}}
          />
        </Stack>
        {/* Global toast — must be LAST child so it renders on top */}
        <Toast />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
