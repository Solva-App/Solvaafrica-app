import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useCallback, useEffect, useState } from "react";
import StarIcon from "@expo/vector-icons/AntDesign";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import * as Linking from "expo-linking";
import Icon from "@expo/vector-icons/FontAwesome";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";

import { hscale, mscale, wscale } from "../helpers/metric";
import { useAuthStore } from "../stores/authStore";
import { AUTH_API_CLIENT } from "../api/apiClient";
import { globalStyles } from "../styles/global";
import { colors } from "../constants/theme";
import ToastManager, { Toast } from "toastify-react-native";
import { Job } from "../types";
import ErrorModal from "../components/errorModal";
import ProtectPage from "../components/protectPage";

type Tab = "Refer" | "Earn";

function resolveTab(tab: string | string[] | undefined): Tab {
  const selectedTab = Array.isArray(tab) ? tab[0] : tab;
  return selectedTab?.toLowerCase() === "earn" ? "Earn" : "Refer";
}

export default function EarningScreen() {
  const { tab } = useLocalSearchParams<{ tab?: string | string[] }>();
  const [activeTab, setActiveTab] = useState<Tab>(resolveTab(tab));
  const [userBalance, setUserBalance] = useState<null | number>(null);

  const user = useAuthStore((state) => state.user);

  const userID = user?.profile?.userID;
  const userReferralCode = user?.profile?.referralCode;

  useEffect(() => {
    setActiveTab(resolveTab(tab));
  }, [tab]);

  useFocusEffect(
    useCallback(() => {
      if (!userID) return;

      const getUserEarnedBalance = async () => {
        try {
          const response = await AUTH_API_CLIENT.get(
            `/users/balance/${userID}`,
          );
          const { balance } = response.data.data;
          setUserBalance(balance);
        } catch (error) {
          Toast.error("Error fetching user balance");
        }
      };

      getUserEarnedBalance();
    }, [userID]),
  );

  return (
    <View style={[globalStyles.screen, { backgroundColor: "#F0EDF6", paddingHorizontal: wscale(16) }]}>
      <ToastManager />
      <Tabs setActiveTab={setActiveTab} activeTab={activeTab} />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: hscale(32) }}
      >
        {activeTab === "Refer" && <ReferTabView />}
        {activeTab === "Earn" && <EarnTabView userBalance={userBalance} />}
      </ScrollView>
    </View>
  );
}

const EarnTabView = ({ userBalance }: { userBalance: number | null }) => {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getJobs = async () => {
      try {
        setLoading(true);
        const response = await AUTH_API_CLIENT.get("/jobs");
        if (response.status === 200) {
          setJobs(response.data.data);
        }
      } catch (error) {
        setErrorMessage("Something went wrong while fetching jobs!");
        setErrorVisible(true);
      } finally {
        setLoading(false);
      }
    };
    getJobs();
  }, []);

  return (
    <ProtectPage>
      <View>
        <EarningsBalanceView userBalance={userBalance} />

        {/* Job Offers Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Job Offers</Text>
          <TouchableOpacity onPress={() => router.push("/job-offers")}>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: hscale(32) }} />
        ) : (
          <View style={styles.jobList}>
            {(Array.isArray(jobs) ? jobs.slice(0, 5) : []).map((item, index) => (
              <TouchableOpacity
                key={item.id.toString()}
                onPress={() =>
                  router.push({
                    pathname: "/job-details",
                    params: { job: JSON.stringify(item) },
                  })
                }
              >
                <View style={[styles.jobCard, index > 0 && styles.jobCardBorder]}>
                  <View style={styles.jobCardContent}>
                    <Text style={styles.jobTitle}>{item.title}</Text>
                    <View style={styles.jobMeta}>
                      {item.status?.[0] && (
                        <View style={styles.statusBadge}>
                          <Text style={styles.statusText}>{item.status[0]}</Text>
                        </View>
                      )}
                      <View style={styles.jobDateRow}>
                        <Icon name="calendar-o" size={mscale(12)} color="#888" style={{ marginRight: 4 }} />
                        <Text style={styles.jobDate}>
                          {new Date(item.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {/* Arrow button */}
                  <View style={styles.arrowBtn}>
                    <Icon name="chevron-right" size={mscale(14)} color={colors.primary} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            {!loading && jobs.length === 0 && (
              <Text style={styles.emptyText}>No job offers available at the moment.</Text>
            )}
          </View>
        )}

        <ErrorModal
          visible={errorVisible}
          message={errorMessage}
          onClose={() => setErrorVisible(false)}
        />
      </View>
    </ProtectPage>
  );
};

