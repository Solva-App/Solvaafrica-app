import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Alert,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
} from "react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import DropdownIcon from "@expo/vector-icons/Entypo";
import SearchFeather from "@expo/vector-icons/Feather";
import BackIcon from "@expo/vector-icons/Ionicons";
import MoreIcon from "@expo/vector-icons/Entypo";
import AvatarIcon from "@expo/vector-icons/FontAwesome";
import CheckCircleIcon from "@expo/vector-icons/FontAwesome";
import DownloadFeather from "@expo/vector-icons/Feather";
import { FlashList } from "@shopify/flash-list";
import LottieView from "lottie-react-native";

import { colors } from "../constants/theme";
import { universities, faculties } from "../constants/data";
import { hscale, mscale, wscale } from "../helpers/metric";
import { AUTH_API_CLIENT } from "../api/apiClient";
import { useDownloadFile } from "../hooks/useDownloadFile";
import CoursesList from "./coursesList";
import { Toast } from "toastify-react-native";

// ── Badge presets ─────────────────────────────────────────────────────────────
const BADGE_PRESETS = [
  { bg: "#E8F4FD", text: "#2A7FBE", label: "RESEARCH STUDY" },
  { bg: "#EAF0FF", text: "#3A5DB8", label: "EXPERIMENTAL" },
  { bg: "#FFF0EC", text: "#C05C3A", label: "CASE STUDY" },
];
const getBadge = (index: number) => BADGE_PRESETS[index % BADGE_PRESETS.length];

// ── Helper ────────────────────────────────────────────────────────────────────
const getFileNameFromUrl = (url?: string) => {
  if (!url) return "Project file.pdf";
  try {
    const cleanUrl = url.split("?")[0];
    const lastSegment = cleanUrl.substring(cleanUrl.lastIndexOf("/") + 1);
    return decodeURIComponent(lastSegment || "") || "Project file.pdf";
  } catch {
    return "Project file.pdf";
  }
};

