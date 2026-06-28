import CheckCircleIcon from "@expo/vector-icons/FontAwesome";
import MoreIcon from "@expo/vector-icons/Entypo";
import AvatarIcon from "@expo/vector-icons/FontAwesome";
import DownloadFeather from "@expo/vector-icons/Feather";
import SearchIcon from "@expo/vector-icons/Feather";
import {
  Alert,
  Pressable,
  Text,
  View,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import LottieView from "lottie-react-native";

import { useDownloadFile } from "../hooks/useDownloadFile";
import { hscale, mscale, wscale } from "../helpers/metric";
import { AUTH_API_CLIENT } from "../api/apiClient";
import { colors } from "../constants/theme";
import EmptyStateView from "../components/emptyStateView";
import { Toast } from "toastify-react-native";

// ── Badge colours ─────────────────────────────────────────────────────────────
const BADGE_PRESETS = [
  { bg: "#E8F4FD", text: "#2A7FBE", label: "RESEARCH STUDY" },
  { bg: "#EAF0FF", text: "#3A5DB8", label: "EXPERIMENTAL" },
  { bg: "#FFF0EC", text: "#C05C3A", label: "CASE STUDY" },
];

const getBadge = (index: number) => BADGE_PRESETS[index % BADGE_PRESETS.length];

export default function ProjectsScreen() {
  const getFileNameFromUrl = (url?: string) => {
    if (!url) return "Project file.pdf";
    try {
      const cleanUrl = url.split("?")[0];
      const lastSegment = cleanUrl.substring(cleanUrl.lastIndexOf("/") + 1);
      const decoded = decodeURIComponent(lastSegment || "");
      return decoded || "Project file.pdf";
    } catch {
      return "Project file.pdf";
    }
  };

  const buildProjectFiles = (projectsList: any[]) =>
    (projectsList ?? []).flatMap((project: any, projectIndex: number) =>
      (project?.document ?? []).map((doc: any, docIndex: number) => ({
        fileName:
          doc?.name ||
          getFileNameFromUrl(doc?.url) ||
          project?.project?.name ||
          "Project file.pdf",
        fileURI: doc?.url,
        fileKey: `${doc?.url || "project-file"}-${projectIndex}-${docIndex}`,
      })),
    );

  const [initialProjects, setInitialProjects] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [projectFiles, setProjectFiles] = useState<
    Array<{ fileName: string; fileURI: string; fileKey: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    const fetchInitialProjects = async () => {
      setLoading(true);
      try {
        const res = await AUTH_API_CLIENT.get("/projects");
        if (res.status === 200) {
          const allProjects = res.data?.data || [];
          setInitialProjects(allProjects);
          setProjects(allProjects);
          setProjectFiles(buildProjectFiles(allProjects));
        }
      } catch (error) {
        Toast.error("Error fetching initial projects");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialProjects();
  }, []);

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    const query = value.trim().toLowerCase();
    if (!query.length) {
      setProjects(initialProjects);
      setProjectFiles(buildProjectFiles(initialProjects));
      return;
    }
    const filteredProjects = initialProjects.filter((project: any) =>
      project.project.name.toLowerCase().includes(query),
    );
    setProjects(filteredProjects);
    setProjectFiles(buildProjectFiles(filteredProjects));
  };

  const addDownloadingFile = (fileName: string) => {
    setDownloadingFiles((prev) => new Set(prev).add(fileName));
  };

  const removeDownloadingFile = (fileName: string) => {
    setDownloadingFiles((prev) => {
      const newSet = new Set(prev);
      newSet.delete(fileName);
      return newSet;
    });
  };

  return (
    <View style={styles.screen}>
      {/* ── Section heading + count ── */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>Project Research work</Text>
        <Text style={styles.resultsCount}>
          {projectFiles.length} Results
        </Text>
      </View>

      {/* ── Search bar ── */}
      <View style={styles.searchBar}>
        <SearchIcon name="search" size={mscale(16)} color="#AAA" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name"
          placeholderTextColor="#AAA"
          value={searchQuery}
          onChangeText={handleInputChange}
        />
      </View>

      {/* ── List ── */}
      <ScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: hscale(24) }}
      >
        {loading ? (
          <View style={styles.loadingWrap}>
            <LottieView
              autoPlay
              loop
              style={{ width: wscale(50), height: hscale(50) }}
              source={require("../../assets/animations/spin.json")}
            />
          </View>
        ) : projects?.length && projectFiles?.length ? (
          projectFiles.map((item, index) => (
            <ProjectCard
              key={item.fileKey}
              fileName={item.fileName}
              fileURI={item.fileURI}
              fileKey={item.fileKey}
              index={index}
              isDownloading={downloadingFiles.has(item.fileName)}
              onDownloadStart={() => addDownloadingFile(item.fileName)}
              onDownloadComplete={() => removeDownloadingFile(item.fileName)}
            />
          ))
        ) : (
          <EmptyStateView />
        )}
      </ScrollView>
    </View>
  );
}

// ── Project Card ──────────────────────────────────────────────────────────────

interface ProjectCardProps {
  fileName: string;
  fileURI: string;
  fileKey: string;
  index: number;
  isDownloading: boolean;
  onDownloadStart: () => void;
  onDownloadComplete: () => void;
}

