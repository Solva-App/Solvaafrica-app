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
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FeatherIcon from "@expo/vector-icons/Feather";

import { hscale, mscale, wscale } from "../helpers/metric";
import { useState, useRef } from "react";

const INITIAL_COMMENTS = [
  {
    id: "c1",
    author: "Chidi",
    campus: "UNILAG",
    avatar: "https://i.pravatar.cc/150?img=12",
    time: "2h",
    content: "The speed is actually insane! Just got mine too 🚀",
    likes: 45,
    isLiked: false,
    hasThreadBelow: true,
  },
  {
    id: "c2",
    author: "Aminat",
    campus: "OAU",
    avatar: "https://i.pravatar.cc/150?img=9",
    time: "5h",
    content: "Solva is literally changing the game for us students. No more broke days!",
    likes: 128,
    isLiked: true,
    hasThreadBelow: true,
  },
  {
    id: "c3",
    author: "Daniel",
    campus: "UNIBEN",
    avatar: "https://i.pravatar.cc/150?img=14",
    time: "3h",
    content: "Facts! The research tasks are my favorite way to earn.",
    likes: 12,
    isLiked: false,
    hasThreadBelow: false,
  },
];

export default function PostDetailsScreen() {
  const router = useRouter();
  
  // State for post actions
  const [postLiked, setPostLiked] = useState(false);
  const [postReposted, setPostReposted] = useState(false);

  // State for comments and input
  const [comments, setComments] = useState(INITIAL_COMMENTS);
  const [commentText, setCommentText] = useState("");
  
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  // --- Handlers for Post Actions ---
  const handleTogglePostLike = () => setPostLiked(!postLiked);
  const handleTogglePostRepost = () => setPostReposted(!postReposted);
  
  const handleShowOptions = () => {
    Platform.OS === "web"
      ? window.alert("More Options: Menu coming soon!")
      : Alert.alert("More Options", "Menu coming soon!");
  };

  const handleShare = () => {
    Platform.OS === "web"
      ? window.alert("Share options coming soon!")
      : Alert.alert("Share", "Share options coming soon!");
  };

  const handleMessageIcon = () => {
    // Focus the input to type a comment
    inputRef.current?.focus();
  };

  // --- Handlers for Comments ---
  const handleToggleCommentLike = (id: string) => {
    setComments(prev => prev.map(c => {
      if (c.id === id) {
        const isNowLiked = !c.isLiked;
        return {
          ...c,
          isLiked: isNowLiked,
          likes: isNowLiked ? c.likes + 1 : c.likes - 1,
        };
      }
      return c;
    }));
  };

  const handleReplyToComment = (author: string) => {
    setCommentText(`@${author} `);
    inputRef.current?.focus();
  };

  const handleSendComment = () => {
    if (!commentText.trim()) return;

    // Update previous last comment so it shows a thread line
    const updatedComments = comments.map((c, index) => {
      if (index === comments.length - 1) {
        return { ...c, hasThreadBelow: true };
      }
      return c;
    });

    const newComment = {
      id: `c${Date.now()}`,
      author: "You",
      campus: "UNILAG",
      avatar: "https://i.pravatar.cc/150?img=44",
      time: "Just now",
      content: commentText.trim(),
      likes: 0,
      isLiked: false,
      hasThreadBelow: false,
    };

    setComments([...updatedComments, newComment]);
    setCommentText("");

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <FeatherIcon name="arrow-left" size={mscale(24)} color="#301934" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <TouchableOpacity hitSlop={8} onPress={handleShowOptions}>
          <FeatherIcon name="more-vertical" size={mscale(20)} color="#555" />
        </TouchableOpacity>
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
              <Image source={{ uri: "https://i.pravatar.cc/150?img=11" }} style={styles.avatar} />
              <View style={styles.postMetaInfo}>
                <View style={styles.authorRow}>
                  <Text style={styles.authorName}>Tunde • UNILAG</Text>
                  <MaterialCommunityIcons
                    name="check-decagram"
                    size={mscale(14)}
                    color="#1DA1F2"
                    style={{ marginLeft: 4 }}
                  />
                </View>
                <Text style={styles.postDate}>Mar 12, 2024</Text>
              </View>
              <TouchableOpacity hitSlop={8} onPress={handleShowOptions}>
                <FeatherIcon name="more-horizontal" size={mscale(18)} color="#999" />
              </TouchableOpacity>
            </View>

            <Text style={styles.postContent}>
              Just cashed out my <Text style={{ color: "#D81B60", fontFamily: "Inter-Medium" }}>N15,000</Text> withdrawal from Solva Wallet! Hustle pays, we move! 💸🔥
            </Text>

            <View style={styles.viewsContainer}>
              <Text style={styles.viewsCount}>12.3K</Text>
              <Text style={styles.viewsLabel}> Views</Text>
            </View>

            {/* Post Action Buttons */}
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.actionBtn} hitSlop={8} onPress={handleMessageIcon}>
                <FeatherIcon name="message-square" size={mscale(18)} color="#888" />
                <Text style={styles.actionText}>{comments.length}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn} hitSlop={8} onPress={handleTogglePostRepost}>
                <FeatherIcon name="repeat" size={mscale(18)} color={postReposted ? "#00BA7C" : "#888"} />
                <Text style={[styles.actionText, postReposted && { color: "#00BA7C" }]}>
                  {postReposted ? "1" : ""}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn} hitSlop={8} onPress={handleTogglePostLike}>
                <FeatherIcon name="heart" size={mscale(18)} color={postLiked ? "#F91880" : "#888"} />
                <Text style={[styles.actionText, postLiked && { color: "#F91880" }]}>
                  {postLiked ? "2.4K" : ""}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn} hitSlop={8} onPress={handleShare}>
                <FeatherIcon name="share" size={mscale(18)} color="#888" />
              </TouchableOpacity>
            </View>
          </View>

          {/* ── REPLYING TEXT ── */}
          <Text style={styles.replyingText}>
            Replying to <Text style={{ color: "#5E17EB" }}>@Tunde</Text>
          </Text>

          {/* ── COMMENTS THREAD ── */}
          <View style={styles.commentsSection}>
            {comments.map((comment, idx) => (
              <View key={comment.id} style={styles.commentRow}>
                {/* Left col: Avatar & Thread Line */}
                <View style={styles.commentLeftCol}>
                  <Image source={{ uri: comment.avatar }} style={styles.commentAvatar} />
                  {comment.hasThreadBelow && <View style={styles.threadLine} />}
                  {!comment.hasThreadBelow && idx === comments.length - 1 && (
                     <View style={styles.threadLineCurve} />
                  )}
                </View>

                {/* Right col: Content */}
                <View style={styles.commentRightCol}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>
                      {comment.author} <Text style={styles.commentCampus}>▪ {comment.campus}</Text>
                    </Text>
                    <Text style={styles.commentTime}>{comment.time}</Text>
                  </View>

                  <Text style={styles.commentContent}>{comment.content}</Text>

                  <View style={styles.commentActions}>
                    <TouchableOpacity 
                      style={styles.likeBtn} 
                      hitSlop={8}
                      onPress={() => handleToggleCommentLike(comment.id)}
                    >
                      <FeatherIcon 
                        name="heart" 
                        size={mscale(14)} 
                        color={comment.isLiked ? "#F91880" : "#666"} 
                      />
                      <Text style={[styles.likeCount, comment.isLiked && { color: "#F91880" }]}>
                        {comment.likes}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      hitSlop={8}
                      onPress={() => handleReplyToComment(comment.author)}
                    >
                      <Text style={styles.replyBtnText}>Reply</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* ── INPUT BAR ── */}
        <View style={styles.inputBar}>
          <Image source={{ uri: "https://i.pravatar.cc/150?img=44" }} style={styles.inputAvatar} />
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
              style={[styles.sendBtn, !commentText.trim() && { opacity: 0.5 }]} 
              hitSlop={8}
              onPress={handleSendComment}
              disabled={!commentText.trim()}
            >
              <FeatherIcon name="send" size={mscale(16)} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    borderBottomWidth: 1,
    borderBottomColor: "#F0EEF5",
  },
  headerTitle: {
    flex: 1,
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
  postMetaInfo: {
    flex: 1,
    marginLeft: wscale(12),
    justifyContent: "center",
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
  },
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
    justifyContent: "space-between",
    paddingHorizontal: wscale(8),
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

  // Replying text
  replyingText: {
    fontFamily: "Inter-Medium",
    fontSize: mscale(13),
    color: "#666",
    marginBottom: hscale(16),
  },

  // Comments
  commentsSection: {
    paddingBottom: hscale(20),
  },
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
  threadLine: {
    width: 2,
    backgroundColor: "#EAE6F0",
    flex: 1,
    marginTop: hscale(4),
  },
  threadLineCurve: {
    width: wscale(20),
    height: hscale(30),
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: "#EAE6F0",
    borderBottomLeftRadius: 10,
    alignSelf: "flex-start",
    marginLeft: wscale(18),
    marginTop: -hscale(10),
    zIndex: 1,
  },
  commentRightCol: {
    flex: 1,
    paddingBottom: hscale(20),
  },
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
