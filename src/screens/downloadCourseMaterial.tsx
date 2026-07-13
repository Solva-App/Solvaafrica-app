import { useLocalSearchParams, useNavigation, router } from "expo-router";
import { Alert, Dimensions, View } from "react-native";
import { useEffect, useState } from "react";
import { Image } from "expo-image";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import ToastManager, { Toast } from "toastify-react-native";
import { Platform } from "react-native";

import { screenHorizontalPadding } from "../constants/theme";
import { useDownloadFile } from "../hooks/useDownloadFile";
import PrimaryButton from "../components/primaryButton";
import { globalStyles } from "../styles/global";
import { hscale } from "../helpers/metric";
import ErrorModal from "../components/errorModal";
import { getImageSource } from "../helpers/getImageSource";
import NativePdfViewer from "../components/NativePdfViewer";
import { normalizeRemoteFileUrl } from "../helpers/normalizeRemoteFileUrl";

export default function DownloadCourseMaterial() {
  const params = useLocalSearchParams();
  const navigation = useNavigation();
  const [startDownload, setStartDownload] = useState(false);
  const [fileExist, setFileExist] = useState(false);
  const fileCode = Array.isArray(params.fileCode)
    ? params.fileCode[0]
    : params.fileCode;
  const screenTitle = Array.isArray(params.screenTitle)
    ? params.screenTitle[0]
    : params.screenTitle || "Material";
  const rawUrl = Array.isArray(params.url) ? params.url[0] : params.url;
  const url = normalizeRemoteFileUrl(rawUrl);
  const originalFileName = Array.isArray(params.originalFileName)
    ? params.originalFileName[0]
    : params.originalFileName;
  const downloadFile = useDownloadFile(startDownload, fileCode);
  const [isLoading, setIsLoading] = useState(false);
  const [localFileUri, setLocalFileUri] = useState<string | null>(null);

  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    navigation.setOptions({ title: screenTitle });
  }, []);

  // download file
  useEffect(() => {
    const initiateDownload = async () => {
      try {
        setIsLoading(true);
        const { isExistingFile, fileUri } = await downloadFile(
          "Courses",
          url,
          originalFileName,
        );
        if (isExistingFile || fileUri) {
          setFileExist(true);
          setLocalFileUri(fileUri);
          if (startDownload) {
            Toast.success("Downloaded successfully");
          }
          return;
        }
      } catch (error) {
        let message =
          "Download error, Please try again later or contact support!";
        setErrorMessage(message);
        setErrorVisible(true);
        // Alert.alert(
        //   "Download Failed.",
        //   "Please try again later or contact support"
        // );
      } finally {
        setIsLoading(false);
      }
    };

    initiateDownload();
  }, [startDownload]);

  const handleInitiateDownload = async () => {
    if (Platform.OS === "web") {
      try {
        setIsLoading(true);
        const downloadUri = localFileUri || url;
        if (!downloadUri) throw new Error("No URL provided");
        const response = await fetch(downloadUri);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.setAttribute("download", originalFileName || "material.pdf");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
        Toast.success("Downloaded successfully");
      } catch (e) {
        // Fallback if fetch fails (e.g. CORS)
        const downloadUri = localFileUri || url;
        const link = document.createElement("a");
        link.href = downloadUri;
        link.setAttribute("download", originalFileName || "material.pdf");
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        Toast.success("Downloaded successfully");
      } finally {
        setIsLoading(false);
      }
      return;
    }
    setStartDownload(true);
  };

  const handleOpenDownloads = async () => {
    if (localFileUri) {
      if (Platform.OS === "android" || Platform.OS === "ios") {
        try {
          await Sharing.shareAsync(localFileUri, { 
            dialogTitle: "Save Course Material", 
            mimeType: "application/pdf",
            UTI: "public.pdf"
          });
        } catch (err) {
          console.log("Error sharing file:", err);
        }
      } else if (Platform.OS === "web") {
        try {
          const response = await fetch(localFileUri);
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = blobUrl;
          link.setAttribute("download", originalFileName || "material.pdf");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
        } catch (e) {
          const link = document.createElement("a");
          link.href = localFileUri;
          link.setAttribute("download", originalFileName || "material.pdf");
          link.target = "_blank";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        try {
          await Sharing.shareAsync(localFileUri);
        } catch (err) {}
      }
    }
  };

  const isPdf = url?.toLowerCase().includes('.pdf') ?? false;

  return (
    <View style={globalStyles.screen}>
      {Platform.OS === 'web' ? (
        // On web: embed the raw URL directly so the browser natively handles the file (PDF, Image, Video, etc.)
        <iframe
          src={url}
          style={{
            width: '100%',
            height: '70vh',
            border: 'none',
            borderRadius: 8,
            marginBottom: hscale(20),
          }}
          title={screenTitle}
        />
      ) : isPdf && Platform.OS !== 'web' ? (
        // On mobile: render PDF natively instead of placeholder
        <View
          style={{
            width: Dimensions.get('window').width - screenHorizontalPadding * 2,
            height: Dimensions.get('window').height * 0.5,
            marginBottom: hscale(20),
            backgroundColor: "#f5f5f5",
            borderRadius: 8,
            overflow: "hidden"
          }}
        >
          <NativePdfViewer
            uri={url}
            style={{ flex: 1 }}
          />
        </View>
      ) : (
        // On mobile for non-PDF: show Image
        <Image
          contentFit="contain"
          source={getImageSource(url)}
          style={{
            width: Dimensions.get('window').width - screenHorizontalPadding * 2,
            height: hscale(300),
            marginBottom: hscale(20),
          }}
        />
      )}

      {fileExist ? (
        <PrimaryButton text="Save to Phone" onPress={handleOpenDownloads} />
      ) : (
        <PrimaryButton
          text="Download file"
          onPress={handleInitiateDownload}
          isLoading={isLoading}
        />
      )}
      <ErrorModal
        visible={errorVisible}
        message={errorMessage}
        onClose={() => setErrorVisible(false)}
      />
      <ToastManager />
    </View>
  );
}
