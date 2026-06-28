import { useLocalSearchParams, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  Pressable,
  Alert,
  Animated,
  Easing,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import DownloadIcon from "@expo/vector-icons/Feather";
import BackIcon from "@expo/vector-icons/Ionicons";
import SearchIcon from "@expo/vector-icons/Feather";
import UniversityIcon from "@expo/vector-icons/FontAwesome";
import PDFIcon from "@expo/vector-icons/FontAwesome6";
import { FlashList } from "@shopify/flash-list";
import { useCallback, useEffect, useRef, useState } from "react";
import * as FileSystem from "expo-file-system";

import { hscale, mscale, wscale } from "../helpers/metric";
import EmptyStateView from "../components/emptyStateView";
import LoadingView from "../components/loadingView";
import { AUTH_API_CLIENT } from "../api/apiClient";
import { colors } from "../constants/theme";
import ErrorModal from "../components/errorModal";
import { DownloadedFileRef } from "../types";
import { useDownloadFile } from "../hooks/useDownloadFile";
import { normalizeRemoteFileUrl } from "../helpers/normalizeRemoteFileUrl";

// ─── Helpers (unchanged) ──────────────────────────────────────────────────────

const normalizeText = (value?: string | null) =>
  (value ?? "")
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/&/g, " and ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const extractCoursesFromResponse = (payload: any): any[] => {
  const responseData = payload?.data;
  if (Array.isArray(responseData)) return responseData;
  if (Array.isArray(responseData?.documents)) return responseData.documents;
  if (Array.isArray(payload?.documents)) return payload.documents;
  if (Array.isArray(payload)) return payload;
  return [];
};

const buildUniversityCandidates = (university: string) => {
  const raw = university?.trim();
  if (!raw) return [];
  const candidates = new Set<string>();
  const withoutBracket = raw.replace(/\s*\([^)]*\)\s*/g, "").trim();
  const bracketMatch = raw.match(/\(([^)]+)\)/);
  candidates.add(raw);
  if (withoutBracket) candidates.add(withoutBracket);
  if (bracketMatch?.[1]) candidates.add(bracketMatch[1].trim());
  return Array.from(candidates).map(normalizeText).filter(Boolean);
};

const matchesSelectedValue = (
  actualValue: string | undefined,
  selectedValue: string,
) => {
  const actual = normalizeText(actualValue);
  const selected = normalizeText(selectedValue);
  if (!actual || !selected) return false;
  return (
    actual === selected ||
    actual.includes(selected) ||
    selected.includes(actual)
  );
};

type CourseDocument = { url?: string; name?: string };

const normalizeCourseCode = (value?: string | null) =>
  String(value ?? "").trim().toLowerCase();

const normalizeFileName = (value?: string | null) =>
  String(value ?? "").trim().toLowerCase();

const getCourseDownloadKey = ({
  courseCode,
  fileName,
  fileUrl,
}: {
  courseCode?: string | null;
  fileName?: string | null;
  fileUrl?: string | null;
}) => {
  const normalizedUrl = normalizeRemoteFileUrl(fileUrl);
  if (normalizedUrl) return `url:${normalizedUrl}`;
  return `legacy:${normalizeCourseCode(courseCode)}:${normalizeFileName(fileName)}`;
};

const getStoredCourseDownloadKey = (item: DownloadedFileRef) =>
  getCourseDownloadKey({
    courseCode: item.fileCode,
    fileName: item.fileName,
    fileUrl:
      item.sourceUrl ||
      (item.filePath.startsWith("http://") ||
      item.filePath.startsWith("https://")
        ? item.filePath
        : undefined),
  });

