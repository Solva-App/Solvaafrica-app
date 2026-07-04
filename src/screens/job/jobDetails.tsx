import { colors } from "@/src/constants/theme";
import { hscale, mscale, wscale } from "@/src/helpers/metric";
import { globalStyles } from "@/src/styles/global";
import {
  ScrollView,
  Text,
  Image,
  View,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  ToastAndroid,
  Linking,
} from "react-native";
import { StaticScreenProps } from "@react-navigation/native";
import { Job, PickedFile } from "@/src/types";
import * as DocumentPicker from "expo-document-picker";
import PdfPageImage from "react-native-pdf-page-image";
import ToastManager, { Toast } from "toastify-react-native";
import PrimaryButton from "@/src/components/primaryButton";
import { useState } from "react";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

type Props = StaticScreenProps<{ job: Job }>;

const JobDetailsScreen = ({ route }: Props) => {
  const { job } = useLocalSearchParams();
  console.log(job);
  const parsedJob: Job | null = job ? JSON.parse(job as string) : null;

  const [pickedFile, setPickedFile] = useState<PickedFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [pressed, setPressed] = useState(false);

  const email = "solvaapp@gmail.com";

  const handleUseFilePicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/jpeg"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        const { name, uri, mimeType } = result.assets[0];
        if (!name || !uri || !mimeType) throw new Error("Invalid picked asset");

        const file: PickedFile = {
          fileUri: uri,
          imageUri: uri,
          name,
          mimeType,
        };

        // Convert PDF to image preview if needed
        // if (mimeType === "application/pdf") {
        //   const scale = 1.0;
        //   const pdfPageImage = await PdfPageImage.generate(uri, 1, scale);
        //   file.imageUri = pdfPageImage.uri;
        // }

        setPickedFile(file);
      }
    } catch (error) {
      Toast.error("Error picking file from document directory");
      // Toast.error("Error picking file from document directory");
    }
  };

  const handleUpload = () => {
    if (!pickedFile) return;
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setPickedFile(null);
      Toast.success(
        "Uploaded file was successful, this file will take 3-5 business working days",
      );
    }, 2000); // Simulate async upload
  };

  if (!job) {
    return (
      <View style={globalStyles.screen}>
        <Text style={{ color: colors.black, fontSize: mscale(16) }}>
          No job details available.
        </Text>
      </View>
    );
  }

  const router = useRouter();

  return (
    <ScrollView style={[globalStyles.screen, { backgroundColor: "#F0EDF6" }]}>
      {/* ── Back Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#1A1A2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <Image
        source={require("../../../assets/images/jobBanner.png")}
        style={{
          marginTop: mscale(10),
          width: "100%",
        }}
        resizeMode="contain"
      />

      <View>
        <Text style={styles.headerText}>{parsedJob?.title}</Text>
        <Text style={styles.jobTypeText}>
          {parsedJob?.status?.join(", ") || "N/A"}
        </Text>
      </View>

      <View style={{ marginTop: hscale(10) }}>
        <Text style={styles.label}>Job posting date</Text>
        <Text style={styles.value}>
          {new Date(parsedJob?.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
      </View>

      <View style={{ marginVertical: mscale(20) }}>
        <Text style={styles.headerText}>Description</Text>
        <Text style={styles.description}>{parsedJob.description}</Text>
      </View>

      <View>
        <Text style={styles.headerText}>Upload file</Text>

        {pickedFile ? (
          <View
            style={{
              marginHorizontal: mscale(10),
              backgroundColor: colors.greyView,
              paddingHorizontal: mscale(20),
              paddingVertical: mscale(20),
              alignItems: "center",
              gap: mscale(10),
              flexDirection: "row",
              marginVertical: mscale(20),
            }}
          >
            <AntDesign name="file1" size={24} color={colors.primary} />
            <Text
              style={{
                fontSize: mscale(15),
                color: "black",
                fontFamily: "Inter-Medium",
              }}
            >
              {pickedFile.name}
            </Text>
          </View>
        ) : (
          <TouchableOpacity onPress={handleUseFilePicker}>
            <View style={styles.uploadBtn}>
              <Image
                source={require("../../../assets/images/dashImgs/upload.png")}
                style={{
                  width: wscale(38),
                  height: hscale(38),
                }}
              />
              <Text style={styles.uploadBtnText}>
                Select files (doc, docx, pdf)
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
      <Text>
        Send Resume to{" "}
        <Text
          style={styles.email}
          onPress={() => Linking.openURL(`mailto:${email}`)}
        >
          {email}
        </Text>
      </Text>
      <Pressable
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        onPress={handleUpload}
        disabled={!pickedFile || isUploading}
        style={[styles.buttonView, { opacity: pressed ? 0.9 : 1 }]}
      >
        {" "}
        {!isUploading ? (
          <Text style={styles.buttonText}>Upload</Text>
        ) : (
          <ActivityIndicator size={"small"} color={"#ffffff"} />
        )}
      </Pressable>
      <ToastManager />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // ── Header ──
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: "#F0EDF6",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontFamily: "Inter-Bold",
    fontSize: mscale(17),
    color: "#1A1A2E",
  },
  headerSpacer: {
    width: 40,
  },
  headerText: {
    fontFamily: "Inter-Bold",
    color: colors.black,
    fontSize: mscale(20),
  },
  jobTypeText: {
    fontFamily: "Inter-Medium",
    color: colors.primary,
    fontSize: mscale(15),
    textTransform: "capitalize",
  },
  buttonView: {
    backgroundColor: colors.primary,
    width: "100%",
    borderRadius: mscale(100),
    minHeight: hscale(60),
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    textAlign: "center",
    color: "#ffffff",
    fontFamily: "Inter-Medium",
    fontSize: mscale(16),
    textTransform: "capitalize",
  },
  label: {
    fontFamily: "Inter-Medium",
    color: "#5C5F62",
    marginBottom: hscale(4),
    fontSize: mscale(13),
  },
  value: {
    fontFamily: "Inter-Medium",
    color: colors.black,
    fontSize: mscale(15),
  },
  description: {
    fontFamily: "Inter-Medium",
    color: "#5C5F62",
    fontSize: mscale(15),
  },
  uploadBtn: {
    borderRadius: mscale(20),
    backgroundColor: "#F7F2FA",
    borderWidth: 1,
    borderColor: colors.primary,
    width: wscale(205),
    height: hscale(158),
    marginVertical: hscale(20),
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadBtnText: {
    color: colors.primary,
    fontSize: mscale(15),
    fontFamily: "Inter-SemiBold",
    marginTop: hscale(10),
    textAlign: "center",
  },
  email: {
    color: colors.primary,
    textDecorationLine: "underline",
    fontFamily: "Inter-Medium",
  },
});

export default JobDetailsScreen;
