import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import {
  StyleSheet,
  Text,
  View,
  Linking,
  Alert,
  Platform,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useState, useEffect } from "react";
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import ToastManager, { Toast } from "toastify-react-native";
import { useQuery } from "@tanstack/react-query";

import { colors } from "../constants/theme";
import { hscale, mscale, wscale } from "../helpers/metric";
import { useAuthStore } from "../stores/authStore";
import { AUTH_API_CLIENT } from "../api/apiClient";
import { getUserSubscriptionStatus } from "../api/queries";
import LoadingView from "./loadingView";
import ErrorModal from "./errorModal";
import Profile from "../screens/Drawer/Profile";
import Complaints from "../screens/Drawer/Complaints";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type OpenSection = "profile" | "support" | null;

export default function CustomDrawer(props: DrawerContentComponentProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [openSection, setOpenSection] = useState<OpenSection>(null);
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");

  const { section } = useLocalSearchParams<{ section?: string }>();

  // Auto-open section if navigated with ?section=support
  useEffect(() => {
    if (section === "support") {
      setOpenSection("support");
    }
  }, [section]);

  const authUser = useAuthStore((state) => state.user);

  // Fetch Premium Status
  const { data: isPremium } = useQuery({
    queryKey: ["userSubscriptionStatus"],
    queryFn: getUserSubscriptionStatus,
  });

  // Load real user name from AsyncStorage on mount (handles cold-start where
  // authStore may still be null if the app hasn't rehydrated yet)
  useEffect(() => {
    const loadUser = async () => {
      // Prefer live store value
      if (authUser?.profile?.fullName) {
        setDisplayName(authUser.profile.fullName);
        return;
      }
      // Fallback: read directly from storage
      try {
        const raw = await AsyncStorage.getItem("User");
        if (raw) {
          const parsed = JSON.parse(raw);
          const name = parsed?.profile?.fullName ?? "";
          setDisplayName(name);
          // Rehydrate store so other components get it too
          useAuthStore.setState((s) => ({ ...s, user: parsed }));
        }
      } catch {}
    };

    // Also load saved profile image
    const loadImage = async () => {
      try {
        const saved = await AsyncStorage.getItem("profileImageUri");
        if (saved) {
          setProfileImageUri(saved);
          
          // Inject into global store so the rest of the app gets it immediately
          const currentUser = useAuthStore.getState().user;
          if (currentUser && currentUser.profile.profilePic !== saved) {
            const updatedUser = {
              ...currentUser,
              profile: {
                ...currentUser.profile,
                profilePic: saved,
                avatar: saved
              }
            };
            useAuthStore.setState((s) => ({ ...s, user: updatedUser }));
            AsyncStorage.setItem("User", JSON.stringify(updatedUser));
          }
        } else if (authUser?.profile?.profilePic || authUser?.profile?.avatar) {
          setProfileImageUri(authUser.profile.profilePic || authUser.profile.avatar);
        }
      } catch {}
    };

    loadUser();
    loadImage();
  }, [authUser]);

  useEffect(() => {
    if (authUser?.profile?.profilePic || authUser?.profile?.avatar) {
      setProfileImageUri(prev => prev || authUser.profile.profilePic || authUser.profile.avatar);
    }
  }, [authUser]);

  const nameParts = displayName.trim().split(" ");
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts[1] ?? "";
  const initials = ((firstName[0] ?? "") + (lastName[0] ?? "")).toUpperCase();

  const handlePickProfileImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission required", "Please allow access to your photo library.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        setIsLoading(true);
        const uri = result.assets[0].uri;
        
        try {
          const formData = new FormData();
          let filename = uri.split("/").pop() ?? "profile.jpg";
          if (!filename.includes(".")) filename += ".jpg";
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : `image/jpeg`;

          formData.append("profilePic", {
            uri,
            name: filename,
            type,
          } as any);

          const res = await AUTH_API_CLIENT.patch("/users", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          if (res.status === 200 || res.status === 201) {
            const remoteUri = res.data?.data?.profilePic ?? res.data?.profilePic ?? uri;
            setProfileImageUri(remoteUri);
            await AsyncStorage.setItem("profileImageUri", remoteUri);
            
            // Instantly update the main app state so it reflects everywhere
            const cachedUser = await AsyncStorage.getItem("User");
            const user = cachedUser ? JSON.parse(cachedUser) : useAuthStore.getState().user;
            const updatedUser = { 
              ...user, 
              profile: { 
                ...user?.profile, 
                profilePic: remoteUri,
                avatar: remoteUri 
              } 
            };
            
            useAuthStore.setState((state) => ({ ...state, user: updatedUser }));
            await AsyncStorage.setItem("User", JSON.stringify(updatedUser));
            
            Toast.success("Profile picture updated!");
          } else {
             Toast.error("Failed to update profile picture on server.");
          }
        } catch (err: any) {
           console.log("Upload error:", err?.response?.data || err?.message);
           Toast.error("Error uploading profile picture.");
        } finally {
           setIsLoading(false);
        }
      }
    } catch {
      Toast.error("Could not open photo library. Try again.");
    }
  };

  const toggleSection = (section: OpenSection) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenSection((prev) => (prev === section ? null : section));
  };

  const handleSocialIconPressed = async (icon: "tw" | "ig" | "fb" | "tt") => {
    try {
      const urls: Record<string, string> = {
        tw: "https://x.com/solva_africa?t=GTrgJcb-uy8BOkJ94_3cfw&s=09",
        fb: "https://www.facebook.com/profile.php?id=61562756354347",
        ig: "https://www.instagram.com/solva_africa?igsh=eGF1eW1rYWx0bWxy",
        tt: "https://www.tiktok.com/@solva_africa?_r=1&_t=ZS-95hGDaQFWND",
      };
      await Linking.openURL(urls[icon]);
    } catch {
      setErrorMessage("Error opening social link");
      setErrorVisible(true);
    }
  };

  const logoutUser = async () => {
    try {
      setIsLoading(true);
      await AsyncStorage.removeItem("User");
      if (Platform.OS === "web") {
        window.location.replace("/");
        return;
      }
      useAuthStore.setState((curr) => ({ ...curr, user: null }));
      router.replace("/(auth)/login");
    } catch {
      setErrorMessage("Sorry, could not log you out. Try again.");
      setErrorVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to logout?")) void logoutUser();
      return;
    }
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Yes", onPress: () => void logoutUser() },
      { text: "No" },
    ]);
  };

  return (
    <DrawerContentScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Avatar Section ── */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarRing}>
          {/* Show profile photo if set, otherwise show initials */}
          {profileImageUri ? (
            <Image
              source={{ uri: profileImageUri }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatarInner}>
              <Text style={styles.avatarInitials}>{initials || "?"}</Text>
            </View>
          )}
          {/* Pencil — opens image picker to upload profile picture */}
          <TouchableOpacity
            style={styles.editBtn}
            activeOpacity={0.8}
            onPress={handlePickProfileImage}
          >
            <Ionicons name="pencil" size={mscale(14)} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={styles.userName}>
          {displayName || "Loading..."}
        </Text>

        <View style={styles.verifiedRow}>
          <MaterialIcons
            name="verified"
            size={mscale(16)}
            color={isPremium ? "#F5A623" : colors.primary}
          />
          <Text style={[styles.verifiedText, isPremium && { color: "#F5A623", fontFamily: "Inter-SemiBold" }]}>
            {isPremium ? "Premium Solva" : "Verified Solva"}
          </Text>
        </View>
      </View>

      {/* ── Menu Items ── */}
      <View style={styles.menuContainer}>
        {/* Profile Row */}
        <TouchableOpacity
          style={styles.menuRow}
          activeOpacity={0.7}
          onPress={() => toggleSection("profile")}
        >
          <View style={styles.menuIconBox}>
            <Ionicons
              name="person-outline"
              size={mscale(20)}
              color={colors.primary}
            />
          </View>
          <Text style={styles.menuLabel}>Profile</Text>
          <Ionicons
            name={openSection === "profile" ? "chevron-down" : "chevron-forward"}
            size={mscale(18)}
            color={colors.primary}
          />
        </TouchableOpacity>

        {/* Profile expanded form */}
        {openSection === "profile" && (
          <View style={styles.expandedSection}>
            <Profile />
          </View>
        )}

        <View style={styles.divider} />

        {/* Support Row */}
        <TouchableOpacity
          style={styles.menuRow}
          activeOpacity={0.7}
          onPress={() => toggleSection("support")}
        >
          <View style={styles.menuIconBox}>
            <Ionicons
              name="help-circle-outline"
              size={mscale(20)}
              color={colors.primary}
            />
          </View>
          <Text style={styles.menuLabel}>Support</Text>
          <Ionicons
            name={openSection === "support" ? "chevron-down" : "chevron-forward"}
            size={mscale(18)}
            color={colors.primary}
          />
        </TouchableOpacity>

        {/* Support / Complaints expanded */}
        {openSection === "support" && (
          <View style={styles.expandedSection}>
            <Complaints />
          </View>
        )}
      </View>

      {/* ── Logout Button ── */}
      <TouchableOpacity
        style={styles.logoutBtn}
        activeOpacity={0.8}
        onPress={handleLogout}
      >
        <MaterialIcons
          name="logout"
          size={mscale(18)}
          color={colors.primary}
          style={{ marginRight: wscale(8) }}
        />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* ── Connect With Us ── */}
      <View style={styles.socialSection}>
        <Text style={styles.connectLabel}>CONNECT WITH US</Text>
        <View style={styles.socialRow}>
          <TouchableOpacity
            style={styles.socialCircle}
            activeOpacity={0.8}
            onPress={() => handleSocialIconPressed("tw")}
          >
            <FontAwesome name="twitter" size={mscale(18)} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialCircle}
            activeOpacity={0.8}
            onPress={() => handleSocialIconPressed("fb")}
          >
            <FontAwesome name="facebook" size={mscale(18)} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialCircle}
            activeOpacity={0.8}
            onPress={() => handleSocialIconPressed("ig")}
          >
            <FontAwesome name="instagram" size={mscale(18)} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialCircle}
            activeOpacity={0.8}
            onPress={() => handleSocialIconPressed("tt")}
          >
            <FontAwesome5 name="tiktok" size={mscale(16)} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <LoadingView isLoading={isLoading} />
      <ErrorModal
        visible={errorVisible}
        message={errorMessage}
        onClose={() => setErrorVisible(false)}
      />
      <ToastManager />
    </DrawerContentScrollView>
  );
}

