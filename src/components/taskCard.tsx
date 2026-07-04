import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type TaskCardProps = {
  brandName: string;
  campaignType: string;
  title: string;
  subtitle?: string;
  timeLeft: string;
  spotsLeft: string;
  totalPool: number;
  logo?: any;
  banner?: any;
  onPress: () => void;
};

const PRIMARY = "#6207A0";

const formatNaira = (amount: number) => {
  return `₦ ${amount.toLocaleString("en-NG")}`;
};

export default function TaskCard({
  brandName,
  campaignType,
  title,
  timeLeft,
  spotsLeft,
  totalPool,
  logo,
  banner,
  onPress,
}: TaskCardProps) {
  const isUrgent = /hour|expired/i.test(timeLeft);

  return (
    <View style={styles.card}>

      {/* ── Top row: Logo + Brand + Tag │ Total pool ── */}
      <View style={styles.topRow}>
        {/* Left: logo box + brand name + tag stacked */}
        <View style={styles.topLeft}>
          <View style={styles.logoBox}>
            {logo ? (
              <Image source={logo} style={styles.logo} resizeMode="contain" />
            ) : (
              <View style={styles.logoPlaceholder} />
            )}
          </View>

          <View style={styles.brandTagCol}>
            <Text style={styles.brandName} numberOfLines={1}>
              {brandName}
            </Text>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{campaignType}</Text>
            </View>
          </View>
        </View>

        {/* Right: Total pool label + amount */}
        <View style={styles.topRight}>
          <Text style={styles.poolLabel}>Total pool</Text>
          <Text style={styles.poolValue}>{formatNaira(totalPool)}</Text>
        </View>
      </View>

      {/* ── Middle row: Title + Banner image ── */}
      <View style={styles.midRow}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <View style={styles.bannerWrap}>
          {banner ? (
            <Image source={banner} style={styles.banner} resizeMode="cover" />
          ) : (
            <View style={styles.bannerPlaceholder} />
          )}
        </View>
      </View>

      {/* ── Meta row: clock + time │ people + spots ── */}
      <View style={styles.metaRow}>
        <Ionicons
          name="time-outline"
          size={16}
          color={isUrgent ? "#E8354A" : "#E8354A"}
          style={styles.metaIcon}
        />
        <Text style={[styles.metaText, isUrgent && styles.urgentText]}>
          {timeLeft}
        </Text>

        <Ionicons
          name="people-outline"
          size={16}
          color="#555"
          style={[styles.metaIcon, { marginLeft: 20 }]}
        />
        <Text style={styles.metaText}>{spotsLeft}</Text>
      </View>

      {/* ── Full-width View Task button ── */}
      <Pressable style={styles.button} onPress={onPress} android_ripple={{ color: "#4a0080" }}>
        <Text style={styles.buttonText}>View Task</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    marginBottom: 20,
    shadowColor: "#9B59B6",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  // ── Top row ──
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  topLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  logoBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "#F3EEF9",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logo: {
    width: 46,
    height: 46,
    borderRadius: 10,
  },
  logoPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#D8D8D8",
  },
  brandTagCol: {
    flex: 1,
    gap: 6,
  },
  brandName: {
    fontSize: 15,
    fontFamily: "Inter-SemiBold",
    color: "#1A1A2E",
  },
  tag: {
    alignSelf: "flex-start",
    backgroundColor: "#F0EDF6",
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 12,
  },
  tagText: {
    fontSize: 11,
    fontFamily: "Inter-Medium",
    color: "#6207A0",
  },
  topRight: {
    alignItems: "flex-end",
    marginLeft: 8,
  },
  poolLabel: {
    fontSize: 11,
    fontFamily: "Inter-Regular",
    color: "#888",
    marginBottom: 2,
  },
  poolValue: {
    fontSize: 20,
    fontFamily: "Inter-Bold",
    color: PRIMARY,
  },

  // ── Mid row ──
  midRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontFamily: "Inter-Bold",
    color: "#1A1A2E",
    lineHeight: 25,
  },
  bannerWrap: {
    width: 82,
    height: 82,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#E8E0F0",
  },
  banner: {
    width: "100%",
    height: "100%",
  },
  bannerPlaceholder: {
    flex: 1,
    backgroundColor: "#DDD5EC",
  },

  // ── Meta row ──
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  metaIcon: {
    marginRight: 4,
  },
  metaText: {
    fontSize: 13,
    fontFamily: "Inter-SemiBold",
    color: "#555",
  },
  urgentText: {
    color: "#E8354A",
  },

  // ── Button ──
  button: {
    backgroundColor: PRIMARY,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 15,
    fontFamily: "Inter-SemiBold",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
});
