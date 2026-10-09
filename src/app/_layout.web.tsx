import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import WebAppContainer from "../components/webAppContainer";
import Toast from "react-native-toast-message";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <WebAppContainer>
        <Stack
          screenOptions={{
            headerShown: false,
            title: "Solva Africa",
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="create-task" />
          <Stack.Screen name="review-fund" />
          <Stack.Screen name="explore-tasks" />
          <Stack.Screen name="task-details" />
          <Stack.Screen name="review-submissions" />
          <Stack.Screen name="creator-review" />
          <Stack.Screen name="manage-campaigns" />
          <Stack.Screen name="campaign-details" />
        </Stack>
        <Toast />
      </WebAppContainer>
    </QueryClientProvider>
  );
}
