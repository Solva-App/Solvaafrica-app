import React from "react";
import { useQuery } from "@tanstack/react-query";
import ProtectPage from "../components/protectPage";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Linking,
  Platform,
} from "react-native";
import { router } from "expo-router";
import BackIcon from "@expo/vector-icons/Ionicons";
import ClockIcon from "@expo/vector-icons/Feather";
import CheckBadgeIcon from "@expo/vector-icons/Octicons";
import MovieIcon from "@expo/vector-icons/MaterialIcons";
import CursorIcon from "@expo/vector-icons/MaterialCommunityIcons";
import CodeIcon from "@expo/vector-icons/FontAwesome5";
import BrushIcon from "@expo/vector-icons/Ionicons";

import { colors } from "../constants/theme";
import { hscale, mscale, wscale } from "../helpers/metric";
import { fetchAcademyCourses } from "../api/queries";
import LottieView from "lottie-react-native";

const renderIcon = (type: string) => {
  switch (type) {
    case "movie":
      return (
        <View style={[styles.iconWrap, { backgroundColor: "#EDE5F6" }]}>
          <MovieIcon name="movie-creation" size={mscale(20)} color="#6207A0" />
        </View>
      );
    case "cursor":
      return (
        <View style={[styles.iconWrap, { backgroundColor: "#EDE5F6" }]}>
          <CursorIcon name="cursor-default-click" size={mscale(20)} color="#6207A0" />
        </View>
      );
    case "code":
      return (
        <View style={[styles.iconWrap, { backgroundColor: "#EDE5F6" }]}>
          <CodeIcon name="code" size={mscale(16)} color="#6207A0" />
        </View>
      );
    case "brush":
      return (
        <View style={[styles.iconWrap, { backgroundColor: "#EDE5F6" }]}>
          <BrushIcon name="brush" size={mscale(20)} color="#6207A0" />
        </View>
      );
    default:
      return (
        <View style={[styles.iconWrap, { backgroundColor: "#EDE5F6" }]}>
          <MovieIcon name="book" size={mscale(20)} color="#6207A0" />
        </View>
      );
  }
};

export default function CourseAcademyScreen() {
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["academyCourses"],
    queryFn: fetchAcademyCourses,
  });

  const handleStartLearning = (url: string) => {
    if (!url) return;
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open URL:", err)
    );
  };

  return (
    <ProtectPage>
      <View style={styles.screen}>
        {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <BackIcon name="arrow-back" size={mscale(24)} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Course Academy</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: hscale(50) }}>
            <LottieView
              autoPlay
              loop
              style={{ width: wscale(80), height: hscale(80) }}
              source={require("../../assets/animations/spin.json")}
            />
          </View>
        ) : courses.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: hscale(50), color: "#666" }}>
            No courses available yet.
          </Text>
        ) : (
          courses.map((course: any, idx: number) => {
            const courseId = course.id ?? course._id ?? idx;
            const title = course.title ?? course.name ?? course.courseTitle ?? "Course";
            const link = course.link ?? course.url ?? course.courseUrl ?? course.courseLink ?? "";
            const duration = course.duration ?? course.time ?? course.length ?? "N/A";
            const level = course.level ?? course.difficulty ?? course.courseLevel;
            const price = course.price ?? course.cost ?? course.amount;
            const oldPrice = course.oldPrice ?? course.previousPrice ?? course.discountPrice;
            const tag = course.tag ?? course.category ?? course.courseCategory ?? "COURSE";
            const iconType = course.iconType ?? course.icon ?? "movie";

            return (
              <View key={courseId} style={styles.card}>
                {/* Top row: Icon + Info */}
                <View style={styles.cardTop}>
                  {renderIcon(iconType)}
                  <View style={styles.cardTopText}>
                    <Text style={[styles.tagText, { color: course.tagColor || "#777" }]}>
                      {tag}
                    </Text>
                    <Text style={styles.courseTitle}>{title}</Text>
                  </View>
                </View>

                {/* Meta row: Duration & Level */}
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <ClockIcon name="clock" size={mscale(12)} color="#666" />
                    <Text style={styles.metaText}>{duration}</Text>
                  </View>
                  {level && (
                    <>
                      <Text style={styles.metaDot}>•</Text>
                      <View style={styles.metaItem}>
                        <CheckBadgeIcon name="verified" size={mscale(12)} color="#666" />
                        <Text style={styles.metaText}>{level}</Text>
                      </View>
                    </>
                  )}
                </View>

                {/* Pricing row */}
                {price && (
                  <View style={styles.pricingRow}>
                    <Text style={styles.priceText}>{price}</Text>
                    {oldPrice && (
                      <Text style={styles.oldPriceText}>{oldPrice}</Text>
                    )}
                  </View>
                )}

                {/* Button */}
                <TouchableOpacity
                  style={styles.startBtn}
                  activeOpacity={0.7}
                  onPress={() => handleStartLearning(link)}
                >
                  <Text style={styles.startBtnText}>Start Learning</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
    </ProtectPage>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FAF9FB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wscale(20),
    paddingTop: Platform.OS === "ios" ? hscale(60) : hscale(40),
    paddingBottom: hscale(16),
    backgroundColor: "#FAF9FB",
  },
  backBtn: {
    marginRight: wscale(12),
  },
  headerTitle: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(18),
    color: colors.primary,
  },
  scrollContent: {
    paddingHorizontal: wscale(16),
    paddingBottom: hscale(40),
    paddingTop: hscale(8),
  },

  // Card Styles
  card: {
    backgroundColor: "#fff",
    borderRadius: mscale(12),
    padding: mscale(16),
    marginBottom: hscale(16),
    borderWidth: 1,
    borderColor: "#F0EDF6",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: hscale(12),
  },
  iconWrap: {
    width: wscale(44),
    height: wscale(44),
    borderRadius: mscale(10),
    alignItems: "center",
    justifyContent: "center",
    marginRight: wscale(14),
  },
  cardTopText: {
    flex: 1,
  },
  tagText: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(10),
    letterSpacing: 0.5,
    marginBottom: hscale(4),
  },
  courseTitle: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(15),
    color: "#111",
    lineHeight: mscale(21),
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hscale(14),
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: wscale(5),
  },
  metaText: {
    fontFamily: "Inter-Medium",
    fontSize: mscale(12),
    color: "#555",
  },
  metaDot: {
    color: "#CCC",
    fontSize: mscale(14),
    marginHorizontal: wscale(8),
    fontFamily: "Inter-Medium",
  },
  pricingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hscale(16),
    marginTop: hscale(-6),
  },
  priceText: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(16),
    color: colors.primary,
    marginRight: wscale(8),
  },
  oldPriceText: {
    fontFamily: "Inter-Medium",
    fontSize: mscale(13),
    color: "#999",
    textDecorationLine: "line-through",
  },
  startBtn: {
    backgroundColor: colors.primary,
    borderRadius: mscale(25),
    height: hscale(46),
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  startBtnText: {
    fontFamily: "Inter-SemiBold",
    fontSize: mscale(14),
    color: "#fff",
  },
});
