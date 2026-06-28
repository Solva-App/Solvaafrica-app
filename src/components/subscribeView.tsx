import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Linking,
  Platform,
  ScrollView,
  SafeAreaView
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import LeftIcon from "@expo/vector-icons/Ionicons";
import CheckIcon from "@expo/vector-icons/Feather";
import { useEffect, useState } from "react";

import { AUTH_API_CLIENT } from "../api/apiClient";
import { hscale, mscale, wscale } from "../helpers/metric";
import { colors } from "../constants/theme";
import LoadingView from "./loadingView";
import ErrorModal from "./errorModal";

export default function SubscribeView() {
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const premiumFeatures = [
    {
      title: "Upload PQ/Project (earn money)",
      desc: "I.e: Make N200 per Past Question upload;\nMake N2,000 per Project upload.",
    },
    {
      title: "Grant/Scholarship Information",
      desc: "Access direct, curated financial aid\nopportunities to fund your education.",
    },
    {
      title: "Get Certified on short courses",
      desc: "I.e: Get certified for FREE or a heavily\nstudent-discounted amount.",
    },
    {
      title: "Task (earn money completing a task)",
      desc: "Flyer Share (WhatsApp/Insta/TikTok):\nN1,000 - N2,000+\nVideo Content for Brands: N10,000-\nN20,000+",
    },
  ];

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
      statusBarBackgroundColor: colors.primary,
      statusBarStyle: "light",
      statusBarAnimation: "slide",
    });
  }, []);

  const handleSubscribe = async () => {
    let win: Window | null = null;

    try {
      if (Platform.OS === "web") {
        win = window.open("", "_blank");
        if (win) {
          win.document.write("<p>Redirecting to payment...</p>");
        }
      }

      setIsLoading(true);

      const res = await AUTH_API_CLIENT.get(
        `/sub/Premium/link?callback=https://www.solvaafrica.com`,
      );

      if (res.status === 200) {
        const subLink = res.data.data.authorization_url;
        if (Platform.OS === "web") {
          if (win) {
            win.location.href = subLink;
          } else {
            alert("Please allow popups for this site");
          }
          return;
        }

        await Linking.openURL(subLink);
      }
    } catch (error: any) {
      if (Platform.OS === "web" && win) {
        win.close();
      }

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Subscription failed";

      setErrorMessage(message);
      setErrorVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingView isLoading={isLoading} />;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            hitSlop={8}
          >
            <LeftIcon name="arrow-back" size={mscale(24)} color="#fff" />
          </Pressable>
        </View>

        {/* Title */}
        <Text style={styles.subscribeTitle}>
          Subscribe to unlock all features
        </Text>

        {/* Plan Box */}
        <View style={styles.planBox}>
          <Text style={styles.planName}>Premium</Text>
          <Text style={styles.planPrice}>N999/1month</Text>
        </View>

        {/* Features List */}
        <View style={styles.featuresList}>
          {premiumFeatures.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <CheckIcon
                name="check"
                size={mscale(20)}
                color="#fff"
                style={styles.checkIcon}
              />
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDesc}>{feature.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Spacer to push button to bottom if screen is tall */}
        <View style={styles.spacer} />

        {/* Subscribe Button */}
        <Pressable
          style={({ pressed }) => [
            styles.subscribeButton,
            { opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={handleSubscribe}
        >
          <Text style={styles.subscribeButtonText}>Subscribe</Text>
        </Pressable>
      </ScrollView>

      <ErrorModal
        visible={errorVisible}
        message={errorMessage}
        onClose={() => setErrorVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary, // Dark purple from the design
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wscale(24),
    paddingTop: hscale(20),
    paddingBottom: hscale(40),
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hscale(30),
  },
  backBtn: {
    padding: 4,
  },
  subscribeTitle: {
    fontFamily: "Inter-Medium",
    color: "#ffffff",
    fontSize: mscale(22),
    marginBottom: hscale(30),
  },
  planBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: mscale(12),
    paddingVertical: hscale(20),
    paddingHorizontal: wscale(20),
    marginBottom: hscale(30),
  },
  planName: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(16),
    color: colors.primary,
  },
  planPrice: {
    fontFamily: "Inter-Medium",
    fontSize: mscale(16),
    color: colors.primary,
  },
  featuresList: {
    gap: hscale(24),
    marginBottom: hscale(40),
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  checkIcon: {
    marginTop: hscale(2),
    marginRight: wscale(12),
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontFamily: "Inter-Medium",
    fontSize: mscale(15),
    color: "#ffffff",
    marginBottom: hscale(4),
  },
  featureDesc: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(14),
    fontStyle: "italic",
    color: "#ffffff",
    lineHeight: mscale(20),
    opacity: 0.95,
  },
  spacer: {
    flex: 1,
  },
  subscribeButton: {
    backgroundColor: "#ffffff",
    borderRadius: mscale(30),
    paddingVertical: hscale(18),
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  subscribeButtonText: {
    fontFamily: "Inter-Medium",
    fontSize: mscale(16),
    color: colors.primary,
  },
});
