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
  Share,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FeatherIcon from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { hscale, mscale, wscale } from "../helpers/metric";
import { colors } from "../constants/theme";
import { fetchCommunityPosts, likePost, unlikePost, deletePost, fetchTrendingTopics, viewPost, voteOnPoll } from "../api/queries";
import { useAuthStore } from "../stores/authStore";
import AvatarView from "../components/avatarView";
import ToastManager, { Toast } from "toastify-react-native";


/** Normalise a raw post from the API into a consistent shape */
const normalisePost = (raw: any, authUser?: any) => {
  let parsedPoll = null;
  if (raw.poll) {
    try {
      parsedPoll = typeof raw.poll === "string" ? JSON.parse(raw.poll) : raw.poll;
    } catch (e) {
      parsedPoll = null;
    }
  }

  const rawAuthorId = String(raw.userId ?? raw.author?._id ?? raw.author?.id ?? raw.user?._id ?? raw.user?.id ?? raw.authorId ?? "").trim();
  const myId = String(authUser?.profile?.userID ?? authUser?.profile?.id ?? authUser?.profile?._id ?? authUser?.user?.userID ?? authUser?.user?.id ?? authUser?.user?._id ?? "").trim();
  const isMine = myId !== "" && rawAuthorId !== "" && myId === rawAuthorId;

  const liveAvatar = isMine ? (authUser?.profile?.profilePic ?? authUser?.profile?.avatar) : null;

  return {
    id: String(raw._id ?? raw.id ?? ""),
    author: raw.username ?? raw.author?.fullName ?? raw.author?.name ?? raw.author?.username ?? raw.user?.fullName ?? raw.user?.name ?? raw.authorName ?? "Anonymous",
    campus: raw.campus ?? raw.author?.campus ?? raw.user?.campus ?? "",
    avatar:
      liveAvatar ??
      raw.profilePic ??
      raw.author?.profilePic ??
      raw.author?.avatar ??
      raw.user?.profilePic ??
      raw.user?.avatar ??
      raw.authorAvatar ??
      "https://i.pravatar.cc/150?img=1",
    badge: raw.badge ?? "none",
    date: raw.createdAt
      ? new Date(raw.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })
      : "Just now",
    content: raw.content ?? raw.text ?? raw.message ?? "",
    image: (raw.mediaUrl && raw.mediaUrl.length > 0) ? raw.mediaUrl : 
           (raw.image && raw.image.length > 0) ? raw.image : 
           (raw.imageUrl && raw.imageUrl.length > 0) ? raw.imageUrl : undefined,
    views: typeof raw.views === "number" ? raw.views : (raw.viewsCount ?? 0),
    likes: typeof raw.likes === "number" ? raw.likes : (Array.isArray(raw.likes) ? raw.likes.length : (raw.likesCount ?? 0)),
    isLikedByMe: raw.liked ?? raw.isLiked ?? false,
    commentsCount: raw.commentsCount ?? (Array.isArray(raw.comments) ? raw.comments.length : 0),
    poll: parsedPoll,
    authorId: rawAuthorId,
  };
};

