import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import FeatherIcon from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { hscale, mscale, wscale } from "../../helpers/metric";

export default function CertificateOnCourses() {
  const router = useRouter();

  const COURSES = [
    {
      id: "1",
      title: "Smartphone Video Editing for Content Creators",
      badge: "FREE",
      badgeColor: "#008A20", // Green
      iconName: "movie-open-edit",
      iconBg: "#EFE8F4", // Light purple
      iconColor: "#301934",
      duration: "2 Hours",
      level: "Introductory",
      price: "FREE",
      originalPrice: null,
    },
    {
      id: "2",
      title: "Introduction to Digital Marketing",
      badge: "FULL CERTIFICATE",
      badgeColor: "#666",
      iconName: "cursor-default-click",
      iconBg: "#E3F8EA", // Light mint
      iconColor: "#008A20",
      duration: "3 Hours",
      level: null,
      price: "#4,000",
      originalPrice: "#15,000",
    },
    {
      id: "3",
      title: "Coding for Beginners: HTML & CSS",
      badge: "PROJECT INCLUDED",
      badgeColor: "#666",
      iconName: "code-tags",
      iconBg: "#F8E3FA", // Light pink
      iconColor: "#301934",
      duration: "4 Hours",
      level: null,
      price: "#5,000",
      originalPrice: "#20,000",
    },
    {
      id: "4",
      title: "Graphic Design Fundamentals with Canva",
      badge: "FULL ACCESS",
      badgeColor: "#666",
      iconName: "brush-variant",
      iconBg: "#EBE5F0", // Light grey/purple
      iconColor: "#888",
      duration: "2 Hours",
      level: null,
      price: "#3,000",
      originalPrice: "#10,000",
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <FeatherIcon name="arrow-left" size={mscale(24)} color="#301934" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Course Academy</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {COURSES.map((course) => (
          <View key={course.id} style={styles.card}>
            {/* Top row: Icon and text block */}
            <View style={styles.cardTopRow}>
              <View style={[styles.iconBox, { backgroundColor: course.iconBg }]}>
                <MaterialCommunityIcons 
                  name={course.iconName as any} 
                  size={mscale(24)} 
                  color={course.iconColor} 
                />
              </View>
              
              <View style={styles.cardTextContent}>
                <Text style={[styles.badgeText, { color: course.badgeColor }]}>
                  {course.badge}
                </Text>
                <Text style={styles.courseTitle}>{course.title}</Text>
              </View>
            </View>

            {/* Metadata row: Duration & Level */}
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <FeatherIcon name="clock" size={mscale(12)} color="#666" />
                <Text style={styles.metaText}>{course.duration}</Text>
              </View>
              {course.level && (
                <>
                  <View style={styles.metaDot} />
                  <View style={styles.metaItem}>
                    <MaterialCommunityIcons name="check-decagram-outline" size={mscale(14)} color="#666" />
                    <Text style={styles.metaText}>{course.level}</Text>
                  </View>
                </>
              )}
            </View>

            {/* Price Row (If not free) */}
            {course.price !== "FREE" && (
              <View style={styles.priceRow}>
                <Text style={styles.currentPrice}>{course.price}</Text>
                {course.originalPrice && (
                  <Text style={styles.originalPrice}>{course.originalPrice}</Text>
                )}
              </View>
            )}

            {/* Button */}
            <TouchableOpacity 
              style={[styles.startBtn, course.price === "FREE" && { marginTop: hscale(12) }]}
              activeOpacity={0.85}
            >
              <Text style={styles.startBtnText}>Start Learning</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFDFD",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wscale(20),
    paddingTop: hscale(10),
    paddingBottom: hscale(16),
  },
  headerTitle: {
    fontFamily: "Inter-SemiBold",
    fontSize: mscale(18),
    color: "#301934",
    marginLeft: wscale(16),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wscale(20),
    paddingBottom: hscale(40),
    paddingTop: hscale(10),
    gap: hscale(16),
  },
  
  // Card
  card: {
    backgroundColor: "#fff",
    borderRadius: mscale(12),
    borderWidth: 1,
    borderColor: "#F0EEF5",
    padding: mscale(16),
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: hscale(12),
  },
  iconBox: {
    width: wscale(48),
    height: wscale(48),
    borderRadius: mscale(8),
    alignItems: "center",
    justifyContent: "center",
    marginRight: wscale(16),
  },
  cardTextContent: {
    flex: 1,
  },
  badgeText: {
    fontFamily: "Inter-SemiBold",
    fontSize: mscale(11),
    marginBottom: hscale(4),
    letterSpacing: 0.5,
  },
  courseTitle: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(15),
    color: "#222",
    lineHeight: mscale(20),
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hscale(12),
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: wscale(4),
  },
  metaText: {
    fontFamily: "Inter-Medium",
    fontSize: mscale(12),
    color: "#666",
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#ccc",
    marginHorizontal: wscale(8),
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: hscale(16),
    gap: wscale(8),
  },
  currentPrice: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(16),
    color: "#301934",
  },
  originalPrice: {
    fontFamily: "Inter-Medium",
    fontSize: mscale(13),
    color: "#999",
    textDecorationLine: "line-through",
  },
  startBtn: {
    backgroundColor: "#301934", // Deep purple
    paddingVertical: hscale(14),
    borderRadius: mscale(24), // Pill shaped like in the design
    alignItems: "center",
    justifyContent: "center",
  },
  startBtnText: {
    fontFamily: "Inter-Medium",
    fontSize: mscale(14),
    color: "#fff",
  },
});
