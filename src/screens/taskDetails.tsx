import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import ToastManager, { Toast } from "toastify-react-native";

import { AUTH_API_CLIENT } from "../api/apiClient";
import { normalizeTaskRecord } from "../utils/taskNormalization";

type TaskDetailsData = Record<string, unknown>;
type SectionKey = "guidelines" | "criteria" | "submit";

const DEFAULT_OVERVIEW =
  "Create engaging and original content that promotes the product clearly, explains what it does, highlights the benefits, and encourages people to take action.";

const DEFAULT_MUST_INCLUDE = [
  "Clear mention of the product name",
  "What the product does",
  "At least 3 key benefits",
];

const DEFAULT_GUIDELINES = [
  "Content Type: Video / Image / Text (as specified)",
  "Length: 30-60 seconds (video) OR 150-300 words (text)",
  "Language: English (Pidgin allowed if specified)",
  "Original content only, no reposts or plagiarism",
  "Content must be clear, creative, and well-presented",
];

const DEFAULT_SELECTION_CRITERIA = [
  "Entries are reviewed for originality, clarity, and overall presentation.",
  "Only submissions that follow the brief and campaign rules will be considered.",
];

const DEFAULT_SUBMISSION_STEPS = [
  "Publish your content using the required campaign format.",
  "Paste the public content link in the field below.",
  "Confirm the certification box and submit your task.",
];

async function fetchTask(id: string): Promise<TaskDetailsData> {
  const res = await AUTH_API_CLIENT.get(`/tasks/${id}`);
  const payload = res.data;

  if (payload?.data?.data?.task && typeof payload.data.data.task === "object") {
    return payload.data.data.task;
  }

  if (payload?.data?.task && typeof payload.data.task === "object") {
    return payload.data.task;
  }

  if (payload?.task && typeof payload.task === "object") {
    return payload.task;
  }

  if (payload?.data && typeof payload.data === "object") {
    return payload.data;
  }

  if (payload && typeof payload === "object") {
    return payload;
  }

  throw new Error("Unexpected task response format");
}

async function submitTask(payload: { taskId: string; link: string }) {
  const res = await AUTH_API_CLIENT.post("/submissions/create", payload);
  return res.data.data;
}

function buildTaskSections(data: TaskDetailsData) {
  const normalizedTask = normalizeTaskRecord(data);

  return {
    bannerImage: normalizedTask.bannerImage,
    bannerTitle: normalizedTask.title ?? normalizedTask.brandName ?? "Task Campaign",
    overview: normalizedTask.overview ?? DEFAULT_OVERVIEW,
    mustInclude: normalizedTask.mustInclude,
    guidelines: normalizedTask.guidelines,
    selectionCriteria: normalizedTask.selectionCriteria,
    submissionSteps: normalizedTask.submissionSteps,
  };
}