const ReferTabView = () => {
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [referrals, setReferrals] = useState<any[]>([]);
  const AuthUser = useAuthStore((state) => state.user);
  const user = useAuthStore((state) => state.user);

  const userID = user?.profile?.userID;
  const userReferralCode = user?.profile?.referralCode;

  const APP_NAME = "Solva";
  const DEEP_LINK_BASE = "https://www.solvaafrica.com";

  const getReferralLink = () => {
    return `${DEEP_LINK_BASE}/signup?ref=${AuthUser.referralCode}`;
  };

  const handleSocialShare = async (platform: "wa" | "fb" | "tw") => {
    const referralLink = getReferralLink();
    const message = `🎉 Join ${APP_NAME} and start earning! Use my referral code: ${AuthUser.referralCode}\n\nSign up here: ${referralLink}`;

    let url = "";

    switch (platform) {
      case "wa":
        url = `https://wa.me/?text=${encodeURIComponent(message)}`;
        break;

      case "fb":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          referralLink,
        )}&quote=${encodeURIComponent(message)}`;
        break;

      case "tw":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          message,
        )}`;
        break;
    }

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Toast.error("Unable to open share link. Try copying manually.");
      }
    } catch (error) {
      console.error("Social share error:", error);
      Toast.error("Could not open social sharing.");
    }
  };

  useEffect(() => {
    if (!userID) return;

    const getReferrals = async () => {
      try {
        const response = await AUTH_API_CLIENT.get(
          `/users/referrals/${userID}`,
        );
        if (response.status === 200) {
          setReferrals(response.data.data.referralUsers);
        }
      } catch (error) {
        Toast.error("Error fetching user referrals");
      }
    };

    getReferrals();
  }, []);

  return (
    <View style={{ paddingHorizontal: wscale(10) }}>
      {/* how you earn view */}
      <View style={styles.bannerView}>
        <StarIcon name="star" size={20} color={colors.primary} />
        <View style={{ flex: 1, marginLeft: wscale(12) }}>
          <Text
            style={[
              styles.text,
              {
                fontFamily: "Inter-Bold",
                fontSize: mscale(20),
                color: colors.black,
              },
            ]}
          >
            How You Earn
          </Text>
          <View style={{ gap: 2, marginTop: hscale(0) }}>
            <Text style={styles.text}>Subscribe to premium package</Text>
            <Text style={styles.text}>
              People signup with your referral code
            </Text>
            <Text style={styles.text}>
              Referred individual pay for a material
            </Text>
          </View>
        </View>
      </View>

      <Text
        style={[
          styles.text,
          {
            fontSize: mscale(20),
            fontFamily: "Inter-Bold",
            color: colors.black,
            textAlign: "center",
            marginTop: hscale(40),
          },
        ]}
      >
        Get Free NGN 100.00
      </Text>
      <Text
        style={[styles.text, { textAlign: "center", fontSize: mscale(16) }]}
      >
        Share this hack with your friends
      </Text>
      <Text
        style={[
          styles.text,
          { textAlign: "center", marginTop: hscale(20), fontSize: mscale(16) },
        ]}
      >
        You stand to earn NGN 100.00 when your friend input your referral code
        during sign up and registers to the premium package
      </Text>

      {/* Copy referral code view */}
      <CopyReferalCodeView />

      {/* Your Referrals section */}
      <Text
        style={{
          fontFamily: "Inter-Bold",
          fontSize: mscale(20),
          color: colors.black,
          marginTop: hscale(24),
        }}
      >
        Your Referrals
      </Text>

      {referrals.length > 0 ? (
        <FlatList
          data={referrals}
          keyExtractor={(item) => item.id!}
          renderItem={({ item }) => (
            <View
              style={{
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: "#ccc",
              }}
            >
              <Text style={{ fontFamily: "Inter-Bold", fontSize: 16 }}>
                {item.fullName}
              </Text>
              <Text style={{ fontFamily: "Inter-Regular", color: "#555" }}>
                {item.email}
              </Text>
            </View>
          )}
          scrollEnabled={false}
        />
      ) : (
        <>
          <Text
            style={{
              textAlign: "center",
              fontSize: mscale(14),
              color: "#5C5F62",
              width: "80%",
              lineHeight: mscale(20),
              marginTop: hscale(8),
              alignSelf: "center",
            }}
          >
            You currently do not have any referral. Your referrals will appear
            here when you refer friends using your code.
          </Text>

          {/* Empty state image */}
          <View
            style={{
              width: "100%",
              height: hscale(300),
              alignItems: "center",
              marginTop: hscale(16),
            }}
          >
            <Image
              source={require("../../assets/images/Referral.png")}
              style={{ width: 266, height: 283 }}
              contentFit="contain"
            />
          </View>
        </>
      )}

      <Text
        style={{
          fontFamily: "Inter-Bold",
          fontSize: mscale(24),
          color: colors.black,
          marginTop: hscale(40),
          marginBottom: hscale(16),
          textAlign: "center",
        }}
      >
        Share Via
      </Text>

      {/* Social buttons */}
      <View
        style={{
          flexDirection: "row",
          gap: 16,
          marginBottom: hscale(40),
          justifyContent: "center",
        }}
      >
        <SocialButton
          label="WhatsApp"
          referralCode={userReferralCode}
          onPress={() => handleSocialShare("wa")}
        />
        <SocialButton
          label="X"
          referralCode={userReferralCode}
          onPress={() => handleSocialShare("tw")}
        />
        <SocialButton
          label="Facebook"
          referralCode={userReferralCode}
          onPress={() => handleSocialShare("fb")}
        />
      </View>
    </View>
  );
};

