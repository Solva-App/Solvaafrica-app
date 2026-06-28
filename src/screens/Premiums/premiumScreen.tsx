import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useRouter, Href } from "expo-router";
import LeftIcon from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";

import { globalStyles } from "../../styles/global";
import { hscale, mscale, wscale } from "../../helpers/metric";
import ProtectPage from "@/src/components/protectPage";
import { colors } from "../../constants/theme";

// Types
type PremiumRoute = "/upload" | "/scholarship" | "/courses-certificate" | "/task";

interface PremiumCardData {
  id: string;
  title: string;
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  descText: React.ReactNode;
  btnText: string;
  route: PremiumRoute;
}

export default function PremiumScreen() {
  const router = useRouter();

  // The highlight color used for text and borders
  const highlightColor = "#D81B60"; // Pinkish magenta from the design

  // Highlight Text Component for the italic description boxes
  const Highlight = ({ children }: { children: React.ReactNode }) => (
    <Text style={[styles.descHighlight, { color: highlightColor }]}>{children}</Text>
  );

  const premiumData: PremiumCardData[] = [
    {
      id: "1",
      title: "UPLOAD STUDY MATERIALS\n(EARN)",
      iconName: "file-document-multiple-outline",
      descText: (
        <Text style={styles.descText}>
          I.e: Make <Highlight>N200</Highlight> per Past Question upload; Make <Highlight>N2,000</Highlight> per Project upload.
        </Text>
      ),
      btnText: "Submit Material",
      route: "/upload",
    },
    {
      id: "2",
      title: "SCHOLARSHIP & GRANT\nINFORMATION",
      iconName: "school-outline",
      descText: (
        <Text style={styles.descText}>
          I.e: Access direct, curated financial aid opportunities to fund your education.
        </Text>
      ),
      btnText: "Browse Offers",
      route: "/scholarship",
    },
    {
      id: "3",
      title: "GET CERTIFIED ON SHORT\nCOURSES",
      iconName: "medal-outline",
      descText: (
        <Text style={styles.descText}>
          I.e: Get certified for <Highlight>FREE</Highlight> or a heavily student-discounted amount.
        </Text>
      ),
      btnText: "View Courses",
      route: "/courses-certificate",
    },
    {
      id: "4",
      title: "PREMIUM TASKS &\nCAMPAIGNS",
      iconName: "bullhorn-outline",
      descText: (
        <Text style={styles.descText}>
          Flyer Share (WhatsApp/Insta/TikTok): <Highlight>N1,000 - N2,000+</Highlight>
          {"\n\n"}
          Video Content for Brands: <Highlight>N10,000-N20,000+</Highlight>
        </Text>
      ),
      btnText: "Find Gigs",
      route: "/task",
    },
  ];

  const handlePress = (route: PremiumRoute) => {
    router.push(route as Href);
  };

  return (
    <ProtectPage>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            hitSlop={8}
          >
            <LeftIcon name="arrow-back" size={mscale(24)} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Premium</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Purple Gradient Banner */}
          <LinearGradient
            colors={["#5E17EB", "#8A2387"]} // Deep purple to magenta gradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.banner}
          >
            <Text style={styles.bannerTitle}>Unlock Potential</Text>
            <Text style={styles.bannerSubtitle}>
              Access exclusive academic and financial opportunities tailored for you.
            </Text>
          </LinearGradient>

          {/* Cards */}
          <View style={styles.cardsContainer}>
            {premiumData.map((item) => (
              <View
                key={item.id}
                style={[styles.card, { borderColor: highlightColor }]}
              >
                {/* Top: Icon + Title */}
                <View style={styles.cardTop}>
                  <View style={styles.iconBox}>
                    <MaterialCommunityIcons
                      name={item.iconName}
                      size={mscale(24)}
                      color={highlightColor}
                    />
                  </View>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                </View>

                {/* Middle: Italic Description Box */}
                <View style={styles.descBox}>{item.descText}</View>

                {/* Bottom: Button */}
                <View style={styles.cardBottom}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handlePress(item.route)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.actionBtnText}>{item.btnText}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </ProtectPage>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA", // Light background matching Figma
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wscale(20),
    paddingTop: Platform.OS === "ios" ? hscale(50) : hscale(20),
    paddingBottom: hscale(16),
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: "Inter-SemiBold",
    fontSize: mscale(18),
    color: colors.primary, // Dark purple
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

  // ── Banner ──
  banner: {
    borderRadius: mscale(16),
    padding: mscale(24),
    marginBottom: hscale(24),
    shadowColor: "#5E17EB",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  bannerTitle: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(22),
    color: "#ffffff",
    marginBottom: hscale(8),
  },
  bannerSubtitle: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(13),
    color: "rgba(255, 255, 255, 0.85)",
    lineHeight: mscale(18),
  },

  // ── Cards ──
  cardsContainer: {
    gap: hscale(20),
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: mscale(12),
    borderWidth: 1.5,
    padding: mscale(16),
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hscale(16),
  },
  iconBox: {
    width: wscale(48),
    height: wscale(48),
    borderRadius: mscale(12),
    backgroundColor: "#F3E8F5", // Pale pink/purple matching the icon
    alignItems: "center",
    justifyContent: "center",
    marginRight: wscale(16),
  },
  cardTitle: {
    flex: 1,
    fontFamily: "Inter-Bold",
    fontSize: mscale(14),
    color: "#301962", // Deep purple
    textTransform: "uppercase",
    lineHeight: mscale(20),
  },
  descBox: {
    backgroundColor: "#F8F8FC",
    borderRadius: mscale(8),
    padding: mscale(14),
    marginBottom: hscale(16),
  },
  descText: {
    fontFamily: "Inter-Regular",
    fontStyle: "italic",
    fontSize: mscale(13),
    color: "#555",
    lineHeight: mscale(20),
  },
  descHighlight: {
    fontFamily: "Inter-SemiBold",
    fontStyle: "italic",
  },
  cardBottom: {
    alignItems: "flex-end", // Align button to the right
  },
  actionBtn: {
    backgroundColor: "#4A00E0", // Dark purple button
    paddingVertical: hscale(12),
    paddingHorizontal: wscale(24),
    borderRadius: mscale(8),
  },
  actionBtnText: {
    fontFamily: "Inter-Medium",
    fontSize: mscale(13),
    color: "#ffffff",
  },
});
