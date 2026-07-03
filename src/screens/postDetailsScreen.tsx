import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FeatherIcon from "@expo/vector-icons/Feather";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ToastManager, { Toast } from "toastify-react-native";

import { hscale, mscale, wscale } from "../helpers/metric";
import { useRef } from "react";
import { useState } from "react";
import {
  fetchPostById,
  likePost,
  commentOnPost,
  likeComment,
} from "../api/queries";
import { useAuthStore } from "../stores/authStore";
import { colors } from "../constants/theme";
import AvatarView from "../components/avatarView";

export default function PostDetailsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const authUser = useAuthStore((state) => state.user);

  const userAvatar =
    authUser?.profile?.profilePic ??
    authUser?.profile?.avatar;

  const [commentText, setCommentText] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  // ── Fetch post ──
  const {
    data: postData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => fetchPostById(postId!),
    enabled: !!postId,
  });

  // Normalise
  const post = postData
    ? {
        id: String(postData._id ?? postData.id ?? ""),
        author:
          postData.author?.fullName ??
          postData.author?.name ??
          postData.authorName ??
          "Anonymous",
        campus: postData.campus ?? postData.author?.campus ?? "",
        avatar:
          postData.author?.profilePic ??
          postData.authorAvatar ??
          "https://i.pravatar.cc/150?img=1",
        badge: postData.badge ?? "none",
        date: postData.createdAt
          ? new Date(postData.createdAt).toLocaleDateString("en-NG", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "Just now",
        content: postData.content ?? postData.text ?? "",
        image: postData.image ?? postData.imageUrl ?? null,
        views: postData.views ?? null,
        likes: Array.isArray(postData.likes)
          ? postData.likes.length
          : postData.likesCount ?? 0,
        isLikedByMe: postData.isLiked ?? false,
        comments: Array.isArray(postData.comments)
          ? postData.comments
          : [],
      }
    : null;

  // ── Like post ──
  const likeMutation = useMutation({
    mutationFn: () => likePost(postId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
    },
    onError: () => Toast.error("Couldn't like post. Try again."),
  });

  // ── Comment on post ──
  const commentMutation = useMutation({
    mutationFn: (message: string) => commentOnPost({ id: postId!, message }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      setCommentText("");
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 200);
    },
    onError: () => Toast.error("Couldn't post comment. Try again."),
  });

  // ── Like a comment ──
  const likeCommentMutation = useMutation({
    mutationFn: (commentId: string) => likeComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    commentMutation.mutate(commentText.trim());
  };

  const handleReplyToComment = (author: string) => {
    setCommentText(`@${author} `);
    inputRef.current?.focus();
  };

  // ── LOADING / ERROR states ──
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 12, color: "#888", fontFamily: "Inter-Regular" }}>
          Loading post...
        </Text>
      </SafeAreaView>
    );
  }

  if (isError || !post) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <FeatherIcon name="alert-circle" size={40} color="#ccc" />
        <Text style={{ marginTop: 12, color: "#888", fontFamily: "Inter-Regular" }}>
          Couldn't load this post.
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          style={{ marginTop: 16, backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 }}
        >
          <Text style={{ color: "#fff", fontFamily: "Inter-SemiBold" }}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ToastManager />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <FeatherIcon name="arrow-left" size={mscale(24)} color="#301934" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── MAIN POST CARD ── */}
          <View style={styles.postCard}>
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
                  {post.badge === "blue-check" && (
                    <MaterialCommunityIcons
                      name="check-decagram"
                      size={mscale(14)}
                      color="#1DA1F2"
                      style={{ marginLeft: 4 }}
                    />
                  )}
                  {post.badge === "pink-star" && (
                    <MaterialCommunityIcons
                      name="star-circle"
                      size={mscale(14)}
                      color="#D81B60"
                      style={{ marginLeft: 4 }}
                    />
                  )}
                </View>
                <Text style={styles.postDate}>{post.date}</Text>
              </View>
            </View>

            {post.content ? (
              <Text style={styles.postContent}>{post.content}</Text>
            ) : null}

            {post.image ? (
              <Image source={{ uri: post.image }} style={styles.postImage} />
            ) : null}

            {post.views ? (
              <View style={styles.viewsContainer}>
                <Text style={styles.viewsCount}>{post.views}</Text>
                <Text style={styles.viewsLabel}> Views</Text>
              </View>
            ) : null}

            {/* Post Action Buttons */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.actionBtn}
                hitSlop={8}
                onPress={() => inputRef.current?.focus()}
              >
                <FeatherIcon name="message-square" size={mscale(18)} color="#888" />
                {post.comments.length > 0 && (
                  <Text style={styles.actionText}>{post.comments.length}</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionBtn}
                hitSlop={8}
                onPress={() => likeMutation.mutate()}
                disabled={likeMutation.isPending}
              >
                <FeatherIcon
                  name="heart"
                  size={mscale(18)}
                  color={post.isLikedByMe ? "#F91880" : "#888"}
                />
                {post.likes > 0 && (
                  <Text
                    style={[
                      styles.actionText,
                      post.isLikedByMe && { color: "#F91880" },
                    ]}
                  >
                    {post.likes}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn} hitSlop={8}>
                <FeatherIcon name="share" size={mscale(18)} color="#888" />
              </TouchableOpacity>
            </View>
          </View>

          {/* ── REPLYING TEXT ── */}
          <Text style={styles.replyingText}>
            Replying to{" "}
            <Text style={{ color: "#5E17EB" }}>@{post.author}</Text>
          </Text>

          {/* ── COMMENTS THREAD ── */}
          <View style={styles.commentsSection}>
            {post.comments.length === 0 ? (
              <Text style={styles.noCommentsText}>
                No comments yet. Be the first to reply!
              </Text>
            ) : (
              post.comments.map((comment: any, idx: number) => {
                const commentId = String(comment._id ?? comment.id ?? idx);
                const commentAuthor =
                  comment.author?.fullName ??
                  comment.author?.name ??
                  comment.name ??
                  "User";
                const commentAvatar =
                  comment.author?.profilePic ??
                  comment.avatar ??
                  "https://i.pravatar.cc/150?img=1";
                const commentContent =
                  comment.content ?? comment.message ?? comment.text ?? "";
                const commentLikes = Array.isArray(comment.likes)
                  ? comment.likes.length
                  : comment.likesCount ?? 0;
                const commentIsLiked = comment.isLiked ?? false;
                const commentTime = comment.createdAt
                  ? new Date(comment.createdAt).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                    })
                  : "Just now";
                const hasThreadBelow = idx < post.comments.length - 1;

                return (
                  <View key={commentId} style={styles.commentRow}>
                    {/* Left col: Avatar & Thread Line */}
                    <View style={styles.commentLeftCol}>
                      {commentAvatar === "https://i.pravatar.cc/150?img=1" ? (
                        <View style={styles.commentAvatarPlaceholder}>
                          <Text style={styles.avatarPlaceholderText}>
                            {commentAuthor.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      ) : (
                        <Image
                          source={{ uri: commentAvatar }}
                          style={styles.commentAvatar}
                        />
                      )}
                      {hasThreadBelow && <View style={styles.threadLine} />}
                    </View>

                    {/* Right col: Content */}
                    <View style={styles.commentRightCol}>
                      <View style={styles.commentHeader}>
                        <Text style={styles.commentAuthor}>
                          {commentAuthor}{" "}
                          <Text style={styles.commentCampus}>
                            ▪ {comment.campus ?? comment.author?.campus ?? ""}
                          </Text>
                        </Text>
                        <Text style={styles.commentTime}>{commentTime}</Text>
                      </View>

                      <Text style={styles.commentContent}>{commentContent}</Text>

                      <View style={styles.commentActions}>
                        <TouchableOpacity
                          style={styles.likeBtn}
                          hitSlop={8}
                          onPress={() => likeCommentMutation.mutate(commentId)}
                        >
                          <FeatherIcon
                            name="heart"
                            size={mscale(14)}
                            color={commentIsLiked ? "#F91880" : "#666"}
                          />
                          <Text
                            style={[
                              styles.likeCount,
                              commentIsLiked && { color: "#F91880" },
                            ]}
                          >
                            {commentLikes > 0 ? commentLikes : ""}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          hitSlop={8}
                          onPress={() => handleReplyToComment(commentAuthor)}
                        >
                          <Text style={styles.replyBtnText}>Reply</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>

        {/* ── INPUT BAR ── */}
        <View style={styles.inputBar}>
          {userAvatar && userAvatar !== "https://i.pravatar.cc/150?img=44" ? (
            <Image source={{ uri: userAvatar }} style={styles.inputAvatar} />
          ) : (
            <View style={styles.inputAvatarContainer}>
              <AvatarView />
            </View>
          )}
          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              placeholder="Add a comment..."
              placeholderTextColor="#999"
              value={commentText}
              onChangeText={setCommentText}
              onSubmitEditing={handleSendComment}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                (!commentText.trim() || commentMutation.isPending) && {
                  opacity: 0.5,
                },
              ]}
              hitSlop={8}
              onPress={handleSendComment}
              disabled={!commentText.trim() || commentMutation.isPending}
            >
              {commentMutation.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <FeatherIcon name="send" size={mscale(16)} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFDFD" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wscale(20),
    paddingTop: hscale(10),
    paddingBottom: hscale(16),
    borderBottomWidth: 1,
    borderBottomColor: "#F0EEF5",
  },
  headerTitle: {
    fontFamily: "Inter-SemiBold",
    fontSize: mscale(18),
    color: "#301934",
  },

  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: wscale(20),
    paddingTop: hscale(20),
    paddingBottom: hscale(40),
  },

  // Post Card
  postCard: {
    backgroundColor: "#fff",
    borderRadius: mscale(16),
    padding: mscale(16),
    borderWidth: 1,
    borderColor: "#F0EEF5",
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    marginBottom: hscale(24),
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hscale(12),
  },
  avatar: {
    width: wscale(44),
    height: wscale(44),
    borderRadius: wscale(22),
    borderWidth: 1,
    borderColor: "#5E17EB",
  },
  avatarPlaceholder: {
    width: wscale(44),
    height: wscale(44),
    borderRadius: wscale(22),
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
  authorRow: { flexDirection: "row", alignItems: "center" },
  authorName: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(14),
    color: "#301934",
  },
  postDate: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(12),
    color: "#999",
    marginTop: hscale(2),
  },
  postContent: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(14),
    color: "#333",
    lineHeight: mscale(22),
    marginBottom: hscale(16),
  },
  postImage: {
    width: "100%",
    height: hscale(220),
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
    padding: mscale(6),
    gap: wscale(6),
  },
  actionText: {
    fontFamily: "Inter-Medium",
    fontSize: mscale(13),
    color: "#888",
  },

  replyingText: {
    fontFamily: "Inter-Medium",
    fontSize: mscale(13),
    color: "#666",
    marginBottom: hscale(16),
  },

  noCommentsText: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(14),
    color: "#aaa",
    textAlign: "center",
    paddingVertical: hscale(24),
  },

  commentsSection: { paddingBottom: hscale(20) },
  commentRow: {
    flexDirection: "row",
    marginBottom: hscale(4),
  },
  commentLeftCol: {
    alignItems: "center",
    width: wscale(40),
    marginRight: wscale(12),
  },
  commentAvatar: {
    width: wscale(36),
    height: wscale(36),
    borderRadius: wscale(18),
    zIndex: 2,
  },
  commentAvatarPlaceholder: {
    width: wscale(36),
    height: wscale(36),
    borderRadius: wscale(18),
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  threadLine: {
    width: 2,
    backgroundColor: "#EAE6F0",
    flex: 1,
    marginTop: hscale(4),
  },
  commentRightCol: { flex: 1, paddingBottom: hscale(20) },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hscale(4),
  },
  commentAuthor: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(13),
    color: "#111",
  },
  commentCampus: {
    fontFamily: "Inter-Regular",
    color: "#5E17EB",
  },
  commentTime: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(11),
    color: "#999",
  },
  commentContent: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(14),
    color: "#333",
    lineHeight: mscale(20),
    marginBottom: hscale(10),
  },
  commentActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: wscale(16),
  },
  likeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: wscale(4),
  },
  likeCount: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(12),
    color: "#666",
  },
  replyBtnText: {
    fontFamily: "Inter-Medium",
    fontSize: mscale(12),
    color: "#666",
  },

  // Input Bar
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wscale(20),
    paddingVertical: hscale(12),
    borderTopWidth: 1,
    borderTopColor: "#F0EEF5",
    backgroundColor: "#FAFAFA",
  },
  inputAvatar: {
    width: wscale(36),
    height: wscale(36),
    borderRadius: wscale(18),
    marginRight: wscale(12),
  },
  inputAvatarContainer: {
    width: wscale(36),
    height: wscale(36),
    marginRight: wscale(12),
    overflow: "hidden",
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: mscale(24),
    borderWidth: 1,
    borderColor: "#EAE6F0",
    paddingLeft: wscale(16),
    paddingRight: wscale(6),
    height: hscale(44),
  },
  textInput: {
    flex: 1,
    fontFamily: "Inter-Regular",
    fontSize: mscale(14),
    color: "#333",
    outlineStyle: "none",
  },
  sendBtn: {
    width: wscale(32),
    height: wscale(32),
    borderRadius: wscale(16),
    backgroundColor: "#5E17EB",
    alignItems: "center",
    justifyContent: "center",
  },
});
