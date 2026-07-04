import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FeatherIcon from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { hscale, mscale, wscale } from "../helpers/metric";
import { colors } from "../constants/theme";
import { fetchCommunityPosts, likePost, deletePost, fetchTrendingTopics } from "../api/queries";
import { useAuthStore } from "../stores/authStore";
import AvatarView from "../components/avatarView";

const FALLBACK_TRENDING = [
  { id: 1, tag: "#SolvaPayouts", desc: "Students flexing task cash-outs", posts: "Trending" },
  { id: 2, tag: "#ExamPrep2026", desc: "Study materials and tips", posts: "Trending" },
  { id: 3, tag: "#HustleTips", desc: "Creative ideas to earn money", posts: "Trending" },
];

/** Normalise a raw post from the API into a consistent shape */
const normalisePost = (raw: any) => ({
  id: String(raw._id ?? raw.id ?? ""),
  author: raw.author?.fullName ?? raw.author?.name ?? raw.authorName ?? "Anonymous",
  campus: raw.campus ?? raw.author?.campus ?? "",
  avatar: raw.author?.profilePic ?? raw.authorAvatar ?? "https://i.pravatar.cc/150?img=1",
  badge: raw.badge ?? "none",
  date: raw.createdAt
    ? new Date(raw.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })
    : "Just now",
  content: raw.content ?? raw.text ?? raw.message ?? "",
  image: raw.image ?? raw.imageUrl ?? undefined,
  views: raw.views ? `${raw.views}` : null,
  likes: Array.isArray(raw.likes) ? raw.likes.length : (raw.likesCount ?? 0),
  isLikedByMe: Array.isArray(raw.likes)
    ? raw.likes.includes(raw._currentUserId)
    : (raw.isLiked ?? false),
  commentsCount: raw.commentsCount ?? (Array.isArray(raw.comments) ? raw.comments.length : 0),
  authorId: String(raw.author?._id ?? raw.author?.id ?? raw.authorId ?? ""),
});