const AVATAR_SIZE = wscale(100);
const RING_SIZE = AVATAR_SIZE + wscale(16);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  contentContainer: {
    paddingBottom: hscale(40),
    alignItems: "center",
  },

  // ── Avatar ──
  avatarSection: {
    alignItems: "center",
    paddingTop: hscale(48),
    paddingBottom: hscale(40),
    width: "100%",
  },
  avatarRing: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 3,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hscale(16),
  },
  avatarInner: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "#E8D5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarInitials: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(30),
    color: colors.primary,
  },
  editBtn: {
    position: "absolute",
    bottom: wscale(4),
    right: wscale(4),
    width: wscale(28),
    height: wscale(28),
    borderRadius: wscale(14),
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  userName: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(22),
    color: "#0D0D26",
    marginBottom: hscale(6),
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wscale(4),
  },
  verifiedText: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(13),
    color: "#555",
  },

  // ── Menu ──
  menuContainer: {
    width: "88%",
    marginBottom: hscale(28),
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hscale(18),
  },
  menuIconBox: {
    width: wscale(42),
    height: wscale(42),
    borderRadius: mscale(10),
    backgroundColor: "#F0E8FA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: wscale(16),
  },
  menuLabel: {
    flex: 1,
    fontFamily: "Inter-Medium",
    fontSize: mscale(15),
    color: "#1A171C",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E0E0E0",
    marginLeft: wscale(58),
  },
  expandedSection: {
    paddingBottom: hscale(16),
    paddingHorizontal: wscale(4),
  },

  // ── Logout ──
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "88%",
    paddingVertical: hscale(20),
    borderRadius: mscale(16),
    backgroundColor: "#FDE8F0",
    marginBottom: hscale(40),
  },
  logoutText: {
    fontFamily: "Inter-SemiBold",
    fontSize: mscale(15),
    color: colors.primary,
  },

  // ── Social ──
  socialSection: {
    alignItems: "center",
    width: "88%",
  },
  connectLabel: {
    fontFamily: "Inter-SemiBold",
    fontSize: mscale(11),
    color: "#AAAAAA",
    letterSpacing: 1.2,
    marginBottom: hscale(16),
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: wscale(16),
  },
  socialCircle: {
    width: wscale(48),
    height: wscale(48),
    borderRadius: wscale(24),
    backgroundColor: "#EDE8FA",
    alignItems: "center",
    justifyContent: "center",
  },
});
