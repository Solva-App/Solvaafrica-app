import React from "react";
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

// --- DUMMY DATA ---
const ACADEMY_COURSES = [
  {
    id: "1",
    title: "Smartphone Video Editing for Content Creators",
    tag: "FREE",
    tagColor: "#1EA464", // Green
    duration: "2 Hours",
    level: "Introductory",
    price: null,
    oldPrice: null,
    iconType: "movie",
    link: "https://solvaafrica.com/courses/video-editing",
  },
  {
    id: "2",
    title: "Introduction to Digital Marketing",
    tag: "FULL CERTIFICATE",
    tagColor: "#777777",
    duration: "3 Hours",
    level: null,
    price: "#4,000",
    oldPrice: "#15,000",
    iconType: "cursor",
    link: "https://solvaafrica.com/courses/digital-marketing",
  },
  {
    id: "3",
    title: "Coding for Beginners: HTML & CSS",
    tag: "PROJECT INCLUDED",
    tagColor: "#777777",
    duration: "4 Hours",
    level: null,
    price: "#5,000",
    oldPrice: "#20,000",
    iconType: "code",
    link: "https://solvaafrica.com/courses/coding",
  },
  {
    id: "4",
    title: "Graphic Design Fundamentals with Canva",
    tag: "FULL ACCESS",
    tagColor: "#777777",
    duration: "2 Hours",
    level: null,
    price: "#3,000",
    oldPrice: "#10,000",
    iconType: "brush",
    link: "https://solvaafrica.com/courses/design",
  },
];

const renderIcon = (type: string) => {
  switch (type) {
    case "movie":
      return (
        <View style={[styles.iconWrap, { backgroundColor: "#EDE5F6" }]}>
          <MovieIcon name="movie-creation" size={mscale(20)} color="#27053B" />
        </View>
      );
    case "cursor":
      return (
        <View style={[styles.iconWrap, { backgroundColor: "#E5F8ED" }]}>
          <CursorIcon name="cursor-default-click" size={mscale(20)} color="#125F37" />
        </View>
      );
    case "code":
      return (
        <View style={[styles.iconWrap, { backgroundColor: "#FAEBFA" }]}>
          <CodeIcon name="code" size={mscale(16)} color="#4A054A" />
        </View>
      );
    case "brush":
      return (
        <View style={[styles.iconWrap, { backgroundColor: "#EBE9F2" }]}>
          <BrushIcon name="brush" size={mscale(20)} color="#7C738F" />
        </View>
      );
    default:
      return (
        <View style={[styles.iconWrap, { backgroundColor: "#EEE" }]}>
          <MovieIcon name="book" size={mscale(20)} color="#555" />
        </View>
      );
  }
};

export default function CourseAcademyScreen() {
  const handleStartLearning = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open URL:", err)
    );
  };

  return (
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
        {ACADEMY_COURSES.map((course) => (
          <View key={course.id} style={styles.card}>
            {/* Top row: Icon + Info */}
            <View style={styles.cardTop}>
              {renderIcon(course.iconType)}
              <View style={styles.cardTopText}>
                <Text style={[styles.tagText, { color: course.tagColor }]}>
                  {course.tag}
                </Text>
                <Text style={styles.courseTitle}>{course.title}</Text>
              </View>
            </View>

            {/* Meta row: Duration & Level */}
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <ClockIcon name="clock" size={mscale(12)} color="#666" />
                <Text style={styles.metaText}>{course.duration}</Text>
              </View>
              {course.level && (
                <>
                  <Text style={styles.metaDot}>•</Text>
                  <View style={styles.metaItem}>
                    <CheckBadgeIcon name="verified" size={mscale(12)} color="#666" />
                    <Text style={styles.metaText}>{course.level}</Text>
                  </View>
                </>
              )}
            </View>

            {/* Pricing row */}
            {course.price && (
              <View style={styles.pricingRow}>
                <Text style={styles.priceText}>{course.price}</Text>
                {course.oldPrice && (
                  <Text style={styles.oldPriceText}>{course.oldPrice}</Text>
                )}
              </View>
            )}

            {/* Button */}
            <Pressable
              style={styles.startBtn}
              onPress={() => handleStartLearning(course.link)}
            >
              <Text style={styles.startBtnText}>Start Learning</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
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