export default function FilterScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const authUser = useAuthStore((state) => state.user);
  const [searchQuery, setSearchQuery] = useState("");

  // ── Fetch posts ──
  const {
    data: rawPosts = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["community-posts"],
    queryFn: fetchCommunityPosts,
    refetchOnWindowFocus: true,
  });

  const posts = rawPosts.map(normalisePost);

  // ── Fetch trending ──
  const { data: trendingData = [] } = useQuery({
    queryKey: ["community-trending"],
    queryFn: fetchTrendingTopics,
    refetchOnWindowFocus: true,
  });

  const trendingTopics = trendingData.length > 0 
    ? trendingData.map((t: any, i: number) => ({
        id: i + 1,
        tag: t.hashtag || t.tag || `#${t.name}`,
        desc: t.description || "Trending on campus",
        posts: t.count ? `${t.count}` : "Trending",
      }))
    : FALLBACK_TRENDING;

  // ── Like mutation ──
  const likeMutation = useMutation({
    mutationFn: (postId: string) => likePost(postId),
    onMutate: async (postId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ["community-posts"] });
      const previous = queryClient.getQueryData(["community-posts"]);
      queryClient.setQueryData(["community-posts"], (old: any[]) =>
        (old ?? []).map((p: any) => {
          const id = String(p._id ?? p.id ?? "");
          if (id !== postId) return p;
          const liked = p.isLiked ?? false;
          const likes = Array.isArray(p.likes) ? p.likes.length : (p.likesCount ?? 0);
          return { ...p, isLiked: !liked, likesCount: liked ? likes - 1 : likes + 1 };
        })
      );
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      queryClient.setQueryData(["community-posts"], ctx?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
    },
  });

  // ── Delete mutation ──
  const deleteMutation = useMutation({
    mutationFn: (postId: string) => deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
    },
  });

  const handleMoreOptions = useCallback(
    (post: ReturnType<typeof normalisePost>) => {
      const myId = String(authUser?.profile?.userID ?? authUser?.profile?._id ?? "");
      const isOwn = myId && post.authorId === myId;
      const options: any[] = [{ text: "Cancel", style: "cancel" }];
      if (isOwn) {
        options.unshift({
          text: "Delete Post",
          style: "destructive",
          onPress: () => deleteMutation.mutate(post.id),
        });
      }
      if (Platform.OS === "web") {
        window.alert("Post options coming soon!");
      } else {
        Alert.alert("Post Options", "", options);
      }
    },
    [authUser, deleteMutation]
  );

  const filteredPosts = posts.filter(
    (post) =>
      post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.campus.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── RENDER ──
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
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* ── TRENDING CARD ── */}
        <View style={styles.trendingCard}>
          <View style={styles.trendingHeader}>
            <Text style={styles.trendingTitle}>TRENDING ON CAMPUS</Text>
            <MaterialCommunityIcons name="fire" size={mscale(16)} color="#C026D3" />
          </View>
          <Text style={styles.trendingSubtitle}>RANKED 1 TO 5 - REAL-TIME STUDENT BUZZ</Text>
          <View style={styles.trendingList}>
            {trendingTopics.slice(0, 5).map((item: any) => (
              <View key={item.id} style={styles.trendingItem}>
                <Text style={styles.trendingRank}>{item.id}.</Text>
                <View style={styles.trendingTextContainer}>
                  <Text style={styles.trendingTag}>{item.tag}</Text>
                  <Text style={styles.trendingDesc}>{`${item.desc} • ${item.posts} posts`}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ── POSTS ── */}
        <View style={styles.postsContainer}>
          {isLoading ? (
            <View style={styles.centeredState}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.stateText}>Loading posts...</Text>
            </View>
          ) : isError ? (
            <View style={styles.centeredState}>
              <FeatherIcon name="wifi-off" size={mscale(36)} color="#ccc" style={{ marginBottom: hscale(12) }} />
              <Text style={styles.stateText}>Couldn't load posts.</Text>
              <TouchableOpacity onPress={() => refetch()} style={styles.retryBtn}>
                <Text style={styles.retryBtnText}>Tap to retry</Text>
              </TouchableOpacity>
            </View>
          ) : filteredPosts.length === 0 ? (
            <View style={styles.centeredState}>
              <FeatherIcon
                name={searchQuery ? "search" : "users"}
                size={mscale(40)}
                color="#ccc"
                style={{ marginBottom: hscale(12) }}
              />
              <Text style={styles.stateText}>
                {searchQuery
                  ? `No results for "${searchQuery}"`
                  : "Be the first to post something! 🎉"}
              </Text>
            </View>
          ) : (
            filteredPosts.map((post) => (
              <TouchableOpacity
                key={post.id}
                style={styles.postCard}
                activeOpacity={0.8}
                onPress={() =>
                  router.push({ pathname: "/post-details", params: { postId: post.id } })
                }
              >
                {/* Post Header */}
                <View style={styles.postHeader}>
                  {post.avatar === "https://i.pravatar.cc/150?img=1" ? (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarPlaceholderText}>
                        {post.author.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  ) : (
                    <Image source={{ uri: post.avatar }} style={styles.avatar} />
                  )}
                  <View style={styles.postMetaInfo}>
                    <View style={styles.authorRow}>
                      <Text style={styles.authorName}>
                        {post.author}
                        {post.campus ? ` • ${post.campus}` : ""}
                      </Text>
                      {post.badge === "blue-check" ? (
                        <MaterialCommunityIcons name="check-decagram" size={mscale(14)} color="#1DA1F2" style={{ marginLeft: 4 }} />
                      ) : post.badge === "pink-star" ? (
                        <MaterialCommunityIcons name="star-circle" size={mscale(14)} color="#D81B60" style={{ marginLeft: 4 }} />
                      ) : null}
                    </View>
                    <Text style={styles.postDate}>{post.date}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.moreBtn}
                    hitSlop={8}
                    onPress={() => handleMoreOptions(post)}
                  >
                    <FeatherIcon name="more-horizontal" size={mscale(18)} color="#999" />
                  </TouchableOpacity>
                </View>

                {/* Post Content */}
                {post.content ? (
                  <Text style={styles.postContent}>{post.content}</Text>
                ) : null}

                {/* Attached Image */}
                {post.image ? (
                  <Image source={{ uri: post.image }} style={styles.postAttachedImage} />
                ) : null}

                {/* Views */}
                {post.views ? (
                  <View style={styles.viewsContainer}>
                    <Text style={styles.viewsCount}>{post.views}</Text>
                    <Text style={styles.viewsLabel}> Views</Text>
                  </View>
                ) : null}

                {/* Action Buttons */}
                <View style={styles.actionsRow}>
                  {/* Comment */}
                  <TouchableOpacity
                    style={styles.actionBtn}
                    hitSlop={8}
                    onPress={() =>
                      router.push({ pathname: "/post-details", params: { postId: post.id } })
                    }
                  >
                    <FeatherIcon name="message-square" size={mscale(18)} color="#888" />
                    {post.commentsCount > 0 && (
                      <Text style={styles.actionCount}>{post.commentsCount}</Text>
                    )}
                  </TouchableOpacity>

                  {/* Like */}
                  <TouchableOpacity
                    style={styles.actionBtn}
                    hitSlop={8}
                    onPress={() => post.id && likeMutation.mutate(post.id)}
                  >
                    <FeatherIcon
                      name="heart"
                      size={mscale(18)}
                      color={post.isLikedByMe ? "#F91880" : "#888"}
                    />
                    {post.likes > 0 && (
                      <Text style={[styles.actionCount, post.isLikedByMe && { color: "#F91880" }]}>
                        {post.likes}
                      </Text>
                    )}
                  </TouchableOpacity>

                  {/* Share */}
                  <TouchableOpacity style={styles.actionBtn} hitSlop={8}>
                    <FeatherIcon name="share" size={mscale(18)} color="#888" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
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
    color: "#301934",
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
    backgroundColor: "#F3F0F7",
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

  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: wscale(20),
    paddingBottom: hscale(100),
  },

  // ── Trending ──
  trendingCard: {
    backgroundColor: "#fff",
    borderRadius: mscale(12),
    borderWidth: 1.5,
    borderColor: "#C026D3",
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
    color: "#301934",
    letterSpacing: 0.5,
  },
  trendingSubtitle: {
    fontFamily: "Inter-SemiBold",
    fontSize: mscale(10),
    color: "#999",
    marginBottom: hscale(16),
  },
  trendingList: { gap: hscale(16) },
  trendingItem: { flexDirection: "row", alignItems: "flex-start" },
  trendingRank: {
    fontFamily: "Inter-Medium",
    fontSize: mscale(14),
    color: "#CBA4DC",
    width: wscale(20),
    marginTop: hscale(2),
  },
  trendingTextContainer: { flex: 1 },
  trendingTag: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(14),
    color: "#4A148C",
    marginBottom: hscale(4),
  },
  trendingDesc: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(12),
    color: "#888",
  },

  // ── Posts ──
  postsContainer: { gap: hscale(16) },
  centeredState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hscale(48),
  },
  stateText: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(14),
    color: "#999",
    textAlign: "center",
    marginTop: hscale(8),
  },
  retryBtn: {
    marginTop: hscale(16),
    backgroundColor: colors.primary,
    paddingHorizontal: wscale(24),
    paddingVertical: hscale(10),
    borderRadius: mscale(20),
  },
  retryBtnText: {
    fontFamily: "Inter-SemiBold",
    fontSize: mscale(14),
    color: "#fff",
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
  avatarPlaceholder: {
    width: wscale(40),
    height: wscale(40),
    borderRadius: wscale(20),
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPlaceholderText: {
    color: "#fff",
    fontFamily: "Inter-Bold",
    fontSize: mscale(16),
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
    color: "#301934",
  },
  postDate: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(11),
    color: "#999",
  },
  moreBtn: { padding: 4 },
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
  viewsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hscale(16),
  },
  viewsCount: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(12),
    color: "#5E17EB",
  },
  viewsLabel: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(12),
    color: "#999",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#FAFAFA",
    paddingTop: hscale(12),
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: wscale(4),
    padding: mscale(6),
  },
  actionCount: {
    fontFamily: "Inter-Medium",
    fontSize: mscale(13),
    color: "#888",
  },

  // ── FAB ──
  fab: {
    position: "absolute",
    right: wscale(20),
    bottom: hscale(20),
    width: wscale(56),
    height: wscale(56),
    borderRadius: wscale(28),
    backgroundColor: "#5E17EB",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#5E17EB",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