const buildProjectFiles = (projectsList: any[]) =>
  (projectsList ?? []).flatMap((project: any, pi: number) =>
    (project?.document ?? []).map((doc: any, di: number) => ({
      fileName:
        doc?.name ||
        getFileNameFromUrl(doc?.url) ||
        project?.project?.name ||
        "Project file.pdf",
      fileURI: doc?.url,
      fileKey: `${doc?.url || "project-file"}-${pi}-${di}`,
    })),
  );

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────────────────────────────────────
export default function CoursesScreen() {
  const params = useLocalSearchParams();

  /** ── Dropdown state ── */
  const [university, setUniversity] = useState("");
  const [faculty, setFaculty] = useState("");
  const [department, setDepartment] = useState("");

  const allUniversities = useMemo(() => universities, []);
  const facultyList = useMemo(() => faculties, []);
  const departmentList = useMemo(() => {
    const sel = facultyList.find((f) => f.name === faculty);
    return sel?.departments ?? [];
  }, [facultyList, faculty]);

  useEffect(() => {
    if (allUniversities.length && !university)
      setUniversity(allUniversities[0]);
  }, [allUniversities]);

  useEffect(() => {
    const exists = facultyList.some((f) => f.name === faculty);
    if (facultyList.length && !exists) setFaculty(facultyList[0].name);
    else if (!facultyList.length) setFaculty("");
  }, [facultyList, faculty]);

  useEffect(() => {
    const exists = departmentList.includes(department);
    if (departmentList.length && !exists) setDepartment(departmentList[0]);
    else if (!departmentList.length) setDepartment("");
  }, [departmentList, department]);

  const handleSearch = () => {
    if (!university || !faculty || !department) {
      Alert.alert("Missing Information", "Please select all fields before searching");
      return;
    }
    router.push({
      pathname: "/courses/courses",
      params: { university, faculty, department },
    });
  };

  /** ── Project research state ── */
  const [initialProjects, setInitialProjects] = useState<any[]>([]);
  const [projectFiles, setProjectFiles] = useState<
    { fileName: string; fileURI: string; fileKey: string }[]
  >([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set());

  const filteredFiles = searchQuery.trim()
    ? projectFiles.filter((f) =>
        f.fileName.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : projectFiles;

  useEffect(() => {
    const fetchProjects = async () => {
      setLoadingProjects(true);
      try {
        const res = await AUTH_API_CLIENT.get("/projects");
        if (res.status === 200) {
          const all = res.data?.data || [];
          setInitialProjects(all);
          setProjectFiles(buildProjectFiles(all));
        }
      } catch {
        Toast.error("Error fetching projects");
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  /** ── If routed with params → show CoursesList instead ── */
  const universityParam = Array.isArray(params.university)
    ? params.university[0]
    : params.university;
  const facultyParam = Array.isArray(params.faculty)
    ? params.faculty[0]
    : params.faculty;
  const departmentParam = Array.isArray(params.department)
    ? params.department[0]
    : params.department;

  if (universityParam && facultyParam && departmentParam) {
    return <CoursesList />;
  }

  return (
    <ScrollView
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <BackIcon name="arrow-back" size={mscale(22)} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Courses</Text>
      </View>

      {/* ── Filter dropdowns ── */}
      <View style={styles.formContainer}>
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>University</Text>
          <DropDownPicker
            data={allUniversities}
            setSelectedValue={setUniversity}
            defaultValue={university}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Faculty</Text>
          <DropDownPicker
            data={facultyList.map((f) => f.name)}
            setSelectedValue={setFaculty}
            defaultValue={faculty}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Department</Text>
          <DropDownPicker
            data={departmentList}
            setSelectedValue={setDepartment}
            defaultValue={department}
          />
        </View>

        {/* Search button */}
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} activeOpacity={0.85}>
          <SearchFeather name="search" size={mscale(18)} color="#fff" />
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>

        {/* Pagination dot */}
        <View style={styles.dotRow}>
          <View style={styles.dotActive} />
        </View>
      </View>

      {/* ══════════════════════════════════════════
          PROJECT RESEARCH WORK SECTION
      ══════════════════════════════════════════ */}

      {/* Heading + count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>Project Research work</Text>
        <Text style={styles.resultsCount}>{filteredFiles.length} Results</Text>
      </View>

      {/* Search by name */}
      <View style={styles.projectSearchBar}>
        <SearchFeather name="search" size={mscale(16)} color="#AAA" />
        <TextInput
          style={styles.projectSearchInput}
          placeholder="Search by name"
          placeholderTextColor="#AAA"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Project cards */}
      {loadingProjects ? (
        <View style={styles.loadingWrap}>
          <LottieView
            autoPlay
            loop
            style={{ width: wscale(50), height: hscale(50) }}
            source={require("../../assets/animations/spin.json")}
          />
        </View>
      ) : filteredFiles.length === 0 ? (
        <Text style={styles.emptyText}>No projects found.</Text>
      ) : (
        filteredFiles.map((item, index) => (
          <ProjectCard
            key={item.fileKey}
            fileName={item.fileName}
            fileURI={item.fileURI}
            fileKey={item.fileKey}
            index={index}
            isDownloading={downloadingFiles.has(item.fileName)}
            onDownloadStart={() =>
              setDownloadingFiles((prev) => new Set(prev).add(item.fileName))
            }
            onDownloadComplete={() =>
              setDownloadingFiles((prev) => {
                const next = new Set(prev);
                next.delete(item.fileName);
                return next;
              })
            }
          />
        ))
      )}
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROJECT CARD
// ─────────────────────────────────────────────────────────────────────────────

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
      if (downloadTimeoutRef.current) clearTimeout(downloadTimeoutRef.current);
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
        downloadTimeoutRef.current = setTimeout(() => setDownloadSuccess(false), 3000);
        Toast.success(`Downloaded: ${fileName}`);
      } else {
        Toast.error(`Failed to download: ${fileName}`);
      }
    } catch {
      Toast.error(`Download failed: ${fileName}`);
    } finally {
      onDownloadComplete();
    }
  };

  const handleMobileDownload = () => {
    if (isDownloading || fileExist) return;
    if (DownloadIconRef.current) DownloadIconRef.current.play();
    setTimeout(() => handleDownload(), 300);
  };

  const cleanName = fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
  const descriptionText = `An intensive investigation into the chemical precipitation and adsorption techniques for ${cleanName}, covering core principles and research methodology.`;
  const displayDate = ["Oct 2023", "Sep 2023", "Aug 2023"][index % 3];
  const displaySize = ["2.4MB", "1.8MB", "4.1MB"][index % 3];

  return (
    <View style={styles.card}>
      {/* Badge + 3-dot */}
      <View style={styles.cardTopRow}>
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
        </View>
        <TouchableOpacity hitSlop={8}>
          <MoreIcon name="dots-three-vertical" size={mscale(16)} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text style={styles.cardTitle} numberOfLines={2}>
        {cleanName}
      </Text>

      {/* Description */}
      <Text style={styles.cardDesc} numberOfLines={3}>
        {descriptionText}
      </Text>

      {/* Footer */}
      <View style={styles.cardBottomRow}>
        <View style={styles.cardMeta}>
          <AvatarIcon name="user-circle" size={mscale(18)} color="#BBB" />
          <Text style={styles.cardMetaText}>{displayDate} • {displaySize}</Text>
        </View>

        {fileExist || downloadSuccess ? (
          <View style={styles.downloadBtn}>
            <CheckCircleIcon name="check-circle" size={mscale(14)} color={colors.primary} />
            <Text style={styles.downloadBtnText}>Downloaded</Text>
          </View>
        ) : isDownloading ? (
          <View style={styles.downloadBtn}>
            <LottieView
              autoPlay loop
              style={{ width: wscale(18), height: hscale(18) }}
              source={require("../../assets/animations/spin.json")}
            />
            <Text style={styles.downloadBtnText}>Downloading...</Text>
          </View>
        ) : (
          <Pressable
            style={styles.downloadBtn}
            onPress={Platform.OS === "web" ? handleDownload : handleMobileDownload}
          >
            {Platform.OS !== "web" ? (
              <LottieView
                ref={DownloadIconRef}
                style={{ width: wscale(18), height: hscale(18) }}
                source={require("../../assets/animations/download.json")}
              />
            ) : (
              <DownloadFeather name="download-cloud" size={mscale(14)} color={colors.primary} />
            )}
            <Text style={styles.downloadBtnText}>Download PDF</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DROPDOWN PICKER
// ─────────────────────────────────────────────────────────────────────────────

interface DropdownPickerProps {
  data: string[];
  setSelectedValue: React.Dispatch<React.SetStateAction<any>>;
  defaultValue: string;
}

function DropDownPicker({ data, setSelectedValue, defaultValue }: DropdownPickerProps) {
  const [dropdownIsVisibile, setDropdownIsVisibile] = useState(false);
  const dropdownViewRef = useRef<View | null>(null);
  const [dropdownY, setDropdownY] = useState(0);
  const [dropdownX, setDropdownX] = useState(0);
  const [dropdownWidth, setDropdownWidth] = useState(0);

  const measureDropdown = () => {
    dropdownViewRef.current?.measureInWindow((x, y, width, height) => {
      setDropdownX(x);
      setDropdownY(y + height);
      setDropdownWidth(width);
    });
  };

  useEffect(() => { measureDropdown(); }, []);

  const handleSelect = useCallback(
    (item: string) => { setSelectedValue(item); setDropdownIsVisibile(false); },
    [setSelectedValue],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: string; index: number }) => (
      <Pressable onPress={() => handleSelect(item)}>
        <Text style={[styles.dropDownListItem, { borderBottomWidth: index + 1 === data.length ? 0 : StyleSheet.hairlineWidth }]}>
          {item}
        </Text>
      </Pressable>
    ),
    [data.length, handleSelect],
  );

  return (
    <View ref={dropdownViewRef}>
      <Pressable
        onPress={() => { measureDropdown(); setDropdownIsVisibile((v) => !v); }}
        style={styles.dropdownInputContainer}
      >
        <Text numberOfLines={1} style={styles.dropdownValueText}>{defaultValue}</Text>
        <DropdownIcon name={dropdownIsVisibile ? "chevron-small-up" : "chevron-small-down"} size={mscale(22)} color="#333" />
      </Pressable>

      {dropdownIsVisibile && (
        <Modal transparent>
          <Pressable style={styles.overlay} onPress={() => setDropdownIsVisibile(false)}>
            <View style={[styles.dropDownContainer, { position: "absolute", top: dropdownY, left: dropdownX, width: dropdownWidth, height: hscale(300) }]}>
              <FlashList data={data} renderItem={renderItem} estimatedItemSize={50} keyExtractor={(item, i) => i + item} />
            </View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scrollView: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { paddingHorizontal: wscale(20), paddingTop: hscale(16), paddingBottom: hscale(40) },

  // Header
  header: { flexDirection: "row", alignItems: "center", marginBottom: hscale(24), gap: wscale(8) },
  backBtn: { padding: 4 },
  headerTitle: { fontFamily: "Inter-Bold", fontSize: mscale(20), color: colors.primary },

  // Form
  formContainer: { gap: hscale(14), marginBottom: hscale(8) },
  fieldGroup: { gap: hscale(5) },
  fieldLabel: { fontFamily: "Inter-Regular", fontSize: mscale(13), color: "#555", marginLeft: wscale(2) },

  // Dropdown
  dropdownInputContainer: { height: hscale(52), flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#F5F3FF", paddingHorizontal: wscale(16), borderRadius: mscale(10), borderWidth: 1, borderColor: "#E8E4F0" },
  dropdownValueText: { flex: 1, fontFamily: "Inter-Regular", fontSize: mscale(14), color: "#111" },
  overlay: { flex: 1 },
  dropDownContainer: { elevation: 5, shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 8, backgroundColor: "#fff", paddingVertical: hscale(8), borderRadius: mscale(12), borderWidth: 1, borderColor: "#E8E4F0" },
  dropDownListItem: { fontFamily: "Inter-Medium", fontSize: mscale(14), paddingVertical: hscale(12), paddingHorizontal: wscale(20), borderBottomColor: "#eee", color: "#333" },

  // Search button
  searchBtn: { backgroundColor: colors.primary, borderRadius: mscale(50), height: hscale(52), flexDirection: "row", alignItems: "center", justifyContent: "center", gap: wscale(8), marginTop: hscale(6) },
  searchBtnText: { fontFamily: "Inter-Bold", fontSize: mscale(16), color: "#fff" },

  // Dot
  dotRow: { flexDirection: "row", justifyContent: "center", marginTop: hscale(4), marginBottom: hscale(28) },
  dotActive: { width: wscale(8), height: wscale(8), borderRadius: wscale(4), backgroundColor: colors.primary },

  // Project section header
  resultsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: hscale(14) },
  resultsTitle: { fontFamily: "Inter-Bold", fontSize: mscale(18), color: "#111" },
  resultsCount: { fontFamily: "Inter-Bold", fontSize: mscale(13), color: colors.primary },

  // Project search bar
  projectSearchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8F8F8", borderRadius: mscale(10), borderWidth: 1, borderColor: "#EAEAEA", paddingHorizontal: wscale(12), height: hscale(44), marginBottom: hscale(16), gap: wscale(8) },
  projectSearchInput: { flex: 1, fontFamily: "Inter-Regular", fontSize: mscale(14), color: "#222" },

  loadingWrap: { alignItems: "center", paddingTop: hscale(40) },
  emptyText: { fontFamily: "Inter-Regular", fontSize: mscale(14), color: "#999", textAlign: "center", marginTop: hscale(30) },

  // Card
  card: { backgroundColor: "#fff", borderRadius: mscale(14), borderWidth: 1, borderColor: "#EEEBF5", paddingHorizontal: wscale(16), paddingVertical: hscale(14), marginBottom: hscale(14), shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: hscale(10) },
  badge: { borderRadius: mscale(6), paddingVertical: hscale(3), paddingHorizontal: wscale(10) },
  badgeText: { fontFamily: "Inter-Bold", fontSize: mscale(10), letterSpacing: 0.4 },
  cardTitle: { fontFamily: "Inter-Bold", fontSize: mscale(16), color: "#111", lineHeight: mscale(22), marginBottom: hscale(8), textTransform: "capitalize" },
  cardDesc: { fontFamily: "Inter-Regular", fontSize: mscale(13), color: "#666", lineHeight: mscale(19), marginBottom: hscale(14) },
  cardBottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#F0EDF6", paddingTop: hscale(10) },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: wscale(6) },
  cardMetaText: { fontFamily: "Inter-Regular", fontSize: mscale(12), color: "#999" },
  downloadBtn: { flexDirection: "row", alignItems: "center", gap: wscale(5) },
  downloadBtnText: { fontFamily: "Inter-Bold", fontSize: mscale(12), color: colors.primary },
});
