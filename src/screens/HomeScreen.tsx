import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import IonIcon from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";

import { colors } from "../constants/theme";
import { hscale, mscale, wscale } from "../helpers/metric";
import { useAuthStore } from "../stores/authStore";
import AvatarView from "../components/avatarView";



// ─── Academics Section Tiles ─────────────────────────────────────────────────
const ACADEMIC_TILES = [
  {
    label: "STUDY\nMATERIALS",
    icon: "book-outline" as const,
    route: "/courses/courses",
    dark: false,
  },
  {
    label: "UPLOAD\nMATERIALS",
    icon: "cloud-upload-outline" as const,
    route: "/upload",
    dark: false,
  },
  {
    label: "ASK KEMI\nAI",
    icon: "help-circle-outline" as const,
    route: "/kemiMasteryHub",
    dark: true,
  },
];

// ─── Gigs Section Tiles ───────────────────────────────────────────────────────
const GIGS_TILES = [
  {
    label: "TASK",
    icon: "format-list-bulleted" as const,
    route: "/task",
    highlight: false,
  },
  {
    label: "SERVICES",
    icon: "tag-outline" as const,
    route: "/(services)/services",
    highlight: false,
  },
  {
    label: "EARNING",
    icon: "currency-ngn" as const,
    route: "/earning",
    highlight: true,
  },
];

