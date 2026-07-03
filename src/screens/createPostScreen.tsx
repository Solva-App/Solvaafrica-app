import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import FeatherIcon from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as ImagePicker from "expo-image-picker";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ToastManager, { Toast } from "toastify-react-native";

import { hscale, mscale, wscale } from "../helpers/metric";
import { colors } from "../constants/theme";
import { useState } from "react";
import { createCommunityPost } from "../api/queries";
import { useAuthStore } from "../stores/authStore";
import AvatarView from "../components/avatarView";

const CAMPUSES = ["UNILAG", "UNIBEN", "OAU", "UI", "ABU", "UNN"];

export default function CreatePostScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const authUser = useAuthStore((state) => state.user);

  const userAvatar =
    authUser?.profile?.profilePic ??
    authUser?.profile?.avatar;

  const [postText, setPostText] = useState("");
  const [selectedCampus, setSelectedCampus] = useState(
    authUser?.profile?.campus ?? CAMPUSES[0]
  );
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Poll State
  const [showPoll, setShowPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);

  // ── Mutation ──
  const { mutate: submitPost, isPending } = useMutation({
    mutationFn: (formData: FormData) => createCommunityPost(formData),
    onSuccess: () => {
      // Invalidate the feed so it reloads with the new post
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      Toast.success("Post published! 🎉");
      setTimeout(() => router.back(), 800);
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Failed to publish post. Try again.";
      Toast.error(msg);
    },
  });

  const handleSelectCampus = (campus: string) => {
    setSelectedCampus(campus);
    setDropdownVisible(false);
  };

  const handlePickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Toast.error("Please grant access to your photos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleTakeImage = async () => {
    const permissionResult =
      await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Toast.error("Please grant camera access.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleAddPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, ""]);
    }
  };

  const handleUpdatePollOption = (text: string, index: number) => {
    const newOptions = [...pollOptions];
    newOptions[index] = text;
    setPollOptions(newOptions);
  };

  const handlePost = () => {
    const hasText = postText.trim().length > 0;
    const hasImage = !!selectedImage;
    const hasValidPoll =
      showPoll &&
      pollOptions.filter((opt) => opt.trim().length > 0).length >= 2;

    if (!hasText && !hasImage && !hasValidPoll) {
      Toast.warn("Write something, attach an image, or create a poll.");
      return;
    }

    // Build FormData
    const formData = new FormData();
    formData.append("content", postText.trim());
    formData.append("campus", selectedCampus);

    if (selectedImage) {
      const filename = selectedImage.split("/").pop() ?? "photo.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";
      formData.append("image", {
        uri: selectedImage,
        name: filename,
        type,
      } as any);
    }

    if (hasValidPoll) {
      formData.append(
        "poll",
        JSON.stringify(
          pollOptions.filter((o) => o.trim().length > 0).map((o) => o.trim())
        )
      );
    }

    submitPost(formData);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ToastManager />
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={8}
          disabled={isPending}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.postBtn, isPending && { opacity: 0.6 }]}
          hitSlop={8}
          onPress={handlePost}
          disabled={isPending}
        >
          <Text style={styles.postBtnText}>
            {isPending ? "Posting..." : "Post"}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.content}>
          {/* User row */}
          <View style={styles.userRow}>
            {userAvatar && userAvatar !== "https://i.pravatar.cc/150?img=44" ? (
              <Image source={{ uri: userAvatar }} style={styles.userAvatar} />
            ) : (
              <View style={styles.userAvatar}>
                <AvatarView />
              </View>
            )}
            {/* Campus Selector Pill */}
            <TouchableOpacity
              style={styles.campusPill}
              activeOpacity={0.7}
              onPress={() => setDropdownVisible(true)}
            >
              <Text style={styles.campusText}>{selectedCampus} 🦅</Text>
              <FeatherIcon
                name="chevron-down"
                size={mscale(16)}
                color="#301934"
              />
            </TouchableOpacity>
          </View>

          {/* Input Area */}
          <ScrollView
            style={styles.inputArea}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <TextInput
              style={styles.textInput}
              placeholder="What's happening?"
              placeholderTextColor="#B0B0B0"
              multiline
              autoFocus
              value={postText}
              onChangeText={setPostText}
              textAlignVertical="top"
            />

            {selectedImage && (
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.imagePreview}
                />
                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={() => setSelectedImage(null)}
                >
                  <FeatherIcon name="x" size={mscale(16)} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            {/* Poll Creation UI */}
            {showPoll && (
              <View style={styles.pollContainer}>
                <View style={styles.pollHeader}>
                  <Text style={styles.pollTitle}>Poll Options</Text>
                  <TouchableOpacity onPress={() => setShowPoll(false)}>
                    <FeatherIcon name="x" size={mscale(18)} color="#999" />
                  </TouchableOpacity>
                </View>

                {pollOptions.map((opt, index) => (
                  <View key={index} style={styles.pollInputWrapper}>
                    <TextInput
                      style={styles.pollInput}
                      placeholder={`Option ${index + 1}`}
                      placeholderTextColor="#999"
                      value={opt}
                      onChangeText={(text) =>
                        handleUpdatePollOption(text, index)
                      }
                      maxLength={25}
                    />
                    <Text style={styles.pollCount}>{opt.length}/25</Text>
                  </View>
                ))}

                {pollOptions.length < 4 && (
                  <TouchableOpacity
                    style={styles.addPollBtn}
                    onPress={handleAddPollOption}
                  >
                    <FeatherIcon name="plus" size={mscale(16)} color="#5E17EB" />
                    <Text style={styles.addPollText}>Add option</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </ScrollView>
        </View>

        {/* ── BOTTOM ACCESSORY BAR ── */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.replyPermissionRow}>
            <MaterialCommunityIcons
              name="web"
              size={mscale(16)}
              color="#4A148C"
            />
            <Text style={styles.replyPermissionText}>Everyone can reply</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.toolsRow}>
            <View style={styles.iconGroup}>
              <TouchableOpacity style={styles.toolBtn} onPress={handlePickImage}>
                <FeatherIcon
                  name="image"
                  size={mscale(20)}
                  color={selectedImage ? "#5E17EB" : "#555"}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.toolBtn} onPress={handleTakeImage}>
                <FeatherIcon name="camera" size={mscale(20)} color="#555" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.toolBtn}
                onPress={() => setShowPoll(!showPoll)}
              >
                <FeatherIcon
                  name="bar-chart-2"
                  size={mscale(20)}
                  color={showPoll ? "#5E17EB" : "#555"}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.rightTools}>
              <View style={styles.progressRing} />
              <View style={styles.verticalDivider} />
              <TouchableOpacity style={styles.addBtn}>
                <FeatherIcon name="plus" size={mscale(16)} color="#555" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* ── CAMPUS DROPDOWN MODAL ── */}
      <Modal
        visible={isDropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setDropdownVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.dropdownMenu}>
                <Text style={styles.dropdownTitle}>Select Campus</Text>
                <FlatList
                  data={CAMPUSES}
                  keyExtractor={(item) => item}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.dropdownItem,
                        item === selectedCampus && styles.dropdownItemSelected,
                      ]}
                      onPress={() => handleSelectCampus(item)}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          item === selectedCampus &&
                            styles.dropdownItemTextSelected,
                        ]}
                      >
                        {item}
                      </Text>
                      {item === selectedCampus && (
                        <FeatherIcon
                          name="check"
                          size={mscale(16)}
                          color="#5E17EB"
                        />
                      )}
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FCFCFE" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wscale(20),
    paddingTop: hscale(10),
    paddingBottom: hscale(16),
  },
  cancelText: {
    fontFamily: "Inter-Medium",
    fontSize: mscale(16),
    color: "#301934",
  },
  postBtn: {
    backgroundColor: "#301934",
    paddingVertical: hscale(8),
    paddingHorizontal: wscale(20),
    borderRadius: mscale(20),
  },
  postBtnText: {
    fontFamily: "Inter-SemiBold",
    fontSize: mscale(14),
    color: "#fff",
  },

  content: { flex: 1, paddingHorizontal: wscale(20) },

  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wscale(12),
    marginBottom: hscale(16),
  },
  userAvatar: {
    width: wscale(40),
    height: wscale(40),
    borderRadius: wscale(20),
    borderWidth: 1.5,
    borderColor: "#5E17EB",
  },
  campusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E6DCEE",
    paddingVertical: hscale(6),
    paddingHorizontal: wscale(12),
    borderRadius: mscale(20),
    gap: wscale(4),
  },
  campusText: {
    fontFamily: "Inter-Medium",
    fontSize: mscale(14),
    color: "#301934",
  },

  inputArea: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(216, 27, 96, 0.2)",
    backgroundColor: "#fff",
    padding: mscale(16),
    marginBottom: hscale(20),
    borderRadius: mscale(8),
  },
  textInput: {
    flex: 1,
    fontFamily: "Inter-Regular",
    fontSize: mscale(18),
    color: "#333",
    minHeight: hscale(80),
    outlineStyle: "none",
  },

  imagePreviewContainer: {
    marginTop: hscale(16),
    position: "relative",
    alignSelf: "flex-start",
  },
  imagePreview: {
    width: wscale(200),
    height: hscale(200),
    borderRadius: mscale(12),
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  removeImageBtn: {
    position: "absolute",
    top: hscale(8),
    right: wscale(8),
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: mscale(16),
    padding: mscale(4),
  },

  pollContainer: {
    marginTop: hscale(16),
    borderWidth: 1,
    borderColor: "#EAE6F0",
    borderRadius: mscale(12),
    padding: mscale(16),
    backgroundColor: "#FCFCFE",
  },
  pollHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hscale(12),
  },
  pollTitle: {
    fontFamily: "Inter-SemiBold",
    fontSize: mscale(14),
    color: "#301934",
  },
  pollInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EAE6F0",
    borderRadius: mscale(8),
    marginBottom: hscale(12),
    paddingHorizontal: wscale(12),
    backgroundColor: "#fff",
  },
  pollInput: {
    flex: 1,
    fontFamily: "Inter-Regular",
    fontSize: mscale(14),
    color: "#333",
    paddingVertical: hscale(12),
    outlineStyle: "none",
  },
  pollCount: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(11),
    color: "#999",
  },
  addPollBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: hscale(4),
    gap: wscale(4),
  },
  addPollText: {
    fontFamily: "Inter-Medium",
    fontSize: mscale(14),
    color: "#5E17EB",
  },

  bottomBar: { backgroundColor: "#FCFCFE" },
  replyPermissionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wscale(20),
    paddingBottom: hscale(12),
    gap: wscale(6),
  },
  replyPermissionText: {
    fontFamily: "Inter-Medium",
    fontSize: mscale(13),
    color: "#4A148C",
  },
  divider: { height: 1, backgroundColor: "#F0EEF5", width: "100%" },
  toolsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wscale(16),
    paddingVertical: hscale(12),
  },
  iconGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: wscale(16),
  },
  toolBtn: { padding: mscale(4) },
  rightTools: {
    flexDirection: "row",
    alignItems: "center",
    gap: wscale(12),
  },
  progressRing: {
    width: wscale(20),
    height: wscale(20),
    borderRadius: wscale(10),
    borderWidth: 2,
    borderColor: "#4A148C",
  },
  verticalDivider: {
    width: 1,
    height: hscale(20),
    backgroundColor: "#E0E0E0",
  },
  addBtn: {
    width: wscale(28),
    height: wscale(28),
    borderRadius: wscale(14),
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownMenu: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: mscale(16),
    padding: mscale(16),
    maxHeight: "60%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  dropdownTitle: {
    fontFamily: "Inter-SemiBold",
    fontSize: mscale(16),
    color: "#301934",
    marginBottom: hscale(12),
    textAlign: "center",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: hscale(12),
    paddingHorizontal: wscale(12),
    borderRadius: mscale(8),
  },
  dropdownItemSelected: { backgroundColor: "#F3E8F5" },
  dropdownItemText: {
    fontFamily: "Inter-Medium",
    fontSize: mscale(15),
    color: "#333",
  },
  dropdownItemTextSelected: {
    color: "#5E17EB",
    fontFamily: "Inter-SemiBold",
  },
});