const Tabs = ({
  setActiveTab,
  activeTab,
}: {
  setActiveTab: React.Dispatch<React.SetStateAction<Tab>>;
  activeTab: Tab;
}) => {
  return (
    <View style={styles.tabButtonsView}>
      <Pressable
        style={[
          styles.tabPill,
          activeTab === "Refer" && styles.tabPillActive,
        ]}
        onPress={() => setActiveTab("Refer")}
      >
        <Text style={[styles.tabPillText, activeTab === "Refer" && styles.tabPillTextActive]}>
          Refer
        </Text>
      </Pressable>

      <Pressable
        style={[
          styles.tabPill,
          activeTab === "Earn" && styles.tabPillActive,
        ]}
        onPress={() => setActiveTab("Earn")}
      >
        <Text style={[styles.tabPillText, activeTab === "Earn" && styles.tabPillTextActive]}>
          Earn
        </Text>
      </Pressable>
    </View>
  );
};

const CopyReferalCodeView = () => {
  const [copiedCode, setCopiedCode] = useState(false);
  const profile = useAuthStore((state) => state.user?.profile);
  const userReferralCode = profile?.referralCode;

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(userReferralCode);
    setCopiedCode(true);
  };

  useEffect(() => {
    setTimeout(() => {
      setCopiedCode(false);
    }, 3000);
  }, [copiedCode]);

  return (
    <View style={styles.copyReferralCodeView}>
      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.text,
            {
              fontFamily: "Inter-Bold",
              color: colors.black,
              fontSize: mscale(24),
            },
          ]}
        >
          Referral code
        </Text>
        <Text style={{ fontSize: mscale(18), fontFamily: "Inter-Medium" }}>
          {userReferralCode}
        </Text>
      </View>
      <Text style={styles.textButton} onPress={handleCopyCode}>
        {copiedCode ? "Copied" : "Copy"}
      </Text>
    </View>
  );
};

const EarningsBalanceView = ({
  userBalance,
}: {
  userBalance: number | null | any;
}) => {
  const router = useRouter();

  const handleNavigateCashout = () => {
    const balanceString = userBalance ? userBalance.toString() : "0";
    router.push(`/cashout?balance=${balanceString}`);
  };

  return (
    <View style={styles.earningsCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.earningsLabel}>Earnings</Text>
        <Text style={styles.earningsAmount}>
          {userBalance !== null && userBalance !== undefined
            ? `${Number(userBalance).toFixed(2)}`
            : "---"}
          {" "}<Text style={styles.earningsCurrency}>NGN</Text>
        </Text>
        <Text style={styles.earningsMin}>Minimum cashout NGN 1,000</Text>
      </View>
      <TouchableOpacity style={styles.cashoutBtn} onPress={handleNavigateCashout}>
        <Text style={styles.cashoutBtnText}>Cashout</Text>
      </TouchableOpacity>
    </View>
  );
};

