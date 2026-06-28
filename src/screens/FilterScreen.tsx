import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FeatherIcon from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useState } from "react";

import { hscale, mscale, wscale } from "../helpers/metric";
import { colors } from "../constants/theme";
import { useCommunityStore } from "../store/useCommunityStore";

// Mock Data for Trending Only (Posts moved to store)
const TRENDING_TOPICS = [
  { id: 1, tag: "#UNIBENvsUNILAG", desc: "Massive campus banter", posts: "34.2K" },
  { id: 2, tag: "#SolvaPayouts", desc: "Students flexing task cash-outs", posts: "18.9K" },
  { id: 3, tag: "#ExamPrep2026", desc: "200L Economics study packs", posts: "12.1K" },
  { id: 4, tag: "#AsakeInOAU", desc: "Campus entertainment news", posts: "8.5K" },
  { id: 5, tag: "#HustleTips", desc: "Creative ideas to earn money", posts: "5.1K" },
];

export default function FilterScreen() {
  const router = useRouter();
  const posts = useCommunityStore((state) => state.posts);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = posts.filter(
    (post) =>
      post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.campus.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>COMMUNITY</Text>
        <Text style={styles.headerSubtitle}>
          All Campuses Together <Text style={{ fontSize: mscale(16) }}>🇳🇬</Text>
        </Text>
      </View>

      {/* ── SEARCH BAR ── */}
      <View style={styles.searchContainer}>
        <FeatherIcon name="search" size={mscale(18)} color="#999" style={{ marginRight: wscale(8) }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search what's going on..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")} hitSlop={8}>
            <FeatherIcon name="x" size={mscale(18)} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── TRENDING CARD ── */}
        <View style={styles.trendingCard}>
          {/* Top Line */}
          <View style={styles.trendingHeader}>
            <Text style={styles.trendingTitle}>TRENDING ON CAMPUS</Text>
            <MaterialCommunityIcons name="fire" size={mscale(16)} color="#C026D3" />
          </View>
          <Text style={styles.trendingSubtitle}>
            RANKED 1 TO 5 - REAL-TIME STUDENT BUZZ
          </Text>

          {/* Trending Items */}
          <View style={styles.trendingList}>
            {TRENDING_TOPICS.map((item) => (
              <View key={item.id} style={styles.trendingItem}>
                <Text style={styles.trendingRank}>{item.id}.</Text>
                <View style={styles.trendingTextContainer}>
                  <Text style={styles.trendingTag}>{item.tag}</Text>
                  <Text style={styles.trendingDesc}>
                    {`{${item.desc} • ${item.posts} posts}`}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ── POSTS ── */}
        <View style={styles.postsContainer}>
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <TouchableOpacity 
                key={post.id} 
                style={styles.postCard}
                activeOpacity={0.8}
                onPress={() => router.push("/post-details")}
              >
                {/* Post Header */}
                <View style={styles.postHeader}>
                  <Image source={{ uri: post.avatar }} style={styles.avatar} />
                  <View style={styles.postMetaInfo}>
                    <View style={styles.authorRow}>
                      <Text style={styles.authorName}>
                        {post.author} • {post.campus}
                      </Text>
                      {post.badge === "blue-check" ? (
                        <MaterialCommunityIcons
                          name="check-decagram"
                          size={mscale(14)}
                          color="#1DA1F2"
                          style={{ marginLeft: 4 }}
                        />
                      ) : post.badge === "pink-star" ? (
                        <MaterialCommunityIcons
                          name="star-circle"
                          size={mscale(14)}
                          color="#D81B60"
                          style={{ marginLeft: 4 }}
                        />
                      ) : null}
                    </View>
                    <Text style={styles.postDate}>{post.date}</Text>
                  </View>
                  <TouchableOpacity style={styles.moreBtn} hitSlop={8}>
                    <FeatherIcon name="more-horizontal" size={mscale(18)} color="#999" />
                  </TouchableOpacity>
                </View>

                {/* Post Content */}
                <Text style={styles.postContent}>
                  {post.highlight ? post.content.split(post.highlight).map((part, index, arr) => (
                    <Text key={index}>
                      {part}
                      {index < arr.length - 1 && (
                        <Text
                          style={[
                            styles.postHighlight,
                            { color: post.badge === "blue-check" ? "#D81B60" : colors.primary },
                          ]}
                        >
                          {post.highlight}
                        </Text>
                      )}
                    </Text>
                  )) : post.content}
                </Text>

                {/* Attached Image (If any) */}
                {post.image && (
                   <Image source={{ uri: post.image }} style={styles.postAttachedImage} />
                )}

                {/* Views */}
                {post.views && (
                  <View style={styles.viewsContainer}>
                    <Text style={styles.viewsCount}>{post.views}</Text>
                    <Text style={styles.viewsLabel}> Views</Text>
                  </View>
                )}

                {/* Action Buttons */}
                <View style={styles.actionsRow}>
                  <TouchableOpacity style={styles.actionBtn} hitSlop={8}>
                    <FeatherIcon name="message-square" size={mscale(18)} color="#888" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} hitSlop={8}>
                    <FeatherIcon name="repeat" size={mscale(18)} color="#888" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} hitSlop={8}>
                    <FeatherIcon name="heart" size={mscale(18)} color="#888" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} hitSlop={8}>
                    <FeatherIcon name="share" size={mscale(18)} color="#888" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <FeatherIcon name="search" size={mscale(40)} color="#ccc" style={{ marginBottom: hscale(12) }} />
              <Text style={styles.emptyText}>No results found for "{searchQuery}"</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── FLOATING ACTION BUTTON ── */}
      <TouchableOpacity 
        style={styles.fab} 
        activeOpacity={0.8}
        onPress={() => router.push("/create-post")}
      >
        <FeatherIcon name="plus" size={mscale(24)} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  
  // ── Header ──
  header: {
    alignItems: "center",
    paddingTop: hscale(20),
    paddingBottom: hscale(12),
  },
  headerTitle: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(22),
    color: "#301934", // Dark purple
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(14),
    color: "#666",
    marginTop: hscale(4),
  },

  // ── Search Bar ──
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F0F7", // Pale grey-purple
    marginHorizontal: wscale(20),
    marginBottom: hscale(12),
    borderRadius: mscale(22),
    paddingHorizontal: wscale(16),
    height: hscale(44),
    borderWidth: 1,
    borderColor: "#EBE6F2",
  },
  searchInput: {
    flex: 1,
    fontFamily: "Inter-Regular",
    fontSize: mscale(14),
    color: "#333",
    paddingVertical: 0,
    ...Platform.select({
      web: { outlineStyle: "none" } as any,
    }),
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wscale(20),
    paddingBottom: hscale(100), // Space for FAB and bottom tabs
  },

  // ── Trending Card ──
  trendingCard: {
    backgroundColor: "#fff",
    borderRadius: mscale(12),
    borderWidth: 1.5,
    borderColor: "#C026D3", // Magenta/pink border
    padding: mscale(20),
    marginTop: hscale(10),
    marginBottom: hscale(24),
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  trendingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hscale(4),
    gap: wscale(6),
  },
  trendingTitle: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(12),
    color: "#301934", // Deep purple
    letterSpacing: 0.5,
  },
  trendingSubtitle: {
    fontFamily: "Inter-SemiBold",
    fontSize: mscale(10),
    color: "#999",
    marginBottom: hscale(16),
  },
  trendingList: {
    gap: hscale(16),
  },
  trendingItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  trendingRank: {
    fontFamily: "Inter-Medium",
    fontSize: mscale(14),
    color: "#CBA4DC", // Light purple
    width: wscale(20),
    marginTop: hscale(2),
  },
  trendingTextContainer: {
    flex: 1,
  },
  trendingTag: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(14),
    color: "#4A148C", // Dark purple
    marginBottom: hscale(4),
  },
  trendingDesc: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(12),
    color: "#888",
  },

  // ── Posts ──
  postsContainer: {
    gap: hscale(16),
  },
  postCard: {
    backgroundColor: "#fff",
    borderRadius: mscale(16),
    padding: mscale(16),
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hscale(12),
  },
  avatar: {
    width: wscale(40),
    height: wscale(40),
    borderRadius: wscale(20),
    borderWidth: 1,
    borderColor: "#5E17EB",
  },
  postMetaInfo: {
    flex: 1,
    marginLeft: wscale(12),
    justifyContent: "center",
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hscale(2),
  },
  authorName: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(14),
    color: "#301934", // Dark purple
  },
  postDate: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(11),
    color: "#999",
  },
  moreBtn: {
    padding: 4,
  },
  postContent: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(14),
    color: "#333",
    lineHeight: mscale(22),
    marginBottom: hscale(16),
  },
  postAttachedImage: {
    width: "100%",
    height: hscale(200),
    borderRadius: mscale(12),
    marginBottom: hscale(16),
    backgroundColor: "#F0EEF5",
  },
  postHighlight: {
    fontFamily: "Inter-Medium",
  },
  viewsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hscale(16),
  },
  viewsCount: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(12),
    color: "#5E17EB", // Purple
  },
  viewsLabel: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(12),
    color: "#999",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wscale(8),
    borderTopWidth: 1,
    borderTopColor: "#FAFAFA",
    paddingTop: hscale(12),
  },
  actionBtn: {
    padding: mscale(6),
  },

  // Empty Results
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hscale(40),
  },
  emptyText: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(14),
    color: "#999",
    textAlign: "center",
  },

  // ── FAB ──
  fab: {
    position: "absolute",
    right: wscale(20),
    bottom: hscale(20),
    width: wscale(56),
    height: wscale(56),
    borderRadius: wscale(28),
    backgroundColor: "#5E17EB", // Solva purple
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#5E17EB",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