export default function FilterScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const authUser = useAuthStore((state) => state.user);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenuPostId, setActiveMenuPostId] = useState<string | null>(null);

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

  const posts = rawPosts.map((raw: any) => normalisePost(raw, authUser));

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
    : [];

  // ── Like / Unlike mutation ──
  const likeMutation = useMutation({
    mutationFn: ({ postId, isLiked }: { postId: string; isLiked: boolean }) =>
      isLiked ? unlikePost(postId) : likePost(postId),
    onMutate: async ({ postId, isLiked }) => {
      await queryClient.cancelQueries({ queryKey: ["community-posts"] });
      const previous = queryClient.getQueryData(["community-posts"]);
      queryClient.setQueryData(["community-posts"], (old: any[]) =>
        (old ?? []).map((p: any) => {
          const id = String(p._id ?? p.id ?? "");
          if (id !== postId) return p;
          const likes = typeof p.likes === "number" ? p.likes : (p.likesCount ?? 0);
          return {
            ...p,
            liked: !isLiked,
            likes: isLiked ? Math.max(0, likes - 1) : likes + 1,
          };
        })
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(["community-posts"], ctx?.previous);
      Toast.error("Couldn't update like. Try again.");
    },
  });

  // ── Delete mutation ──
  const deleteMutation = useMutation({
    mutationFn: (postId: string) => deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      Toast.success("Post deleted.");
    },
    onError: () => {
      Toast.error("Failed to delete post. You can only delete your own posts.");
    }
  });

  // ── Vote Poll mutation ──
  const votePollMutation = useMutation({
    mutationFn: ({ postId, optionIndex }: { postId: string; optionIndex: number }) => voteOnPoll({ postId, optionIndex }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      Toast.success("Vote recorded!");
    },
    onError: () => {
      Toast.error("Failed to vote.");
    }
  });

  const handleMoreOptions = useCallback(
    (post: ReturnType<typeof normalisePost>) => {
      setActiveMenuPostId((prev) => (prev === post.id ? null : post.id));
    },
    []
  );

  const confirmDeletePost = (postId: string) => {
    setActiveMenuPostId(null);
    if (Platform.OS === "web") {
      const confirmDelete = window.confirm("Are you sure you want to delete this post?");
      if (confirmDelete) {
        deleteMutation.mutate(postId);
      }
      return;
    }
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteMutation.mutate(postId),
      },
    ]);
  };

  const confirmReportPost = () => {
    setActiveMenuPostId(null);
    router.push("/(tabs)/settings?section=support" as any);
  };

  const handleShare = async (post: ReturnType<typeof normalisePost>) => {
    try {
      await Share.share({
        message: `Check out this post on Solva by ${post.author}:\n\n"${post.content}"\n\nJoin the conversation on Solva!`,
      });
    } catch (error: any) {
      Toast.error("Failed to share post.");
    }
  };

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
            {trendingTopics.length === 0 ? (
              <Text style={{ textAlign: "center", color: "#666", marginVertical: hscale(10) }}>
                No trending topics yet. Start posting with hashtags!
              </Text>
            ) : (
              trendingTopics.slice(0, 5).map((item: any) => (
                <View key={item.id} style={styles.trendingItem}>
                  <Text style={styles.trendingRank}>{item.id}.</Text>
                  <View style={styles.trendingTextContainer}>
                    <Text style={styles.trendingTag}>{item.tag}</Text>
                    <Text style={styles.trendingDesc}>{`${item.desc} • ${item.posts} posts`}</Text>
                  </View>
                </View>
              ))
            )}
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
                  <View>
                    <TouchableOpacity
                      style={styles.moreBtn}
                      hitSlop={8}
                      onPress={() => handleMoreOptions(post)}
                    >
                      <FeatherIcon name="more-horizontal" size={mscale(18)} color="#999" />
                    </TouchableOpacity>

                    <Modal
                      visible={activeMenuPostId === post.id}
                      transparent={true}
                      animationType="fade"
                      onRequestClose={() => setActiveMenuPostId(null)}
                    >
                      <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setActiveMenuPostId(null)}
                      >
                        <View style={styles.modalPopout}>
                          <TouchableOpacity style={styles.popoutMenuItem} onPress={() => confirmDeletePost(post.id)}>
                            <FeatherIcon name="trash-2" size={mscale(16)} color="#FF3B30" />
                            <Text style={[styles.popoutMenuText, { color: "#FF3B30" }]}>Delete Post</Text>
                          </TouchableOpacity>
                          <View style={styles.popoutDivider} />
                          <TouchableOpacity style={styles.popoutMenuItem} onPress={confirmReportPost}>
                            <FeatherIcon name="flag" size={mscale(16)} color="#333" />
                            <Text style={styles.popoutMenuText}>Report Post</Text>
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    </Modal>
                  </View>
                </View>

                {/* Post Content */}
                {post.content ? (
                  <Text style={styles.postContent}>{post.content}</Text>
                ) : null}

                {/* Attached Image(s) */}
                {post.image ? (
                  Array.isArray(post.image) ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
                      {post.image.map((uri: string, idx: number) => (
                        <TouchableOpacity
                          key={idx}
                          activeOpacity={0.9}
                          onPress={() =>
                            router.push({
                              pathname: "/image-viewer",
                              params: { imageSource: uri },
                            })
                          }
                          style={{ marginRight: 12 }}
                        >
                          <Image source={{ uri }} style={[styles.postAttachedImage, { width: 280, marginTop: 0 }]} resizeMode="cover" />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  ) : (
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() =>
                        router.push({
                          pathname: "/image-viewer",
                          params: { imageSource: post.image },
                        })
                      }
                    >
                      <Image source={{ uri: post.image }} style={styles.postAttachedImage} resizeMode="contain" />
                    </TouchableOpacity>
                  )
                ) : null}

                {/* Poll */}
                {post.poll && Array.isArray(post.poll) && post.poll.length > 0 ? (
                  <View style={styles.pollContainer}>
                    {post.poll.map((opt: string, idx: number) => (
                      <TouchableOpacity 
                        key={idx} 
                        style={styles.pollOption}
                        onPress={() => post.id && votePollMutation.mutate({ postId: post.id, optionIndex: idx })}
                      >
                        <Text style={styles.pollOptionText}>{opt}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
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

                  {/* Views */}
                  <View style={styles.actionBtn}>
                    <FeatherIcon name="eye" size={mscale(18)} color="#888" />
                    {post.views > 0 && (
                      <Text style={styles.actionCount}>{post.views}</Text>
                    )}
                  </View>

                  {/* Like */}
                  <TouchableOpacity
                    style={styles.actionBtn}
                    hitSlop={8}
                    onPress={() => post.id && likeMutation.mutate({ postId: post.id, isLiked: post.isLikedByMe })}
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
                  <TouchableOpacity style={styles.actionBtn} hitSlop={8} onPress={() => handleShare(post)}>
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
    height: hscale(220),
    borderRadius: mscale(12),
    marginBottom: hscale(16),
    backgroundColor: "#F0EEF5",
  },
  pollContainer: {
    marginTop: hscale(8),
    marginBottom: hscale(16),
  },
  pollOption: {
    borderWidth: 1,
    borderColor: "#EAE6F0",
    borderRadius: mscale(8),
    paddingVertical: hscale(10),
    paddingHorizontal: wscale(12),
    marginBottom: hscale(8),
    backgroundColor: "#FAFAFA",
  },
  pollOptionText: {
    fontFamily: "Inter-Medium",
    fontSize: mscale(14),
    color: "#301934",
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

  // ── Popout Menu Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalPopout: {
    backgroundColor: "#fff",
    borderRadius: mscale(16),
    paddingVertical: hscale(8),
    width: wscale(200),
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  popoutMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hscale(12),
    paddingHorizontal: wscale(16),
    gap: wscale(8),
  },
  popoutDivider: {
    height: 1,
    backgroundColor: "#F0EEF5",
  },
  popoutMenuText: {
    fontFamily: "Inter-Medium",
    fontSize: mscale(14),
    color: "#333",
  },
});