const SocialButton = ({
  label,
  referralCode,
  onPress,
}: {
  label: string;
  referralCode: string;
  onPress: () => void;
}) => {
  const iconName =
    label === "WhatsApp" ? "whatsapp" : label === "X" ? "twitter" : "facebook";

  return (
    <Pressable onPress={onPress} style={styles.socialButton}>
      <Icon name={iconName} size={24} color="#000000" />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  // ── Tab pill toggle ──
  tabButtonsView: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    padding: 4,
    marginBottom: hscale(20),
    marginTop: hscale(8),
  },
  tabPill: {
    flex: 1,
    height: hscale(44),
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  tabPillActive: {
    backgroundColor: colors.primary,
  },
  tabPillText: {
    fontFamily: "Inter-SemiBold",
    fontSize: mscale(15),
    color: "#888",
  },
  tabPillTextActive: {
    color: "#FFFFFF",
  },

  // ── Earnings card ──
  earningsCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: mscale(16),
    paddingVertical: hscale(18),
    paddingHorizontal: wscale(20),
    marginBottom: hscale(24),
  },
  earningsLabel: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(13),
    color: "#888",
    marginBottom: hscale(4),
  },
  earningsAmount: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(28),
    color: "#1A1A2E",
    lineHeight: mscale(34),
  },
  earningsCurrency: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(16),
    color: "#555",
  },
  earningsMin: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(11),
    color: "#999",
    marginTop: hscale(4),
  },
  cashoutBtn: {
    backgroundColor: colors.primary,
    borderRadius: mscale(24),
    paddingVertical: hscale(12),
    paddingHorizontal: wscale(20),
  },
  cashoutBtnText: {
    fontFamily: "Inter-SemiBold",
    fontSize: mscale(14),
    color: "#FFFFFF",
  },

  // ── Section header ──
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hscale(12),
  },
  sectionTitle: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(18),
    color: "#1A1A2E",
  },
  viewAll: {
    fontFamily: "Inter-Medium",
    fontSize: mscale(14),
    color: colors.primary,
  },

  // ── Job list ──
  jobList: {
    backgroundColor: "#FFFFFF",
    borderRadius: mscale(16),
    overflow: "hidden",
  },
  jobCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hscale(16),
    paddingHorizontal: wscale(16),
  },
  jobCardBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E8E0F0",
  },
  jobCardContent: {
    flex: 1,
  },
  jobTitle: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(15),
    color: "#1A1A2E",
    marginBottom: hscale(8),
  },
  jobMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  statusBadge: {
    backgroundColor: "#F5E6F8",
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 12,
  },
  statusText: {
    fontFamily: "Inter-Medium",
    fontSize: mscale(12),
    color: colors.primary,
  },
  jobDateRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  jobDate: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(12),
    color: "#888",
  },
  arrowBtn: {
    width: wscale(34),
    height: wscale(34),
    borderRadius: wscale(17),
    backgroundColor: "#F0EDF6",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: wscale(8),
  },
  emptyText: {
    textAlign: "center",
    marginTop: hscale(24),
    fontFamily: "Inter-Regular",
    fontSize: mscale(14),
    color: "#888",
  },

  // ── Shared ──
  text: {
    fontFamily: "Inter-regular",
    fontSize: mscale(16),
    color: "#5C5F62",
  },
  bannerView: {
    backgroundColor: "#F5F3FF",
    marginTop: hscale(20),
    borderRadius: mscale(20),
    flexDirection: "row",
    paddingVertical: mscale(20),
    paddingHorizontal: mscale(20),
    height: hscale(184),
  },
  copyReferralCodeView: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: hscale(18),
    paddingHorizontal: wscale(20),
    borderRadius: mscale(16),
    marginBottom: hscale(24),
  },
  textButton: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(12),
    height: hscale(36),
    backgroundColor: colors.primary,
    paddingHorizontal: wscale(20),
    textAlign: "center",
    lineHeight: hscale(36),
    color: "#ffffff",
    borderRadius: mscale(20),
  },
  socialButton: {
    backgroundColor: colors.white,
    paddingHorizontal: wscale(16),
    paddingVertical: hscale(8),
    borderRadius: mscale(8),
  },
  socialButtonText: {
    color: "#000000",
    fontFamily: "Inter-Bold",
    fontSize: mscale(14),
  },
});
