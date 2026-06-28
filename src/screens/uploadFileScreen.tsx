import { Dimensions, Pressable, Text, View, ScrollView, StyleSheet, Platform, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import LeftIcon from "@expo/vector-icons/Ionicons";
import FeatherIcon from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import ToastManager, { Toast } from "toastify-react-native";

import { colors, screenHorizontalPadding } from "../constants/theme";
import { hscale, mscale, wscale } from "../helpers/metric";
import { PickedFile } from "../types";

const { height } = Dimensions.get("window");

const isPdfFile = (name: string, mimeType?: string | null) =>
  mimeType === "application/pdf" || name.toLowerCase().endsWith(".pdf");

export default function UploadFilesScreen() {
  const router = useRouter();

  const handleUseFilePicker = async () => {
    try {
      const pickedFile = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (!pickedFile.canceled) {
        const { name, uri, mimeType } = pickedFile.assets[0];
        if (!name || !uri) return;

        if (!isPdfFile(name, mimeType)) {
          Toast.error("Only PDF files are allowed for upload");
          return;
        }

        const _pickedFile: PickedFile = {
          fileUri: uri,
          imageUri: uri,
          name,
          mimeType: "application/pdf",
        };

        router.push({
          pathname: "/upload-preview",
          params: { pickedFile: JSON.stringify(_pickedFile) },
        });
      }
    } catch {
      Toast.error("Error picking file from document directory");
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* ── TOP SECTION (Purple) ── */}
          <View style={styles.topSection}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))}
                style={styles.backBtn}
                hitSlop={8}
              >
                <LeftIcon name="chevron-back" size={mscale(24)} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Solva</Text>
              <TouchableOpacity style={styles.bellBtn} hitSlop={8}>
                <FeatherIcon name="bell" size={mscale(20)} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Main Icon Area */}
            <View style={styles.iconContainer}>
              <View style={styles.iconBorderBox}>
                <View style={styles.iconInnerBox}>
                  <MaterialCommunityIcons name="file-upload" size={mscale(50)} color={colors.primary} />
                </View>
              </View>
            </View>

            {/* Text Content */}
            <Text style={styles.titleText}>Educational Resources</Text>
            <Text style={styles.subtitleText}>
              Seamlessly upload your PDF{"\n"}documents for verification and{"\n"}sharing.
            </Text>
          </View>

          {/* ── BOTTOM SECTION (White) ── */}
          <View style={styles.bottomSection}>
            {/* Upload Button Card */}
            <TouchableOpacity
              style={styles.uploadCard}
              onPress={handleUseFilePicker}
              activeOpacity={0.8}
            >
              <View style={styles.uploadIconWrap}>
                <MaterialCommunityIcons name="file-upload-outline" size={mscale(24)} color={colors.primary} />
              </View>
              <Text style={styles.uploadCardText}>Select PDF Document</Text>
            </TouchableOpacity>

            {/* Guidelines Card */}
            <View style={styles.guidelinesCard}>
              <View style={styles.infoIconWrap}>
                <MaterialCommunityIcons name="information-variant" size={mscale(16)} color={colors.primary} />
              </View>
              <View style={styles.guidelinesTextContent}>
                <Text style={styles.guidelinesTitle}>GUIDELINES</Text>
                <Text style={styles.guidelinesDesc}>
                  Ensure documents are clear and properly formatted for faster verification.
                </Text>
              </View>
            </View>

            {/* Badges Row */}
            <View style={styles.badgesRow}>
              <View style={styles.badgePill}>
                <MaterialCommunityIcons name="shield-check" size={mscale(16)} color={colors.primary} />
                <Text style={styles.badgeText}>Verified</Text>
              </View>
              <View style={styles.badgePill}>
                <MaterialCommunityIcons name="shield-lock" size={mscale(16)} color={colors.primary} />
                <Text style={styles.badgeText}>Secure</Text>
              </View>
            </View>

            {/* Disclaimer */}
            <Text style={styles.disclaimerText}>
              <Text style={styles.disclaimerBold}>Disclaimer: </Text>
              Content on Solva is for educational use and provided by our trusted community.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>

      <ToastManager />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // ── Top Section ──
  topSection: {
    backgroundColor: colors.primary,
    alignItems: "center",
    paddingBottom: hscale(40),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: wscale(20),
    paddingTop: hscale(20),
    paddingBottom: hscale(30),
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: "Inter-SemiBold",
    fontSize: mscale(16),
    color: "#fff",
    flex: 1,
    marginLeft: wscale(16),
  },
  bellBtn: {
    padding: 4,
  },

  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: hscale(20),
  },
  iconBorderBox: {
    width: wscale(140),
    height: hscale(160),
    borderRadius: mscale(24),
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconInnerBox: {
    width: wscale(64),
    height: hscale(80),
    backgroundColor: "#fff",
    borderRadius: mscale(12),
    alignItems: "center",
    justifyContent: "center",
  },

  titleText: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(14),
    color: "#fff",
    marginTop: hscale(16),
  },
  subtitleText: {
    fontFamily: "Inter-Light",
    fontSize: mscale(12),
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginTop: hscale(12),
    lineHeight: mscale(18),
  },

  // ── Bottom Section ──
  bottomSection: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    borderTopLeftRadius: mscale(32),
    borderTopRightRadius: mscale(32),
    paddingTop: hscale(40),
    paddingHorizontal: wscale(24),
    paddingBottom: hscale(30),
    alignItems: "center",
  },

  // Upload Card
  uploadCard: {
    backgroundColor: "#F7F8FC",
    width: "100%",
    paddingVertical: hscale(30),
    borderRadius: mscale(16),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hscale(20),
    borderWidth: 1,
    borderColor: "#EEF0F8",
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  uploadIconWrap: {
    width: wscale(48),
    height: wscale(48),
    borderRadius: mscale(12),
    backgroundColor: "#EBE5F7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hscale(16),
  },
  uploadCardText: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(14),
    color: "#222",
  },

  // Guidelines Card
  guidelinesCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    width: "100%",
    padding: mscale(20),
    borderRadius: mscale(16),
    marginBottom: hscale(20),
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  infoIconWrap: {
    width: wscale(32),
    height: wscale(32),
    borderRadius: mscale(8),
    backgroundColor: "#F5F2FA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: wscale(16),
  },
  guidelinesTextContent: {
    flex: 1,
  },
  guidelinesTitle: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(12),
    color: colors.primary,
    letterSpacing: 0.5,
    marginBottom: hscale(6),
  },
  guidelinesDesc: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(13),
    color: "#666",
    lineHeight: mscale(18),
  },

  // Badges Row
  badgesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: wscale(16),
    marginBottom: hscale(32),
  },
  badgePill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: hscale(14),
    borderRadius: mscale(12),
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    gap: wscale(8),
  },
  badgeText: {
    fontFamily: "Inter-SemiBold",
    fontSize: mscale(13),
    color: "#222",
  },

  // Disclaimer
  disclaimerText: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(12),
    color: "#888",
    textAlign: "center",
    lineHeight: mscale(18),
    width: "90%",
    marginTop: "auto",
  },
  disclaimerBold: {
    fontFamily: "Inter-SemiBold",
    color: "#666",
  },
});
