import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { hscale, mscale, wscale } from "@/src/helpers/metric";
import { colors } from "@/src/constants/theme";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/src/stores/authStore";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function ServicesScreen() {
  const router = useRouter();
  const authUser = useAuthStore((state) => state.user);

  const handleNavExplore = () => {
    router.push("/(services)/find-service");
  };

  if (!authUser) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const categories = [
    { id: 1, name: "Design", icon: <MaterialCommunityIcons name="palette-outline" size={24} color={colors.primary} /> },
    { id: 2, name: "Development", icon: <Feather name="code" size={24} color={colors.primary} /> },
    { id: 3, name: "Writing", icon: <MaterialCommunityIcons name="pencil-box-outline" size={24} color={colors.primary} /> },
    { id: 4, name: "Marketing", icon: <MaterialCommunityIcons name="bullhorn-outline" size={24} color={colors.primary} /> },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: hscale(40) }}>
        
        {/* ── Hero Banner Area ── */}
        <View style={styles.bannerContainer}>
          <Image
            source={require("@/assets/images/services/serviceBg.png")}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          {/* Bottom gradient/overlay could go here if needed, but keeping it clean for now */}
        </View>

        {/* ── Explore Button (Overlapping Banner) ── */}
        <View style={styles.exploreBtnContainer}>
          <TouchableOpacity style={styles.exploreBtn} onPress={handleNavExplore} activeOpacity={0.9}>
            <Text style={styles.exploreBtnText}>Explore our services</Text>
            <Feather name="arrow-right" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>

        {/* ── Find / Sell Service Cards ── */}
        <View style={styles.cardsRow}>
          {/* Find a service */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(services)/find-service")}
            activeOpacity={0.9}
          >
            <View style={[styles.iconCircle, { backgroundColor: "#F5E6FB" }]}>
              <Feather name="search" size={24} color="#6207A0" />
            </View>
            <Text style={[styles.cardTitle, { color: "#6207A0" }]}>Find a service</Text>
            <Text style={styles.cardSubtitle}>Hire top talent for your projects</Text>
          </TouchableOpacity>

          {/* Sell a service */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(services)/services-profile/service-profile")}
            activeOpacity={0.9}
          >
            <View style={[styles.iconCircle, { backgroundColor: "#FBE6F0" }]}>
              <Ionicons name="storefront-outline" size={24} color="#C41A66" />
            </View>
            <Text style={[styles.cardTitle, { color: "#C41A66" }]}>Sell a service</Text>
            <Text style={styles.cardSubtitle}>Offer your skills and earn</Text>
          </TouchableOpacity>
        </View>

        {/* ── Connect Button ── */}
        <View style={{ paddingHorizontal: wscale(20), marginTop: hscale(24) }}>
          <TouchableOpacity
            style={styles.connectBtn}
            onPress={() => router.push("/(services)/find-service")}
            activeOpacity={0.9}
          >
            <Text style={styles.connectBtnText}>
              Connect with the best service providers around you!
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Popular Categories ── */}
        <View style={styles.categoriesSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Popular Categories</Text>
              <Text style={styles.sectionSubtitle}>Explore top rated services</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          >
            {categories.map((cat) => (
              <TouchableOpacity key={cat.id} style={styles.categoryItem} activeOpacity={0.8}>
                <View style={styles.categoryIconBox}>
                  {cat.icon}
                </View>
                <Text style={styles.categoryName}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    width: "100%",
    height: hscale(320),
    backgroundColor: "#EEE",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  exploreBtnContainer: {
    alignItems: "center",
    marginTop: -hscale(24),
    zIndex: 10,
  },
  exploreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6207A0",
    paddingVertical: hscale(16),
    paddingHorizontal: wscale(32),
    borderRadius: mscale(16),
    width: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  exploreBtnText: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(16),
    color: "#FFFFFF",
  },
  cardsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: wscale(20),
    marginTop: hscale(24),
    gap: wscale(16),
  },
  actionCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: mscale(20),
    paddingVertical: hscale(24),
    paddingHorizontal: wscale(16),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F5F5F5",
  },
  iconCircle: {
    width: wscale(64),
    height: wscale(64),
    borderRadius: mscale(20),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hscale(16),
  },
  cardTitle: {
    fontFamily: "Inter-Medium",
    fontSize: mscale(16),
    textAlign: "center",
    marginBottom: hscale(8),
  },
  cardSubtitle: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(12),
    color: "#5C5F62",
    textAlign: "center",
    lineHeight: mscale(18),
  },
  connectBtn: {
    backgroundColor: "#6207A0",
    borderRadius: mscale(28),
    paddingVertical: hscale(20),
    paddingHorizontal: wscale(24),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6207A0",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  connectBtnText: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(16),
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: mscale(24),
  },
  categoriesSection: {
    marginTop: hscale(48),
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: wscale(20),
    marginBottom: hscale(20),
  },
  sectionTitle: {
    fontFamily: "Inter-Medium",
    fontSize: mscale(22),
    color: "#6207A0",
    marginBottom: hscale(4),
  },
  sectionSubtitle: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(14),
    color: "#555",
  },
  seeAllText: {
    fontFamily: "Inter-Medium",
    fontSize: mscale(14),
    color: "#C41A66",
    marginBottom: 2,
  },
  categoriesList: {
    paddingHorizontal: wscale(20),
    gap: wscale(16),
  },
  categoryItem: {
    alignItems: "center",
    width: wscale(80),
  },
  categoryIconBox: {
    width: wscale(72),
    height: wscale(72),
    borderRadius: mscale(20),
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#EAEAEA",
    marginBottom: hscale(12),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  categoryName: {
    fontFamily: "Inter-Medium",
    fontSize: mscale(13),
    color: "#1A1A2E",
    textAlign: "center",
  },
});