// ─── Mock active gigs (replace with API data later) ──────────────────────────
const ACTIVE_GIGS = [
  {
    id: "1",
    title: "Brand Ambassador",
    brand: "Red Bull Campus",
    amount: "₦24,500",
    status: "IN PROGRESS",
    icon: "bullhorn-outline" as const,
  },
];

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const userProfile = user?.profile;
  const firstName = userProfile?.fullName?.trim()?.split(" ")?.[0] || "User";

  return (
    <ScrollView
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.push("/settings")}>
            <AvatarView />
          </TouchableOpacity>
          <View style={styles.headerTextWrap}>
            <Text style={styles.greetText}>Hello, {firstName}</Text>
            <Text style={styles.subText}>Here's what happening today.</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/notifications")}
          style={styles.bellBtn}
        >
          <Icon name="bell-outline" color={colors.primary} size={mscale(22)} />
        </TouchableOpacity>
      </View>

      {/* ── ACADEMICS & STUDY TOOLS Section ── */}
      <View style={styles.sectionCard}>
        {/* Left accent border */}
        <View style={[styles.accentBar, { backgroundColor: "#5BB974" }]} />

        <View style={styles.sectionContent}>
          <Text style={styles.sectionTitle}>ACADEMICS & STUDY TOOLS</Text>
          <Text style={styles.sectionSubtitle}>
            📚 Get study materials, upload yours to earn royalties, or chat with Kemi.
          </Text>
        </View>
      </View>

      {/* Academic Tiles Row — outside the banner card */}
      <View style={styles.tilesRow}>
        {ACADEMIC_TILES.map((tile) => (
          <Pressable
            key={tile.label}
            style={[styles.tile, tile.dark && styles.tileDark]}
            onPress={() => router.push(tile.route as any)}
          >
            <IonIcon
              name={tile.icon as any}
              size={mscale(28)}
              color={tile.dark ? "#fff" : colors.primary}
            />
            <Text
              style={[styles.tileLabel, tile.dark && styles.tileLabelDark]}
            >
              {tile.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* ── CAMPUS GIGS & WALLET Section ── */}
      <View style={[styles.sectionCard, styles.gigsSectionCard]}>
        {/* Left accent border */}
        <View style={[styles.accentBar, { backgroundColor: "#5BB974" }]} />

        <LinearGradient
          colors={["#8B2FC9", "#4A1080", "#1A0536"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gigsGradient}
        >
          <Text style={styles.gigsSectionTitle}>CAMPUS GIGS & WALLET</Text>
          <Text style={styles.gigsSectionSubtitle}>
            💸 Pick active brand tasks, offer your skills and cash out instantly.
          </Text>
        </LinearGradient>
      </View>

      {/* Gigs Tile Row — outside the banner card */}
      <View style={styles.tilesRow}>
        {GIGS_TILES.map((tile) => (
          <Pressable
            key={tile.label}
            style={[styles.tile, tile.highlight && styles.tileHighlight]}
            onPress={() => router.push(tile.route as any)}
          >
            <Icon
              name={tile.icon}
              size={mscale(28)}
              color={tile.highlight ? "#5BB974" : colors.primary}
            />
            <Text
              style={[
                styles.tileLabel,
                tile.highlight && styles.tileLabelHighlight,
              ]}
            >
              {tile.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* ── Active Gigs ── */}
      <View style={styles.activeGigsHeader}>
        <Text style={styles.activeGigsTitle}>Active Gigs</Text>
        <TouchableOpacity onPress={() => router.push("/task")}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {ACTIVE_GIGS.map((gig) => (
        <Pressable key={gig.id} style={styles.gigCard}>
          <View style={styles.gigIconWrap}>
            <Icon name={gig.icon} size={mscale(20)} color={colors.primary} />
          </View>
          <View style={styles.gigInfo}>
            <Text style={styles.gigTitle}>{gig.title}</Text>
            <Text style={styles.gigBrand}>{gig.brand}</Text>
          </View>
          <View style={styles.gigAmountWrap}>
            <Text style={styles.gigAmount}>{gig.amount}</Text>
            <Text style={styles.gigStatus}>{gig.status}</Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    paddingHorizontal: wscale(20),
    paddingTop: hscale(16),
    paddingBottom: hscale(40),
  },

  // ── Header ──
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: hscale(24),
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerTextWrap: {
    marginLeft: wscale(10),
  },
  greetText: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(16),
    color: colors.black,
  },
  subText: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(13),
    color: "#888",
    marginTop: 2,
  },
  bellBtn: {
    padding: 6,
  },

  // ── Section Cards ──
  sectionCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: mscale(12),
    borderWidth: 1,
    borderColor: "#E8E4F0",
    marginBottom: hscale(14),
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 2 },
    }),
  },
  accentBar: {
    width: wscale(5),
    borderTopLeftRadius: mscale(12),
    borderBottomLeftRadius: mscale(12),
  },
  sectionContent: {
    flex: 1,
    paddingHorizontal: wscale(14),
    paddingVertical: hscale(14),
  },
  sectionTitle: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(13),
    color: colors.black,
    letterSpacing: 0.3,
  },
  sectionSubtitle: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(12),
    color: "#666",
    marginTop: hscale(4),
    lineHeight: mscale(18),
  },

  // ── Campus Gigs Section (gradient) ──
  gigsSectionCard: {
    marginBottom: hscale(8),
    borderColor: "transparent",
  },
  gigsGradient: {
    flex: 1,
    paddingHorizontal: wscale(14),
    paddingVertical: hscale(16),
    borderTopRightRadius: mscale(12),
    borderBottomRightRadius: mscale(12),
  },
  gigsSectionTitle: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(13),
    color: "#fff",
    letterSpacing: 0.3,
  },
  gigsSectionSubtitle: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(12),
    color: "rgba(255,255,255,0.82)",
    marginTop: hscale(4),
    lineHeight: mscale(18),
  },

  // ── Tile Rows ──
  tilesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: wscale(8),
    marginBottom: hscale(20),
    marginTop: hscale(12),
  },
  tile: {
    flex: 1,
    backgroundColor: "#F5F3FF",
    borderRadius: mscale(12),
    paddingVertical: hscale(18),
    alignItems: "center",
    justifyContent: "center",
    gap: hscale(8),
    borderWidth: 1,
    borderColor: "transparent",
  },
  tileDark: {
    backgroundColor: "#1A0536",
  },
  tileHighlight: {
    backgroundColor: "#fff",
    borderColor: "#5BB974",
    borderWidth: 1.5,
  },
  tileLabel: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(10),
    color: colors.bodyText,
    textAlign: "center",
    letterSpacing: 0.2,
    lineHeight: mscale(14),
  },
  tileLabelDark: {
    color: "#fff",
  },
  tileLabelHighlight: {
    color: "#5BB974",
  },

  // ── Active Gigs ──
  activeGigsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hscale(12),
  },
  activeGigsTitle: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(15),
    color: colors.black,
  },
  viewAllText: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(13),
    color: colors.primary,
  },
  gigCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: mscale(14),
    borderWidth: 1,
    borderColor: "#EEEBF5",
    paddingHorizontal: wscale(14),
    paddingVertical: hscale(14),
    marginBottom: hscale(10),
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
      },
      android: { elevation: 1 },
    }),
  },
  gigIconWrap: {
    width: wscale(38),
    height: hscale(38),
    borderRadius: mscale(10),
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: wscale(12),
  },
  gigInfo: {
    flex: 1,
  },
  gigTitle: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(14),
    color: colors.black,
  },
  gigBrand: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(12),
    color: "#888",
    marginTop: 2,
  },
  gigAmountWrap: {
    alignItems: "flex-end",
  },
  gigAmount: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(14),
    color: colors.black,
  },
  gigStatus: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(10),
    color: "#888",
    marginTop: 2,
    textTransform: "uppercase",
  },
});
