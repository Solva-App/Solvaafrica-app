import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  Linking,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { useRouter, useNavigation, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { globalStyles } from "@/src/styles/global";
import { hscale, mscale, wscale } from "@/src/helpers/metric";
import { colors } from "@/src/constants/theme";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Carousel from "pinar";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { AUTH_API_CLIENT } from "@/src/api/apiClient";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/src/stores/authStore";
import {
  getFreelancerId,
  getFreelancerProfileState,
  mergeAuthUserProfile,
} from "@/src/helpers/freelancerProfile";

const createNoCacheRequestConfig = () => ({
  params: { _ts: Date.now() },
});

const normalizePhone = (value?: string | null) =>
  String(value ?? "").replace(/\D/g, "");

const normalizeText = (value?: string | null) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

export default function ServiceProfile() {
  const navigation = useNavigation();
  const router = useRouter();
  const authUser = useAuthStore((state) => state.user);

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const { freelancerId, hasFreelancerProfile } =
    getFreelancerProfileState(authUser);

  const userId = String(authUser?.profile?.userID ?? "");
  const userPhone = normalizePhone(authUser?.profile?.phone);
  const userEmail = normalizeText(authUser?.profile?.email);
  const userName = normalizeText(authUser?.profile?.fullName);
  const userRole = authUser?.profile?.role;

  const persistResolvedFreelancer = useCallback(
    async (freelancerProfile: any) => {
      const currentUser = useAuthStore.getState().user;
      const resolvedFreelancerId = getFreelancerId(freelancerProfile?.id);
      const currentFreelancerId = getFreelancerId(
        currentUser?.profile?.freelancerId ??
          currentUser?.profile?.freelancer ??
          currentUser?.profile?.freelancerProfile ??
          currentUser?.profile?.freelancerProfileId,
      );

      if (!currentUser || !resolvedFreelancerId) {
        return freelancerProfile ?? null;
      }

      if (
        currentFreelancerId &&
        String(currentFreelancerId) === String(resolvedFreelancerId) &&
        currentUser?.profile?.hasServiceProfile
      ) {
        return freelancerProfile;
      }

      const updatedUser = mergeAuthUserProfile(currentUser, {
        role: "freelancer",
        freelancer: resolvedFreelancerId,
        freelancerId: resolvedFreelancerId,
        freelancerProfile: resolvedFreelancerId,
        freelancerProfileId: resolvedFreelancerId,
        hasServiceProfile: true,
      });

      useAuthStore.setState({ user: updatedUser });
      await AsyncStorage.setItem("User", JSON.stringify(updatedUser));

      return freelancerProfile;
    },
    [],
  );

  const findOwnFreelancerProfile = useCallback(async () => {
    if (!userId) {
      return null;
    }

    const response = await AUTH_API_CLIENT.get(
      "/freelancers",
      createNoCacheRequestConfig(),
    );

    if (response.status !== 200) {
      return null;
    }

    const freelancers = Array.isArray(response.data?.data)
      ? response.data.data
      : [];

    const ownerMatch = freelancers.find(
      (current: any) => String(current?.owner ?? "") === userId,
    );

    const matchedFreelancer =
      ownerMatch ||
      freelancers.find((current: any) =>
        Boolean(
          userPhone &&
          normalizePhone(current?.phoneNumber ?? current?.phone) === userPhone,
        ),
      ) ||
      freelancers.find((current: any) =>
        Boolean(
          userEmail &&
          normalizeText(current?.email ?? current?.user?.email) === userEmail,
        ),
      ) ||
      freelancers.find((current: any) =>
        Boolean(userName && normalizeText(current?.fullName) === userName),
      );

    if (!matchedFreelancer) {
      return null;
    }

    return persistResolvedFreelancer(matchedFreelancer);
  }, [persistResolvedFreelancer, userEmail, userId, userName, userPhone]);

  const getReviews = useCallback(async (id: string | number) => {
    try {
      setReviewLoading(true);
      const response = await AUTH_API_CLIENT.get(`/freelancers/comment/${id}`);
      if (response.status === 200) {
        setReviews(response.data.data.comments || []);
      } else {
        setReviews([]);
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
      setReviews([]);
    } finally {
      setReviewLoading(false);
    }
  }, []);

  const loadByFreelancerId = useCallback(async (id: string | number) => {
    const response = await AUTH_API_CLIENT.get(
      `/freelancers/${id}`,
      createNoCacheRequestConfig(),
    );

    if (response.status !== 200) {
      return null;
    }

    return response.data?.data?.freelancer ?? response.data?.data ?? null;
  }, []);

  const getFreelancerInfo = useCallback(async () => {
    if (!authUser) {
      setLoading(false);
      setReviewLoading(false);
      setUser(null);
      setReviews([]);
      setErrorMessage("Please sign in to view your service profile.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      let freelancerProfile: any | null = null;

      if (freelancerId) {
        freelancerProfile = await loadByFreelancerId(freelancerId);
      }

      if (
        !freelancerProfile &&
        (hasFreelancerProfile || userRole === "freelancer")
      ) {
        freelancerProfile = await findOwnFreelancerProfile();
      }

      if (!freelancerProfile) {
        setUser(null);
        setReviews([]);
        setReviewLoading(false);

        if (userRole !== "freelancer" && !hasFreelancerProfile) {
          router.replace("/(services)/services-profile/setup-profile");
          return;
        }

        setErrorMessage(
          "We could not load your service profile. Please try again.",
        );
        return;
      }

      setUser(freelancerProfile);
      await getReviews(freelancerProfile.id);
    } catch (error) {
      console.error("Failed to fetch freelancer:", error);
      setUser(null);
      setReviews([]);
      setReviewLoading(false);
      setErrorMessage("Failed to load freelancer profile.");
    } finally {
      setLoading(false);
    }
  }, [
    authUser,
    findOwnFreelancerProfile,
    freelancerId,
    getReviews,
    hasFreelancerProfile,
    loadByFreelancerId,
    router,
    userRole,
  ]);

  console.log(userRole);

  const handleEditProfilePress = () => {
    if (user) {
      router.push({
        pathname: "/(services)/services-profile/edit-profile",
        params: { id: user.id },
      });
    }
  };

  console.log(user);

  useFocusEffect(
    useCallback(() => {
      if (!authUser) {
        setLoading(false);
        return;
      }

      getFreelancerInfo();
    }, [authUser]),
  );

  useLayoutEffect(() => {
    if (!user) return;
    navigation.setOptions({
      title: user.fullName,
      headerRight: () => (
        <Ionicons
          name="create-outline"
          size={24}
          color="black"
          onPress={() =>
            router.navigate({
              pathname: "/(services)/services-profile/edit-profile",
              params: { userData: user },
            })
          }
        />
      ),
    });
  }, [navigation, router, user]);

  if (loading) {
    return (
      <View
        style={[
          globalStyles.screen,
          {
            flexDirection: "column",
            justifyContent: "center",
            gap: mscale(10),
          },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View
        style={[
          globalStyles.screen,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={{ color: colors.primary, fontSize: mscale(16) }}>
          {errorMessage || "No profile found"}
        </Text>
      </View>
    );
  }

  const formatPhone = (raw: string | null | undefined): string => {
    if (!raw) return "";
    let cleaned = String(raw).replace(/[\s\-().]/g, "");
    if (cleaned.startsWith("+")) cleaned = cleaned.slice(1);
    if (cleaned.startsWith("0")) {
      cleaned = "234" + cleaned.slice(1);
    } else if (!cleaned.startsWith("234")) {
      cleaned = "234" + cleaned;
    }
    return cleaned;
  };

  const openWhatsApp = (raw: string | null | undefined) => {
    const phone = formatPhone(raw);
    if (!phone) {
      alert("No WhatsApp number available.");
      return;
    }
    Linking.openURL(`https://wa.me/${phone}`).catch(() =>
      alert("Could not open WhatsApp. Please make sure WhatsApp is installed.")
    );
  };

  console.log(user);

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: "#FDF9FF" }}
      contentContainerStyle={{ paddingHorizontal: wscale(20), paddingBottom: hscale(60) }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Top Header / Edit Button ── */}
      <View style={styles.headerRow}>
        <View /> {/* spacer */}
        <TouchableOpacity onPress={handleEditProfilePress} style={styles.editBtn}>
          <Ionicons name="create-outline" size={20} color={colors.primary} />
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* ── Profile Image & Info ── */}
      <View style={styles.profileHeader}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: user?.profilePic || "https://via.placeholder.com/150" }}
            style={styles.profileImage}
            resizeMode="cover"
          />
          <View style={styles.verifiedBadge}>
            <MaterialCommunityIcons name="check-decagram" size={mscale(24)} color="#C41A66" />
          </View>
        </View>
        <Text style={styles.profileName}>{user.fullName || "Profile"}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={16} color="#888" />
          <Text style={styles.locationText}>{user?.location || "No location set"}</Text>
        </View>
      </View>

      {/* ── About Card ── */}
      <View style={[styles.card, styles.leftBorderedCard]}>
        <View style={styles.cardHeaderRow}>
          <Feather name="user" size={18} color="#6207A0" />
          <Text style={styles.cardTitle}>About</Text>
        </View>
        <Text style={styles.cardBodyText}>
          {user?.bio || "No bio available."}
        </Text>
      </View>

      {/* ── Starting From Card ── */}
      <View style={styles.card}>
        <View style={styles.startingFromHeader}>
          <Text style={styles.startingFromLabel}>STARTING FROM</Text>
          <Ionicons name="cash-outline" size={20} color="#C41A66" />
        </View>
        <Text style={styles.startingFromPrice}>
          NGN {user?.startingAmount || "0"}
        </Text>
        <Text style={styles.startingFromSub}>Per project or consultation</Text>
      </View>

      {/* ── Action Buttons ── */}
      <View style={styles.actionButtonsRow}>
        {user?.phoneNumber && (
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: "#4A007C" }]}
            onPress={() => Linking.openURL(`tel:${formatPhone(user.phoneNumber)}`)}
            activeOpacity={0.85}
          >
            <Feather name="phone-call" size={16} color="#FFF" />
            <Text style={styles.actionBtnText}>Call Now</Text>
          </TouchableOpacity>
        )}
        
        {user?.whatsappLink && (
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: "#1CD05D" }]}
            onPress={() => openWhatsApp(user.whatsappLink)}
            activeOpacity={0.85}
          >
            <FontAwesome6 name="whatsapp" size={18} color="#FFF" />
            <Text style={styles.actionBtnText}>WhatsApp</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── My Portfolio ── */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>My Portfolio</Text>
          {/* <Text style={styles.sectionSubtitlePink}>14 Projects</Text> */}
        </View>
        
        <TouchableOpacity 
          style={styles.portfolioDashedCard}
          onPress={() => user?.portfolioLink && Linking.openURL(user.portfolioLink)}
          disabled={!user?.portfolioLink}
          activeOpacity={0.7}
        >
          <View style={styles.portfolioIconCircle}>
            <Feather name="link-2" size={20} color="#C41A66" />
          </View>
          <Text style={styles.portfolioLinkText}>
            {user?.portfolioLink ? "Click link to view portfolio" : "No portfolio link provided"}
          </Text>
          <Text style={styles.portfolioSubText}>
            Behance • Dribbble • Personal Site
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Reviews ── */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>
          Reviews <Text style={styles.reviewStar}>★ 4.9</Text>
        </Text>

        {reviewLoading ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 20 }} />
        ) : reviews.length > 0 ? (
          reviews.map((review, index) => (
            <View key={review.id || index} style={[styles.card, styles.reviewCard]}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewAvatar}>
                  <Feather name="user" size={16} color="#333" />
                </View>
                <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={styles.reviewName}>{review?.name}</Text>
                  <Text style={styles.reviewTime}>2 days ago</Text>
                </View>
              </View>
              <Text style={styles.reviewText}>
                "{review?.message}"
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noReviewsText}>No reviews yet.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: hscale(16),
    marginBottom: hscale(8),
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5E6FB",
    paddingHorizontal: wscale(12),
    paddingVertical: hscale(6),
    borderRadius: mscale(16),
    gap: 4,
  },
  editBtnText: {
    fontFamily: "Inter-Medium",
    color: colors.primary,
    fontSize: mscale(13),
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: hscale(24),
  },
  imageContainer: {
    position: "relative",
    marginBottom: hscale(16),
  },
  profileImage: {
    width: wscale(140),
    height: wscale(140),
    borderRadius: mscale(24),
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -8,
    right: -8,
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 2,
  },
  profileName: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(24),
    color: "#3D006E",
    marginBottom: hscale(6),
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontFamily: "Inter-Medium",
    fontSize: mscale(14),
    color: "#555",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: mscale(16),
    padding: mscale(20),
    marginBottom: hscale(16),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  leftBorderedCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#C41A66",
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wscale(8),
    marginBottom: hscale(12),
  },
  cardTitle: {
    fontFamily: "Inter-SemiBold",
    fontSize: mscale(18),
    color: "#3D006E",
  },
  cardBodyText: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(14),
    color: "#555",
    lineHeight: mscale(22),
  },
  startingFromHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hscale(8),
  },
  startingFromLabel: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(11),
    color: "#666",
    letterSpacing: 1,
  },
  startingFromPrice: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(28),
    color: "#3D006E",
    marginBottom: hscale(4),
  },
  startingFromSub: {
    fontFamily: "Inter-Medium",
    fontSize: mscale(12),
    color: "#888",
  },
  actionButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: wscale(12),
    marginBottom: hscale(32),
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hscale(16),
    borderRadius: mscale(12),
    gap: wscale(8),
  },
  actionBtnText: {
    fontFamily: "Inter-SemiBold",
    fontSize: mscale(15),
    color: "#FFFFFF",
  },
  sectionContainer: {
    marginBottom: hscale(24),
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hscale(16),
  },
  sectionTitle: {
    fontFamily: "Inter-SemiBold",
    fontSize: mscale(20),
    color: "#3D006E",
    marginBottom: hscale(16),
  },
  sectionSubtitlePink: {
    fontFamily: "Inter-SemiBold",
    fontSize: mscale(13),
    color: "#C41A66",
  },
  portfolioDashedCard: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#E2CFEA",
    backgroundColor: "#FDF9FF",
    borderRadius: mscale(16),
    padding: mscale(24),
    alignItems: "center",
    justifyContent: "center",
  },
  portfolioIconCircle: {
    width: wscale(48),
    height: wscale(48),
    borderRadius: mscale(24),
    backgroundColor: "#FCE8F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hscale(16),
  },
  portfolioLinkText: {
    fontFamily: "Inter-SemiBold",
    fontSize: mscale(15),
    color: "#3D006E",
    marginBottom: hscale(8),
  },
  portfolioSubText: {
    fontFamily: "Inter-Medium",
    fontSize: mscale(12),
    color: "#888",
  },
  reviewStar: {
    color: "#C41A66",
    fontSize: mscale(16),
  },
  reviewCard: {
    backgroundColor: "#F9F5FB",
    borderLeftWidth: 4,
    borderLeftColor: "#C41A66",
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: wscale(12),
    marginBottom: hscale(12),
  },
  reviewAvatar: {
    width: wscale(36),
    height: wscale(36),
    borderRadius: mscale(18),
    backgroundColor: "#E8DDF0",
    alignItems: "center",
    justifyContent: "center",
  },
  reviewName: {
    fontFamily: "Inter-SemiBold",
    fontSize: mscale(14),
    color: "#3D006E",
  },
  reviewTime: {
    fontFamily: "Inter-Medium",
    fontSize: mscale(11),
    color: "#888",
  },
  reviewText: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(14),
    color: "#444",
    lineHeight: mscale(22),
  },
  noReviewsText: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(14),
    color: "#888",
  },
});
