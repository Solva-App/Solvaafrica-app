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
  Share,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FeatherIcon from "@expo/vector-icons/Feather";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ToastManager, { Toast } from "toastify-react-native";

import { hscale, mscale, wscale } from "../helpers/metric";
import { useRef, useState, useEffect } from "react";
import {
  fetchPostById,
  likePost,
  unlikePost,
  commentOnPost,
  likeComment,
  unlikeComment,
  viewPost,
  deletePost,
  deleteComment,
  voteOnPoll,
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
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyingToName, setReplyingToName] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  const postAuthorId = postData ? String(postData.userId ?? postData.author?._id ?? postData.author?.id ?? postData.user?._id ?? postData.user?.id ?? postData.authorId ?? "").trim() : "";
  const myIdStr = String(authUser?.profile?.userID ?? authUser?.profile?.id ?? authUser?.profile?._id ?? authUser?.user?.userID ?? authUser?.user?.id ?? authUser?.user?._id ?? "").trim();
  const isMyPost = myIdStr !== "" && postAuthorId !== "" && myIdStr === postAuthorId;
  const liveAvatar = isMyPost ? (authUser?.profile?.profilePic ?? authUser?.profile?.avatar) : null;

  const post = postData
    ? {
        id: String(postData._id ?? postData.id ?? ""),
        author:
          postData.username ??
          postData.author?.fullName ??
          postData.author?.name ??
          postData.author?.username ??
          postData.user?.fullName ??
          postData.user?.name ??
          postData.authorName ??
          "Anonymous",
        campus: postData.campus ?? postData.author?.campus ?? postData.user?.campus ?? "",
        avatar:
          liveAvatar ??
          postData.profilePic ??
          postData.author?.profilePic ??
          postData.author?.avatar ??
          postData.user?.profilePic ??
          postData.user?.avatar ??
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
        image: (postData.mediaUrl && postData.mediaUrl.length > 0) ? postData.mediaUrl : 
               (postData.image && postData.image.length > 0) ? postData.image : 
               (postData.imageUrl && postData.imageUrl.length > 0) ? postData.imageUrl : undefined,
        views: postData.views ? `${postData.views}` : null,
        likes: typeof postData.likes === "number" ? postData.likes : Array.isArray(postData.likes) ? postData.likes.length : postData.likesCount ?? 0,
        isLikedByMe: postData.liked ?? postData.isLiked ?? false,
        views: typeof postData.views === "number" ? postData.views : (postData.viewsCount ?? 0),
        poll: (() => {
          if (!postData.poll) return null;
          try {
            return typeof postData.poll === "string" ? JSON.parse(postData.poll) : postData.poll;
          } catch {
            return null;
          }
        })(),
        comments: Array.isArray(postData.comments) ? postData.comments : [],
      }
    : null;


  // ── Like post (optimistic toggle) ──
  const likeMutation = useMutation({
    mutationFn: () => likePost(postId!),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["post", postId] });
      const previous = queryClient.getQueryData(["post", postId]);
      queryClient.setQueryData(["post", postId], (old: any) => {
        if (!old) return old;
        const currentLiked = old.liked ?? old.isLiked ?? false;
        const currentLikes = typeof old.likes === "number" ? old.likes : (old.likesCount ?? 0);
        return {
          ...old,
          liked: !currentLiked,
          isLiked: !currentLiked,
          likes: currentLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1,
        };
      });
      return { previous };
    },
    onError: (_err, _vars, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(["post", postId], context.previous);
      }
      Toast.error("Couldn't like post. Try again.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
    },
  });


  // ── Auto-increment view count when post is opened ──
  useEffect(() => {
    if (postId) {
      viewPost(postId).catch(() => {}); // fire-and-forget, ignore errors
    }
  }, [postId]);

  // ── Vote Poll mutation ──
  const votePollMutation = useMutation({
    mutationFn: (optionIndex: number) => voteOnPoll({ postId: postId!, optionIndex }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      Toast.success("Vote recorded!");
    },
    onError: () => Toast.error("Failed to vote."),
  });

  // ── Comment on post ──
  const commentMutation = useMutation({
    mutationFn: (message: string) => commentOnPost({ id: postId!, message, parentid: replyingToId || undefined }),
    onMutate: async (message) => {
      await queryClient.cancelQueries({ queryKey: ["post", postId] });
      const previousPost = queryClient.getQueryData(["post", postId]);
      queryClient.setQueryData(["post", postId], (old: any) => {
        if (!old) return old;
        const newComment = {
          _id: `temp-${Date.now()}`,
          content: message,
          author: authUser?.profile,
          createdAt: new Date().toISOString(),
          likesCount: 0,
          isLiked: false,
          parentid: replyingToId
        };
        return { ...old, comments: [...(old.comments || []), newComment] };
      });
      return { previousPost };
    },
    onSuccess: () => {
      setCommentText("");
      setReplyingToId(null);
      setReplyingToName(null);
      Toast.success("Comment posted!");
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 200);
    },
    onError: (err: any, variables, context: any) => {
      if (context?.previousPost) {
        queryClient.setQueryData(["post", postId], context.previousPost);
      }
      Toast.error(err?.response?.data?.message || err?.message || "Couldn't post comment.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
    }
  });

  // ── Like / Unlike a comment ──
  const likeCommentMutation = useMutation({
    mutationFn: ({ commentId, isLiked }: { commentId: string; isLiked: boolean }) =>
      isLiked ? unlikeComment(commentId) : likeComment(commentId),
    onMutate: async ({ commentId, isLiked }) => {
      await queryClient.cancelQueries({ queryKey: ["post", postId] });
      const previousPost = queryClient.getQueryData(["post", postId]);
      queryClient.setQueryData(["post", postId], (old: any) => {
        if (!old) return old;
        const updateCommentTree = (comments: any[], targetId: string): any[] => {
          return comments.map((c: any) => {
            const cId = String(c._id ?? c.id);
            if (cId === targetId) {
              const likesCount = Array.isArray(c.likes) ? c.likes.length : (c.likesCount ?? 0);
              return {
                ...c,
                isLiked: !isLiked,
                liked: !isLiked,
                likesCount: isLiked ? Math.max(0, likesCount - 1) : likesCount + 1
              };
            }
            if (c.replies && Array.isArray(c.replies)) {
              return { ...c, replies: updateCommentTree(c.replies, targetId) };
            }
            return c;
          });
        };
        return { ...old, comments: updateCommentTree(old.comments || [], commentId) };
      });
      return { previousPost };
    },
    onError: (err: any, variables, context: any) => {
      if (context?.previousPost) {
        queryClient.setQueryData(["post", postId], context.previousPost);
      }
      Toast.error(err?.response?.data?.message || err?.message || "Couldn't update comment like.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    }
  });

  // ── Delete post ──
  const deleteMutation = useMutation({
    mutationFn: () => deletePost(postId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      Toast.success("Post deleted.");
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(tabs)/community" as any);
      }
    },
    onError: () => {
      Toast.error("Failed to delete post. You can only delete your own posts.");
    }
  });

  // ── Delete comment ──
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => {
      if (commentId.startsWith("temp-")) {
        return Promise.reject(new Error("Please wait a moment for the server to finish saving this reply before deleting it."));
      }
      return deleteComment(commentId);
    },
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: ["post", postId] });
      const previousPost = queryClient.getQueryData(["post", postId]);
      queryClient.setQueryData(["post", postId], (old: any) => {
        if (!old) return old;
        const filterCommentTree = (comments: any[], targetId: string): any[] => {
          return comments.filter((c: any) => String(c._id ?? c.id) !== targetId).map((c: any) => {
            if (c.replies && Array.isArray(c.replies)) {
              return { ...c, replies: filterCommentTree(c.replies, targetId) };
            }
            return c;
          });
        };
        return { ...old, comments: filterCommentTree(old.comments || [], commentId) };
      });
      return { previousPost };
    },
    onSuccess: (_, commentId) => {
      Toast.success("Comment deleted.");
      // Ensure the comment stays deleted in the cache even if a background refetch is pending
      queryClient.setQueryData(["post", postId], (old: any) => {
        if (!old) return old;
        const filterCommentTree = (comments: any[], targetId: string): any[] => {
          return comments.filter((c: any) => String(c._id ?? c.id) !== targetId).map((c: any) => {
            if (c.replies && Array.isArray(c.replies)) {
              return { ...c, replies: filterCommentTree(c.replies, targetId) };
            }
            return c;
          });
        };
        return { ...old, comments: filterCommentTree(old.comments || [], commentId) };
      });
    },
    onError: (err: any, variables, context: any) => {
      if (context?.previousPost) {
        queryClient.setQueryData(["post", postId], context.previousPost);
      }
      Toast.error(err?.response?.data?.message || err?.message || "Failed to delete comment.");
    },
    onSettled: () => {
      // Delay invalidation slightly so the backend database has time to catch up
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["post", postId] });
        queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      }, 1000);
    }
  });

  const handleMoreOptions = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const confirmDeletePost = () => {
    setIsMenuOpen(false);
    if (Platform.OS === "web") {
      const confirmDelete = window.confirm("Are you sure you want to delete this post?");
      if (confirmDelete) {
        deleteMutation.mutate();
      }
      return;
    }
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteMutation.mutate() },
    ]);
  };

  const confirmReportPost = () => {
    setIsMenuOpen(false);
    router.push("/(tabs)/settings?section=support" as any);
  };

  const handleDeleteComment = (commentId: string) => {
    if (Platform.OS === "web") {
      const confirmDelete = window.confirm("Delete this comment?");
      if (confirmDelete) {
        deleteCommentMutation.mutate(commentId);
      }
      return;
    }

    Alert.alert("Delete Comment", "Are you sure you want to delete this comment?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteCommentMutation.mutate(commentId) },
    ]);
  };

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    commentMutation.mutate(commentText.trim());
  };

  const handleReplyToComment = (author: string, commentId: string) => {
    setReplyingToId(commentId);
    setReplyingToName(author);
    setCommentText(`@${author} `);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleShare = async () => {
    if (!post) return;
    try {
      await Share.share({
        message: `Check out this post on Solva by ${post.author}:\n\n"${post.content}"\n\nJoin the conversation on Solva!`,
      });
    } catch (error: any) {
      Toast.error("Failed to share post.");
    }
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
        <TouchableOpacity 
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/(tabs)/community" as any);
            }
          }} 
          hitSlop={8}
        >
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
              <View>
                <TouchableOpacity style={styles.moreBtn} hitSlop={8} onPress={handleMoreOptions}>
                  <FeatherIcon name="more-horizontal" size={mscale(18)} color="#999" />
                </TouchableOpacity>

                <Modal
                  visible={isMenuOpen}
                  transparent={true}
                  animationType="fade"
                  onRequestClose={() => setIsMenuOpen(false)}
                >
                  <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setIsMenuOpen(false)}
                  >
                    <View style={styles.modalPopout}>
                      <TouchableOpacity style={styles.popoutMenuItem} onPress={confirmDeletePost}>
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
                      <Image source={{ uri }} style={[styles.postImage, { width: 300, marginTop: 0 }]} resizeMode="cover" />
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
                  <Image source={{ uri: post.image }} style={styles.postImage} resizeMode="contain" />
                </TouchableOpacity>
              )
            ) : null}

            {post.poll && Array.isArray(post.poll) && post.poll.length > 0 ? (
              <View style={styles.pollContainer}>
                {post.poll.map((opt: string, idx: number) => (
                  <TouchableOpacity 
                    key={idx} 
                    style={styles.pollOption}
                    onPress={() => votePollMutation.mutate(idx)}
                  >
                    <Text style={styles.pollOptionText}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
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

              {/* Views */}
              <View style={styles.actionBtn}>
                <FeatherIcon name="eye" size={mscale(18)} color="#888" />
                {post.views > 0 && (
                  <Text style={styles.actionText}>{post.views}</Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.actionBtn}
                hitSlop={8}
                onPress={() => {
                  if (post.isLikedByMe) {
                    // Already liked — call DELETE to unlike
                    unlikePost(postId!).then(() => {
                      queryClient.invalidateQueries({ queryKey: ["post", postId] });
                      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
                    }).catch(() => Toast.error("Couldn't unlike. Try again."));
                  } else {
                    likeMutation.mutate();
                  }
                }}
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

              <TouchableOpacity style={styles.actionBtn} hitSlop={8} onPress={handleShare}>
                <FeatherIcon name="share" size={mscale(18)} color="#888" />
              </TouchableOpacity>
            </View>
          </View>

          {/* ── REPLYING TEXT ── */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingRight: wscale(20) }}>
            <Text style={styles.replyingText}>
              Replying to{" "}
              <Text style={{ color: "#5E17EB" }}>@{replyingToId ? replyingToName : post.author}</Text>
            </Text>
            {replyingToId && (
              <TouchableOpacity onPress={() => { setReplyingToId(null); setReplyingToName(null); setCommentText(""); }}>
                <Text style={{ color: "#888", fontSize: mscale(12), paddingVertical: 4 }}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ── COMMENTS THREAD ── */}
          <View style={styles.commentsSection}>
            {post.comments.length === 0 ? (
              <Text style={styles.noCommentsText}>
                No comments yet. Be the first to reply!
              </Text>
            ) : (
              (() => {
                // Helper to build a tree if backend returns a flat list with parentId
                const buildCommentTree = (flatComments: any[]) => {
                  const commentMap = new Map();
                  const roots: any[] = [];
                  flatComments.forEach((c, i) => {
                    commentMap.set(String(c._id ?? c.id ?? i), { ...c, calculatedReplies: c.replies ? [...c.replies] : [] });
                  });
                  flatComments.forEach((c, i) => {
                    const cId = String(c._id ?? c.id ?? i);
                    const parentId = c.parentId ?? c.parentid;
                    if (parentId && commentMap.has(String(parentId))) {
                      commentMap.get(String(parentId)).calculatedReplies.push(commentMap.get(cId));
                    } else {
                      roots.push(commentMap.get(cId));
                    }
                  });
                  return roots;
                };

                const commentTree = buildCommentTree(post.comments);

                const renderCommentNode = (comment: any, idx: number, isReply = false, isLast = false) => {
                  const commentId = String(comment._id ?? comment.id ?? idx);
                  const commentAuthor =
                    comment.author?.fullName ??
                    comment.author?.name ??
                    comment.author?.username ??
                    comment.user?.fullName ??
                    comment.user?.name ??
                    comment.user?.username ??
                    comment.authorName ??
                    comment.username ??
                    comment.name ??
                    "User";
                  const commentAuthorId = String(
                    comment.userId ??
                    comment.authorId ??
                    comment.author?.userID ??
                    comment.author?._id ??
                    comment.author?.id ??
                    comment.user?.userID ??
                    comment.user?._id ??
                    comment.user?.id ??
                    comment.user_id ??
                    comment.author_id ??
                    (typeof comment.user === "string" ? comment.user : "") ??
                    (typeof comment.author === "string" ? comment.author : "") ??
                    ""
                  ).trim();
                  
                  const isMyComment = myIdStr !== "" && commentAuthorId !== "" && myIdStr === commentAuthorId;
                  const liveCommentAvatar = isMyComment ? (authUser?.profile?.profilePic ?? authUser?.profile?.avatar) : null;

                  const commentAvatar =
                    liveCommentAvatar ??
                    comment.author?.profilePic ??
                    comment.author?.avatar ??
                    comment.user?.profilePic ??
                    comment.user?.avatar ??
                    comment.profilePic ??
                    comment.avatar ??
                    "https://i.pravatar.cc/150?img=1";
                  const commentContent =
                    comment.content ?? comment.message ?? comment.text ?? "";
                  const commentLikes = Array.isArray(comment.likes)
                    ? comment.likes.length
                    : comment.likesCount ?? 0;
                  const commentIsLiked = comment.isLiked ?? comment.liked ?? false;
                  const commentTime = comment.createdAt
                    ? new Date(comment.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                      })
                    : "Just now";
                  const hasThreadBelow = !isLast;

                  return (
                    <View key={commentId}>
                      <View style={[styles.commentRow, isReply && { marginLeft: wscale(40), marginTop: hscale(8) }]}>
                        {/* Left col: Avatar & Thread Line */}
                        <View style={[styles.commentLeftCol, isReply && { width: wscale(28) }]}>
                          {commentAvatar === "https://i.pravatar.cc/150?img=1" ? (
                            <View style={[styles.commentAvatarPlaceholder, isReply && { width: wscale(28), height: wscale(28), borderRadius: wscale(14) }]}>
                              <Text style={[styles.avatarPlaceholderText, isReply && { fontSize: mscale(12) }]}>
                                {commentAuthor.charAt(0).toUpperCase()}
                              </Text>
                            </View>
                          ) : (
                            <Image
                              source={{ uri: commentAvatar }}
                              style={[styles.commentAvatar, isReply && { width: wscale(28), height: wscale(28), borderRadius: wscale(14) }]}
                            />
                          )}
                          {hasThreadBelow && !isReply && <View style={styles.threadLine} />}
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
                              onPress={() => likeCommentMutation.mutate({ commentId, isLiked: commentIsLiked })}
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
                              onPress={() => handleReplyToComment(commentAuthor, commentId)}
                            >
                              <Text style={styles.replyBtnText}>Reply</Text>
                            </TouchableOpacity>

                            {(() => {
                              const myId = String(
                                authUser?.profile?.userID ??
                                authUser?.profile?.id ??
                                authUser?.profile?._id ??
                                authUser?.user?.userID ??
                                authUser?.user?._id ??
                                authUser?.user?.id ??
                                authUser?.userID ??
                                authUser?._id ??
                                authUser?.id ??
                                ""
                              ).trim();

                              const myName = String(
                                authUser?.profile?.fullName ?? 
                                authUser?.profile?.name ?? 
                                authUser?.profile?.username ?? 
                                authUser?.user?.fullName ?? 
                                authUser?.user?.name ?? 
                                authUser?.user?.username ?? 
                                authUser?.fullName ?? 
                                authUser?.name ?? 
                                authUser?.username ?? 
                                "User"
                              ).trim();

                              const myEmail = String(
                                authUser?.profile?.email ?? 
                                authUser?.user?.email ?? 
                                authUser?.email ?? 
                                ""
                              ).trim();

                              const authorId = String(
                                comment.userId ??
                                comment.authorId ??
                                comment.author?.userID ??
                                comment.author?._id ??
                                comment.author?.id ??
                                comment.user?.userID ??
                                comment.user?._id ??
                                comment.user?.id ??
                                comment.user_id ??
                                comment.author_id ??
                                (typeof comment.user === "string" ? comment.user : "") ??
                                (typeof comment.author === "string" ? comment.author : "") ??
                                ""
                              ).trim();
                              
                              const authorEmail = String(
                                comment.author?.email ?? 
                                comment.user?.email ?? 
                                comment.email ?? 
                                ""
                              ).trim();
                              
                              const isOwn = 
                                (myId !== "" && authorId !== "" && authorId === myId) || 
                                (myEmail !== "" && authorEmail !== "" && authorEmail === myEmail) ||
                                String(comment._id ?? comment.id ?? "").startsWith("temp-") ||
                                (myName !== "User" && commentAuthor !== "User" && myName === commentAuthor);
                              
                              if (isOwn) {
                                return (
                                  <TouchableOpacity
                                    hitSlop={8}
                                    onPress={() => handleDeleteComment(commentId)}
                                  >
                                    <FeatherIcon name="trash-2" size={mscale(14)} color="#FF3B30" />
                                  </TouchableOpacity>
                                );
                              }
                              return null;
                            })()}
                          </View>
                        </View>
                      </View>

                      {/* Render Nested Replies */}
                      {comment.calculatedReplies && comment.calculatedReplies.length > 0 && (
                        <View style={{ marginBottom: hscale(8) }}>
                          {comment.calculatedReplies.map((reply: any, rIdx: number) => 
                            renderCommentNode(reply, rIdx, true, rIdx === comment.calculatedReplies.length - 1)
                          )}
                        </View>
                      )}
                    </View>
                  );
                };

                return commentTree.map((comment: any, idx: number) => 
                  renderCommentNode(comment, idx, false, idx === commentTree.length - 1)
                );
              })()
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
  moreBtn: {
    padding: mscale(4),
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
