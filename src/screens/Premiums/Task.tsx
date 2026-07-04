import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";

import TaskCard from "../../components/taskCard";
import { AUTH_API_CLIENT } from "../../api/apiClient";
import { calcSpotsLeft, calcTimeLeft, normalizeTaskRecord } from "../../utils/taskNormalization";
import ProtectPage from "@/src/components/protectPage";

type ApiTask = Record<string, unknown>;

type TaskListItem = {
  id: string;
  brandName: string;
  campaignType: string;
  title: string;
  timeLeft: string;
  spotsLeft: string;
  totalPool: number;
  banner?: { uri: string };
  logo?: { uri: string };
};

async function fetchTasks(): Promise<ApiTask[]> {
  const res = await AUTH_API_CLIENT.get("/tasks");
  const payload = res.data;

  if (Array.isArray(payload?.data?.tasks)) return payload.data.tasks;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.tasks)) return payload.tasks;
  if (Array.isArray(payload)) return payload;

  throw new Error("Unexpected tasks response format");
}

export default function ExploreTaskScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<"high">("high");

  const { data, isLoading, isFetching, refetch, error } = useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
  });

  const tasks = useMemo<TaskListItem[]>(() => {
    const mappedTasks = (data ?? []).map((task, index) => {
      const normalizedTask = normalizeTaskRecord(task);

      return {
        id: normalizedTask.id ?? String(task.id ?? index),
        brandName: normalizedTask.brandName ?? "Unknown Brand",
        campaignType: normalizedTask.campaignType ?? "Campaign",
        title: normalizedTask.title ?? "Untitled Campaign",
        timeLeft: calcTimeLeft(normalizedTask.endDate),
        spotsLeft: calcSpotsLeft(normalizedTask.totalSpots, normalizedTask.usedSpots),
        totalPool: normalizedTask.totalPool,
        banner: normalizedTask.bannerImage ? { uri: normalizedTask.bannerImage } : undefined,
        logo: normalizedTask.sponsorLogo ? { uri: normalizedTask.sponsorLogo } : undefined,
      };
    });

    if (activeFilter === "high") {
      return mappedTasks.sort((a, b) => b.totalPool - a.totalPool);
    }

    return mappedTasks;
  }, [activeFilter, data]);

  const renderItem = useCallback(
    ({ item }: { item: TaskListItem }) => (
      <TaskCard
        {...item}
        onPress={() =>
          router.push({
            pathname: "/task-details",
            params: { id: item.id },
          })
        }
      />
    ),
    [router],
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6207A0" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>Could not load tasks</Text>
        <Pressable onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ProtectPage>
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable style={styles.iconButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#111111" />
        </Pressable>
        <Text style={styles.headerTitle}>Explore Task</Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.filtersRow}>
            {/* ── High Reward — stays on this page ── */}
            <Pressable
              style={[styles.filterButton, styles.filterButtonActive]}
              onPress={() => setActiveFilter("high")}
            >
              <Text style={[styles.filterText, styles.filterTextActive]}>
                High Reward {"\uD83D\uDD25"}
              </Text>
            </Pressable>

            {/* ── Earns — navigates to the Earning screen ── */}
            <Pressable
              style={styles.filterButton}
              onPress={() =>
                router.push({
                  pathname: "/earning",
                  params: { tab: "Earn" },
                })
              }
            >
              <Text style={styles.filterText}>Earns</Text>
            </Pressable>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.message}>No tasks available</Text>
          </View>
        }
      />
    </SafeAreaView>
    </ProtectPage>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F0EDF6",
  },
  header: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F0EDF6",
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerSpacer: {
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Inter-Bold",
    color: "#1A1A2E",
  },
  filtersRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  filterButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: "#C0B8D0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  filterButtonActive: {
    backgroundColor: "#4B006E",
    borderColor: "#4B006E",
  },
  filterText: {
    fontSize: 15,
    fontFamily: "Inter-SemiBold",
    color: "#555",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  message: {
    fontSize: 15,
    fontFamily: "Inter-Regular",
    color: "#555",
  },
  retryText: {
    marginTop: 10,
    fontSize: 15,
    fontFamily: "Inter-SemiBold",
    color: "#6207A0",
  },
});