function TaskAccordion({
  title,
  items,
  expanded,
  onPress,
}: {
  title: string;
  items: string[];
  expanded: boolean;
  onPress: () => void;
}) {
  return (
    <View style={[styles.accordionCard, expanded && styles.accordionCardExpanded]}>
      <Pressable style={styles.accordionHeader} onPress={onPress}>
        <Text style={styles.accordionTitle}>{title}</Text>
        <Feather name={expanded ? "chevron-down" : "chevron-right"} size={20} color="#111111" />
      </Pressable>

      {expanded ? (
        <View style={styles.accordionBody}>
          {items.map((item, index) => (
            <View key={`${title}-${index}`} style={styles.bulletRow}>
              <Text style={styles.bulletMark}>{"\u2022"}</Text>
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default function TaskDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [link, setLink] = useState("");
  const [certified, setCertified] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<SectionKey, boolean>>({
    guidelines: true,
    criteria: false,
    submit: false,
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["task", id],
    queryFn: () => fetchTask(id!),
    enabled: !!id,
  });

  const taskSections = useMemo(() => buildTaskSections(data ?? {}), [data]);

  const mutation = useMutation({
    mutationFn: submitTask,
    onSuccess: () => {
      Toast.success("Task submitted successfully");
      setLink("");
      setCertified(false);
    },
    onError: (err: any) => {
      console.log("Task submit error:", err);
      Toast.error(err?.response?.data?.message || "Submission failed. Please try again.");
    },
  });

  const handleToggleSection = useCallback((section: SectionKey) => {
    setExpandedSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  }, []);

  const handlePasteLink = useCallback(async () => {
    const clipboardValue = await Clipboard.getStringAsync();
    if (clipboardValue.trim()) {
      setLink(clipboardValue.trim());
    }
  }, []);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6207A0" />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>Could not load task</Text>
        <Pressable onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const mustIncludeItems = taskSections.mustInclude.length
    ? taskSections.mustInclude
    : DEFAULT_MUST_INCLUDE;
  const guidelineItems = taskSections.guidelines.length
    ? taskSections.guidelines
    : DEFAULT_GUIDELINES;
  const criteriaItems = taskSections.selectionCriteria.length
    ? taskSections.selectionCriteria
    : DEFAULT_SELECTION_CRITERIA;
  const submissionItems = taskSections.submissionSteps.length
    ? taskSections.submissionSteps
    : DEFAULT_SUBMISSION_STEPS;

  return (
    <SafeAreaView style={styles.safe}>
      <ToastManager />
      <View style={styles.header}>
        <Pressable style={styles.iconButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#111111" />
        </Pressable>
        <Text style={styles.headerTitle}>Task Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <ImageBackground
          source={
            taskSections.bannerImage
              ? { uri: taskSections.bannerImage }
              : require("../../assets/images/jobBanner.png")
          }
          resizeMode="cover"
          imageStyle={styles.bannerImage}
          style={styles.bannerCard}
        >
          {!taskSections.bannerImage ? (
            <View style={styles.bannerFallbackOverlay}>
              <Text style={styles.bannerFallbackText}>{taskSections.bannerTitle}</Text>
            </View>
          ) : null}
        </ImageBackground>

        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Task Overview</Text>
          <Text style={styles.cardDescription}>{taskSections.overview}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionHeading}>What Your Content Must Include</Text>
          <View style={styles.requirementsList}>
            {mustIncludeItems.map((item, index) => (
              <View key={`requirement-${index}`} style={styles.requirementChip}>
                <Text style={styles.requirementText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <TaskAccordion
          title="Content Guidelines"
          items={guidelineItems}
          expanded={expandedSections.guidelines}
          onPress={() => handleToggleSection("guidelines")}
        />

        <TaskAccordion
          title="Selection Criteria"
          items={criteriaItems}
          expanded={expandedSections.criteria}
          onPress={() => handleToggleSection("criteria")}
        />

        <TaskAccordion
          title="How to submit"
          items={submissionItems}
          expanded={expandedSections.submit}
          onPress={() => handleToggleSection("submit")}
        />

        <View style={styles.linkSection}>
          <Text style={styles.linkSectionTitle}>Content Link</Text>

          <View style={styles.linkInputRow}>
            <View style={styles.linkIconWrap}>
              <Feather name="link-2" size={22} color="#8E2BFF" />
            </View>

            <TextInput
              value={link}
              onChangeText={setLink}
              placeholder="https://.com/.................."
              placeholderTextColor="#4C4C4C"
              style={styles.linkInput}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Pressable style={styles.pasteButton} onPress={handlePasteLink}>
              <Text style={styles.pasteButtonText}>Paste</Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          onPress={() => setCertified((current) => !current)}
          style={styles.certificationCard}
        >
          <View style={[styles.checkbox, certified && styles.checkboxChecked]}>
            {certified ? <Feather name="check" size={18} color="#6207A0" /> : null}
          </View>
          <Text style={styles.certificationText}>
            I certify that I followed all campaign rules and the content is my work.
          </Text>
        </Pressable>

        <Pressable
          disabled={!link.trim() || !certified || mutation.isPending}
          onPress={() => mutation.mutate({ taskId: id!, link: link.trim() })}
          style={[
            styles.submitButton,
            (!link.trim() || !certified || mutation.isPending) && styles.submitButtonDisabled,
          ]}
        >
          <Text style={styles.submitButtonText}>
            {mutation.isPending ? "Submitting..." : "Submit Task"}
          </Text>
          <Feather name="send" size={24} color="#FFFFFF" />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    height: 64,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    fontWeight: "800",
    color: "#111111",
  },
  contentContainer: {
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 28,
  },
  bannerCard: {
    height: 185,
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: 38,
    backgroundColor: "#29CFA6",
  },
  bannerImage: {
    borderRadius: 22,
  },
  bannerFallbackOverlay: {
    flex: 1,
    backgroundColor: "rgba(16, 155, 124, 0.40)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  bannerFallbackText: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 28,
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111111",
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: "#7A7A7A",
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "800",
    color: "#8A8A8A",
    marginBottom: 14,
  },
  requirementsList: {
    gap: 12,
  },
  requirementChip: {
    backgroundColor: "#F2F3F5",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  requirementText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    color: "#7A7A7A",
  },
  accordionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    marginBottom: 18,
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    overflow: "hidden",
  },
  accordionCardExpanded: {
    paddingBottom: 4,
  },
  accordionHeader: {
    minHeight: 72,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111111",
  },
  accordionBody: {
    borderTopWidth: 1,
    borderTopColor: "#E4E4E4",
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 10,
    gap: 12,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  bulletMark: {
    fontSize: 16,
    lineHeight: 24,
    color: "#7A7A7A",
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: "#7A7A7A",
  },
  linkSection: {
    marginTop: 40,
    marginBottom: 24,
  },
  linkSectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111111",
    marginBottom: 16,
  },
  linkInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3EFFA",
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 18,
    minHeight: 74,
  },
  linkIconWrap: {
    width: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  linkInput: {
    flex: 1,
    fontSize: 14,
    color: "#111111",
    paddingVertical: 18,
    marginLeft: 8,
  },
  pasteButton: {
    marginLeft: 14,
  },
  pasteButtonText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#6207A0",
  },
  certificationCard: {
    minHeight: 108,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#A1A1A1",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    marginBottom: 46,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: "#8D8D8D",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    borderColor: "#6207A0",
    backgroundColor: "#F3EAFF",
  },
  certificationText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
    color: "#6E6E6E",
  },
  submitButton: {
    minHeight: 74,
    borderRadius: 37,
    backgroundColor: "#6207A0",
    paddingHorizontal: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
  },
  submitButtonDisabled: {
    opacity: 0.55,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    fontSize: 15,
    color: "#111111",
  },
  retryText: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "700",
    color: "#6207A0",
  },
});