const getValidCourseDocuments = (courseDocuments: CourseDocument[] = []) =>
  courseDocuments.filter(
    (doc): doc is Required<CourseDocument> => !!doc?.url && !!doc?.name,
  );

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CoursesList() {
  const params = useLocalSearchParams();
  const universityParam = Array.isArray(params.university)
    ? params.university[0]
    : params.university;
  const departmentParam = Array.isArray(params.department)
    ? params.department[0]
    : params.department;
  const facultyParam = Array.isArray(params.faculty)
    ? params.faculty[0]
    : params.faculty;

  const [coursesList, setCoursesList] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [downloadedCourseKeys, setDownloadedCourseKeys] = useState<Set<string>>(
    new Set(),
  );
  const [downloadingCourseKeys, setDownloadingCourseKeys] = useState<
    Set<string>
  >(new Set());
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const downloadCourseFile = useDownloadFile(true);

  useFocusEffect(
    useCallback(() => {
      const fetchDownloadedCourses = async () => {
        try {
          const raw = await AsyncStorage.getItem("DownloadRefs");
          const downloads: DownloadedFileRef[] = raw ? JSON.parse(raw) : [];
          const courseKeys = new Set(
            downloads
              .filter((item) => item.parentDirectory === "Courses")
              .map(getStoredCourseDownloadKey),
          );
          setDownloadedCourseKeys(courseKeys);
        } catch (error) {
          console.log("error fetching downloaded courses", error);
          setDownloadedCourseKeys(new Set());
        }
      };
      fetchDownloadedCourses();
    }, []),
  );

  const handleDownloadIconPress = async (
    courseCode: string,
    courseDocuments: CourseDocument[],
  ) => {
    const validDocuments = getValidCourseDocuments(courseDocuments);
    if (!validDocuments.length) {
      Alert.alert("No files", "This course has no downloadable files yet.");
      return;
    }
    const courseDocumentKeys = validDocuments.map((doc) =>
      getCourseDownloadKey({ courseCode, fileName: doc.name, fileUrl: doc.url }),
    );
    try {
      const raw = await AsyncStorage.getItem("DownloadRefs");
      const downloads: DownloadedFileRef[] = raw ? JSON.parse(raw) : [];
      const matchingCourseDownloads = downloads.filter(
        (item) =>
          item.parentDirectory === "Courses" &&
          courseDocumentKeys.includes(getStoredCourseDownloadKey(item)),
      );
      const existingCourseDownloadKeys = new Set(
        matchingCourseDownloads.map(getStoredCourseDownloadKey),
      );
      const nextDocumentToDownload = validDocuments.find(
        (doc) =>
          !existingCourseDownloadKeys.has(
            getCourseDownloadKey({
              courseCode,
              fileName: doc.name,
              fileUrl: doc.url,
            }),
          ),
      );
      if (nextDocumentToDownload) {
        const nextDocumentKey = getCourseDownloadKey({
          courseCode,
          fileName: nextDocumentToDownload.name,
          fileUrl: nextDocumentToDownload.url,
        });
        setDownloadingCourseKeys((prev) => new Set(prev).add(nextDocumentKey));
        try {
          const result = await downloadCourseFile(
            "Courses",
            nextDocumentToDownload.url,
            nextDocumentToDownload.name,
            courseCode,
          );
          if (result?.success) {
            setDownloadedCourseKeys((prev) =>
              new Set(prev).add(nextDocumentKey),
            );
          }
        } finally {
          setDownloadingCourseKeys((prev) => {
            const next = new Set(prev);
            next.delete(nextDocumentKey);
            return next;
          });
        }
        return;
      }
      Alert.alert(
        "Delete downloaded files?",
        `Remove ${matchingCourseDownloads.length} downloaded file(s) for ${courseCode}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              for (const item of matchingCourseDownloads) {
                const isRemotePath =
                  item.platform === "web" ||
                  item.filePath.startsWith("http://") ||
                  item.filePath.startsWith("https://");
                if (isRemotePath) continue;
                try {
                  await FileSystem.deleteAsync(item.filePath, {
                    idempotent: true,
                  });
                } catch (deleteError) {
                  console.log("error deleting local file", deleteError);
                }
              }
              const filteredDownloads = downloads.filter(
                (item) =>
                  !(
                    item.parentDirectory === "Courses" &&
                    courseDocumentKeys.includes(
                      getStoredCourseDownloadKey(item),
                    )
                  ),
              );
              await AsyncStorage.setItem(
                "DownloadRefs",
                JSON.stringify(filteredDownloads),
              );
              setDownloadedCourseKeys((prev) => {
                const next = new Set(prev);
                courseDocumentKeys.forEach((k) => next.delete(k));
                return next;
              });
            },
          },
        ],
      );
    } catch (error) {
      console.log("error deleting downloaded course files", error);
    }
  };

  useEffect(() => {
    if (!universityParam || !departmentParam || !facultyParam) {
      setCoursesList([]);
      return;
    }
    const fetchCourses = async () => {
      setLoadingCourses(true);
      try {
        const res = await AUTH_API_CLIENT.get("/questions", {
          params: {
            university: universityParam,
            department: departmentParam,
            faculty: facultyParam,
          },
        });
        let courses = extractCoursesFromResponse(res.data);
        if (!courses.length) {
          const fallbackRes = await AUTH_API_CLIENT.get("/questions");
          const allCourses = extractCoursesFromResponse(fallbackRes.data);
          const universityCandidates =
            buildUniversityCandidates(universityParam);
          courses = allCourses.filter((item: any) => {
            const question = item?.question ?? {};
            const universityOk =
              universityCandidates.length === 0
                ? true
                : universityCandidates.some((candidate) =>
                    matchesSelectedValue(question.university, candidate),
                  );
            const facultyOk = matchesSelectedValue(
              question.faculty,
              facultyParam,
            );
            const departmentOk = matchesSelectedValue(
              question.department,
              departmentParam,
            );
            return universityOk && facultyOk && departmentOk;
          });
        }
        setCoursesList(courses);
      } catch (error) {
        console.log("error fetching courses", error);
        setErrorMessage("Something went wrong!");
        setErrorVisible(true);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, [universityParam, departmentParam, facultyParam]);

  if (loadingCourses) return <LoadingView isLoading={loadingCourses} />;

  return (
    <View style={styles.screen}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <BackIcon name="arrow-back" size={mscale(22)} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Courses</Text>
        <TouchableOpacity style={styles.searchIconBtn}>
          <SearchIcon name="search" size={mscale(20)} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* ── Department chip ── */}
      {!!departmentParam && (
        <View style={styles.chipRow}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{departmentParam}</Text>
          </View>
        </View>
      )}

      {/* ── Course list ── */}
      {!coursesList.length ? (
        <EmptyStateView />
      ) : (
        <FlashList
          data={coursesList}
          extraData={{ downloadedCourseKeys, downloadingCourseKeys }}
          estimatedItemSize={coursesList.length}
          keyExtractor={(item) => String(item.question.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: hscale(20) }}
          renderItem={({ item }) => {
            const courseCode = String(item.question.courseCode ?? "");
            const courseDocuments = getValidCourseDocuments(
              Array.isArray(item.document) ? item.document : [],
            );
            const courseDocumentKeys = courseDocuments.map((doc) =>
              getCourseDownloadKey({
                courseCode,
                fileName: doc.name,
                fileUrl: doc.url,
              }),
            );
            const isDownloaded =
              courseDocumentKeys.length > 0 &&
              courseDocumentKeys.every((k) => downloadedCourseKeys.has(k));
            const isDownloading = courseDocumentKeys.some((k) =>
              downloadingCourseKeys.has(k),
            );
            return (
              <CoursesListItem
                courseTitle={item.question.title}
                courseCode={courseCode}
                university={item.question.university}
                courseId={String(item.question.id)}
                hasDownloadableFiles={courseDocuments.length > 0}
                isDownloaded={isDownloaded}
                isDownloading={isDownloading}
                onDownloadIconPress={() =>
                  handleDownloadIconPress(courseCode, courseDocuments)
                }
              />
            );
          }}
        />
      )}

      <ErrorModal
        visible={errorVisible}
        message={errorMessage}
        onClose={() => setErrorVisible(false)}
      />
    </View>
  );
}

// ─── Course Card ──────────────────────────────────────────────────────────────

interface CourseListItemProps {
  courseTitle: string;
  courseCode: string;
  university: string;
  courseId: string;
  hasDownloadableFiles: boolean;
  isDownloaded: boolean;
  isDownloading: boolean;
  onDownloadIconPress: () => void;
}

const CoursesListItem = ({
  courseTitle,
  courseCode,
  university,
  courseId,
  hasDownloadableFiles,
  isDownloaded,
  isDownloading,
  onDownloadIconPress,
}: CourseListItemProps) => {
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isDownloading) {
      spinAnim.stopAnimation();
      spinAnim.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => {
      loop.stop();
      spinAnim.stopAnimation();
      spinAnim.setValue(0);
    };
  }, [isDownloading, spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const handleCourseListItemPressed = () => {
    router.push({
      pathname: "/courses/materials",
      params: { courseId, headerTitle: `${courseTitle} Materials`, courseCode },
    });
  };

  return (
    <View style={styles.card}>
      {/* ── Card body: PDF icon + info ── */}
      <View style={styles.cardBody}>
        {/* PDF icon */}
        <View style={styles.pdfIconWrap}>
          <PDFIcon name="file-pdf" size={mscale(22)} color={colors.primary} />
          <Text style={styles.pdfLabel}>PDF</Text>
        </View>

        {/* Course info */}
        <View style={styles.courseInfo}>
          <Text style={styles.courseCode}>{courseCode}</Text>
          <Text style={styles.courseTitle} numberOfLines={1}>
            {courseTitle}
          </Text>
          <View style={styles.universityRow}>
            <UniversityIcon name="university" size={mscale(11)} color="#AAA" />
            <Text style={styles.universityText} numberOfLines={1}>
              {university}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Card footer: View button + download icon ── */}
      <View style={styles.cardFooter}>
        <Pressable
          style={styles.viewBtn}
          onPress={handleCourseListItemPressed}
        >
          <Text style={styles.viewBtnText}>View</Text>
        </Pressable>

        <Pressable
          style={[
            styles.downloadIconBtn,
            !hasDownloadableFiles && { opacity: 0.4 },
          ]}
          onPress={(e) => {
            e.stopPropagation();
            onDownloadIconPress();
          }}
          disabled={isDownloading || !hasDownloadableFiles}
        >
          <Animated.View
            style={
              isDownloading ? { transform: [{ rotate: spin }] } : undefined
            }
          >
            <DownloadIcon
              name={
                isDownloading
                  ? "loader"
                  : isDownloaded
                    ? "check-circle"
                    : "download-cloud"
              }
              size={mscale(20)}
              color={colors.primary}
            />
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: wscale(20),
    paddingTop: hscale(16),
  },

  // ── Header ──
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hscale(16),
  },
  backBtn: { padding: 4 },
  headerTitle: {
    flex: 1,
    fontFamily: "Inter-Bold",
    fontSize: mscale(20),
    color: colors.primary,
    marginLeft: wscale(8),
  },
  searchIconBtn: { padding: 4 },

  // ── Department chip ──
  chipRow: {
    flexDirection: "row",
    marginBottom: hscale(16),
  },
  chip: {
    backgroundColor: "#EDE9FB",
    borderRadius: mscale(20),
    paddingVertical: hscale(5),
    paddingHorizontal: wscale(14),
  },
  chipText: {
    fontFamily: "Inter-Medium",
    fontSize: mscale(12),
    color: colors.primary,
  },

  // ── Course Card ──
  card: {
    backgroundColor: "#fff",
    borderRadius: mscale(14),
    borderWidth: 1,
    borderColor: "#EEEBF5",
    paddingHorizontal: wscale(14),
    paddingTop: hscale(14),
    paddingBottom: hscale(12),
    marginBottom: hscale(14),
    shadowColor: "#6207A0",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardBody: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: hscale(12),
  },

  // PDF icon block
  pdfIconWrap: {
    width: wscale(44),
    height: hscale(50),
    backgroundColor: "#F5F3FF",
    borderRadius: mscale(8),
    alignItems: "center",
    justifyContent: "center",
    marginRight: wscale(12),
  },
  pdfLabel: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(9),
    color: colors.primary,
    marginTop: 2,
  },

  // Course text info
  courseInfo: { flex: 1, justifyContent: "center" },
  courseCode: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(15),
    color: "#1A171C",
    marginBottom: hscale(2),
  },
  courseTitle: {
    fontFamily: "Inter-SemiBold",
    fontSize: mscale(13),
    color: colors.primary,
    marginBottom: hscale(4),
  },
  universityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wscale(4),
  },
  universityText: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(11),
    color: "#AAA",
    flex: 1,
  },

  // Card footer
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: wscale(10),
  },
  viewBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: mscale(8),
    height: hscale(38),
    alignItems: "center",
    justifyContent: "center",
  },
  viewBtnText: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(14),
    color: "#fff",
  },
  downloadIconBtn: {
    width: wscale(42),
    height: hscale(38),
    borderRadius: mscale(8),
    borderWidth: 1.5,
    borderColor: "#E8E4F0",
    alignItems: "center",
    justifyContent: "center",
  },
});
