import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useMemo, useState } from "react";
import axios from "axios";
import Pdf from "react-native-pdf";
import Ionicons from "@expo/vector-icons/Ionicons";

import { AUTH_API_CLIENT } from "../api/apiClient";
import { colors } from "../constants/theme";
import { globalStyles } from "../styles/global";
import { hscale, mscale } from "../helpers/metric";
import { PickedFile } from "../types";
import ErrorModal from "../components/errorModal";
import ToastManager from "toastify-react-native";

type UploadType = "project" | "question";

const isPdfFile = (name: string, mimeType?: string | null) =>
  mimeType === "application/pdf" || name.toLowerCase().endsWith(".pdf");

const uploadTypeOptions: { label: string; value: UploadType }[] = [
  { label: "Project", value: "project" },
  { label: "Past Question", value: "question" },
];

export default function UploadFilePreviewScreen() {
  const params = useLocalSearchParams<{ pickedFile?: string | string[] }>();
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectedType, setSelectedType] = useState<UploadType | null>(null);
  const [pdfLoading, setPdfLoading] = useState(true);

  const rawPickedFile = Array.isArray(params.pickedFile)
    ? params.pickedFile[0]
    : params.pickedFile;

  const pickedFile: PickedFile | null = useMemo(() => {
    if (!rawPickedFile) return null;
    try {
      return JSON.parse(rawPickedFile) as PickedFile;
    } catch {
      return null;
    }
  }, [rawPickedFile]);

  const selectedLabel =
    uploadTypeOptions.find((item) => item.value === selectedType)?.label ??
    "Select type";

  const handleTypeSelect = (value: UploadType) => {
    setSelectedType(value);
    setPickerVisible(false);
  };

  const handleFileUpload = async () => {
    if (!pickedFile || !isPdfFile(pickedFile.name, pickedFile.mimeType)) {
      ToastManager.error("Invalid file. Only PDF uploads are allowed.");
      return;
    }

    if (!selectedType) {
      ToastManager.error("Please select a file type before uploading.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("dropdown", selectedType);
      formData.append("documents", {
        uri: pickedFile.fileUri,
        name: pickedFile.name,
        type: pickedFile.mimeType || "application/pdf",
      } as any);

      const formUploadResponse = await AUTH_API_CLIENT.post(
        "/documents/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (formUploadResponse.status === 200) {
        ToastManager.success("File upload was successful!");
        setTimeout(() => {
          router.back();
        }, 1500);
      }
    } catch (error) {
      let message = "Upload failed, Try later or contact support";
      if (axios.isAxiosError(error)) {
        const serverMessage =
          (error.response?.data as any)?.message ||
          (error.response?.data as any)?.error;
        if (typeof serverMessage === "string" && serverMessage.trim()) {
          message = serverMessage;
        }
        console.log(
          "Upload error response",
          error.response?.status,
          error.response?.data
        );
      }
      ToastManager.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={[globalStyles.screen, styles.screen]}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back-outline" size={26} color={colors.black} />
      </Pressable>

      <View style={styles.previewWrap}>
        {pickedFile ? (
          <>
            <Pdf
              source={{ uri: pickedFile.fileUri, cache: true }}
              style={styles.pdf}
              onLoadComplete={() => setPdfLoading(false)}
              onError={(error) => {
                console.log("Error viewing pdf", error);
                setPdfLoading(false);
              }}
            />
            {pdfLoading ? (
              <View style={styles.pdfOverlay}>
                <Text style={styles.pdfOverlayText}>Loading PDF preview...</Text>
              </View>
            ) : null}
          </>
        ) : (
          <View style={styles.emptyPreview}>
            <Text style={styles.emptyTitle}>No file selected</Text>
            <Text style={styles.emptySubtitle}>Please go back and choose a PDF file.</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Pressable
          style={styles.selector}
          onPress={() => setPickerVisible(true)}
          disabled={!pickedFile}
        >
          <Text
            style={[
              styles.selectorText,
              !selectedType && { color: "#6b6b6b", fontFamily: "Inter-Regular" },
            ]}
          >
            {selectedLabel}
          </Text>
          <Ionicons name="chevron-down-outline" size={22} color={colors.black} />
        </Pressable>

        <Pressable
          style={[styles.uploadButton, isUploading && { opacity: 0.7 }]}
          onPress={handleFileUpload}
          disabled={isUploading || !pickedFile}
        >
          <Text style={styles.uploadButtonText}>
            {isUploading ? "Uploading..." : "Upload file"}
          </Text>
        </Pressable>

        <Text style={styles.noteText}>
          Note: PQ upload takes a minimum of 3 days for it to be verified
        </Text>
      </View>

      <Modal
        visible={pickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setPickerVisible(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Select type</Text>
            {uploadTypeOptions.map((option) => (
              <Pressable
                key={option.value}
                style={styles.modalOption}
                onPress={() => handleTypeSelect(option.value)}
              >
                <Text style={styles.modalOptionText}>{option.label}</Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      <ErrorModal
        visible={errorVisible}
        message={errorMessage}
        onClose={() => setErrorVisible(false)}
      />
      <ToastManager />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#F3F3F3",
    paddingTop: hscale(32),
    paddingBottom: hscale(24),
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    marginBottom: hscale(12),
  },
  previewWrap: {
    flex: 1,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#ffffff",
    minHeight: hscale(420),
  },
  pdf: {
    flex: 1,
    width: "100%",
    minHeight: hscale(420),
  },
  pdfOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.75)",
  },
  pdfOverlayText: {
    fontFamily: "Inter-Medium",
    color: colors.bodyText,
  },
  emptyPreview: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    minHeight: hscale(420),
  },
  emptyTitle: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(18),
    color: colors.black,
  },
  emptySubtitle: {
    marginTop: 8,
    textAlign: "center",
    color: colors.bodyText,
    fontFamily: "Inter-Regular",
  },
  footer: {
    paddingTop: hscale(24),
    gap: hscale(16),
  },
  selector: {
    minHeight: hscale(60),
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 14,
    paddingHorizontal: 18,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectorText: {
    fontFamily: "Inter-Medium",
    fontSize: mscale(14),
    color: colors.black,
  },
  uploadButton: {
    minHeight: hscale(72),
    backgroundColor: colors.primary,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadButtonText: {
    color: "#ffffff",
    fontFamily: "Inter-Bold",
    fontSize: mscale(16),
  },
  noteText: {
    textAlign: "center",
    color: colors.primary,
    fontFamily: "Inter-Regular",
    fontSize: mscale(13),
    marginTop: -4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 4,
    paddingVertical: 18,
  },
  modalTitle: {
    fontFamily: "Inter-Bold",
    color: colors.black,
    fontSize: mscale(16),
    paddingHorizontal: 18,
    marginBottom: 6,
  },
  modalOption: {
    minHeight: 58,
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  modalOptionText: {
    fontFamily: "Inter-Regular",
    color: colors.black,
    fontSize: mscale(15),
  },
});