const ProjectCard = ({
  fileName,
  fileURI,
  fileKey,
  index,
  isDownloading,
  onDownloadStart,
  onDownloadComplete,
}: ProjectCardProps) => {
  const [fileExist, setFileExist] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const downloadFile = useDownloadFile(true, "PRJ");
  const DownloadIconRef = useRef<LottieView>(null);
  const downloadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const badge = getBadge(index);

  useEffect(() => {
    return () => {
      if (downloadTimeoutRef.current) {
        clearTimeout(downloadTimeoutRef.current);
      }
    };
  }, []);

  const handleDownload = async () => {
    if (isDownloading || fileExist) return;
    onDownloadStart();
    try {
      const result = await downloadFile("Projects", fileURI, fileName);
      if (result.success) {
        setFileExist(true);
        setDownloadSuccess(true);
        if (downloadTimeoutRef.current) clearTimeout(downloadTimeoutRef.current);
        downloadTimeoutRef.current = setTimeout(() => {
          setDownloadSuccess(false);
        }, 3000);
        Toast.success(`Downloaded: ${fileName}`);
      } else {
        Toast.error(`Failed to download: ${fileName}`);
      }
    } catch (error) {
      Toast.error(`Download failed: ${fileName}`);
    } finally {
      onDownloadComplete();
    }
  };

  const handleMobileDownload = () => {
    if (isDownloading || fileExist) return;
    if (DownloadIconRef.current) DownloadIconRef.current.play();
    setTimeout(() => { handleDownload(); }, 300);
  };

  // Derive a short description from filename
  const descriptionText = `An intensive investigation into the study of ${fileName
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]/g, " ")}, covering core principles and research techniques for academic advancement.`;

  // Mock date/size (replace with real API data when available)
  const displayDate = ["Oct 2023", "Sep 2023", "Aug 2023"][index % 3];
  const displaySize = ["2.4MB", "1.8MB", "4.1MB"][index % 3];

  return (
    <View style={styles.card}>
      {/* ── Top row: badge + 3-dot ── */}
      <View style={styles.cardTopRow}>
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.badgeText, { color: badge.text }]}>
            {badge.label}
          </Text>
        </View>
        <TouchableOpacity hitSlop={8}>
          <MoreIcon name="dots-three-vertical" size={mscale(16)} color="#999" />
        </TouchableOpacity>
      </View>

      {/* ── Title ── */}
      <Text style={styles.cardTitle} numberOfLines={2}>
        {fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")}
      </Text>

      {/* ── Description ── */}
      <Text style={styles.cardDesc} numberOfLines={3}>
        {descriptionText}
      </Text>

      {/* ── Bottom row: meta + download ── */}
      <View style={styles.cardBottomRow}>
        <View style={styles.cardMeta}>
          <AvatarIcon name="user-circle" size={mscale(18)} color="#BBB" />
          <Text style={styles.cardMetaText}>
            {displayDate} • {displaySize}
          </Text>
        </View>

        {/* Download PDF */}
        {fileExist || downloadSuccess ? (
          <View style={styles.downloadBtn}>
            <CheckCircleIcon name="check-circle" size={mscale(14)} color={colors.primary} />
            <Text style={styles.downloadBtnText}>Downloaded</Text>
          </View>
        ) : isDownloading ? (
          <View style={styles.downloadBtn}>
            <LottieView
              autoPlay
              loop
              style={{ width: wscale(18), height: hscale(18) }}
              source={require("../../assets/animations/spin.json")}
            />
            <Text style={styles.downloadBtnText}>Downloading...</Text>
          </View>
        ) : (
          <Pressable
            style={styles.downloadBtn}
            onPress={
              Platform.OS === "web" ? handleDownload : handleMobileDownload
            }
          >
            {Platform.OS !== "web" ? (
              <LottieView
                ref={DownloadIconRef}
                style={{ width: wscale(18), height: hscale(18) }}
                source={require("../../assets/animations/download.json")}
              />
            ) : (
              <DownloadFeather
                name="download-cloud"
                size={mscale(14)}
                color={colors.primary}
              />
            )}
            <Text style={styles.downloadBtnText}>Download PDF</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: wscale(20),
    paddingTop: hscale(16),
  },

  // ── Results header ──
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hscale(14),
  },
  resultsTitle: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(18),
    color: "#111",
  },
  resultsCount: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(13),
    color: colors.primary,
  },

  // ── Search Bar ──
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    borderRadius: mscale(10),
    borderWidth: 1,
    borderColor: "#EAEAEA",
    paddingHorizontal: wscale(12),
    height: hscale(44),
    marginBottom: hscale(16),
    gap: wscale(8),
  },
  searchInput: {
    flex: 1,
    fontFamily: "Inter-Regular",
    fontSize: mscale(14),
    color: "#222",
  },

  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: hscale(60),
  },

  // ── Project Card ──
  card: {
    backgroundColor: "#fff",
    borderRadius: mscale(14),
    borderWidth: 1,
    borderColor: "#EEEBF5",
    paddingHorizontal: wscale(16),
    paddingVertical: hscale(14),
    marginBottom: hscale(14),
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hscale(10),
  },
  badge: {
    borderRadius: mscale(6),
    paddingVertical: hscale(3),
    paddingHorizontal: wscale(10),
  },
  badgeText: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(10),
    letterSpacing: 0.4,
  },
  cardTitle: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(16),
    color: "#111",
    lineHeight: mscale(22),
    marginBottom: hscale(8),
    textTransform: "capitalize",
  },
  cardDesc: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(13),
    color: "#666",
    lineHeight: mscale(19),
    marginBottom: hscale(14),
  },
  cardBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#F0EDF6",
    paddingTop: hscale(10),
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: wscale(6),
  },
  cardMetaText: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(12),
    color: "#999",
  },
  downloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: wscale(5),
  },
  downloadBtnText: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(12),
    color: colors.primary,
  },
});
