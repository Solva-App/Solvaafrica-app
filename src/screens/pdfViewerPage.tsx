import { View, ActivityIndicator, Text, Platform } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as IntentLauncher from "expo-intent-launcher";
import * as Sharing from "expo-sharing";

export default function PdfViewerPage() {
  const { id } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [hasOpened, setHasOpened] = useState(false);

  useEffect(() => {
    if (hasOpened) return; // 🚫 prevent reopening when coming back

    const openFile = async () => {
      try {
        const stored = await AsyncStorage.getItem("DownloadRefs");
        const list = stored ? JSON.parse(stored) : [];

        const file = list[id ? Number(id) : 0];

        if (!file) {
          setLoading(false);
          return;
        }

        console.log("Opening file:", file);

        if (Platform.OS === "android") {
          const fileInfo = await FileSystem.getInfoAsync(file.filePath);

          console.log("File exists:", fileInfo.exists);
          console.log("File path:", file.filePath);

          if (fileInfo.exists) {
            // ✅ Convert file:// → content://
            const contentUri = await FileSystem.getContentUriAsync(
              file.filePath,
            );

            await IntentLauncher.startActivityAsync(
              "android.intent.action.VIEW",
              {
                data: contentUri,
                flags: 1 << 0, // FLAG_GRANT_READ_URI_PERMISSION
                type: "application/pdf",
              },
            );
          } else if (file.sourceUrl) {
            // 🌐 fallback (if file missing locally)
            await IntentLauncher.startActivityAsync(
              "android.intent.action.VIEW",
              {
                data: file.sourceUrl,
                type: "application/pdf",
              },
            );
          } else {
            console.log("File not found anywhere");
          }
        } else if (Platform.OS === "ios") {
          const fileInfo = await FileSystem.getInfoAsync(file.filePath);
          if (fileInfo.exists) {
            await Sharing.shareAsync(file.filePath);
          } else if (file.sourceUrl) {
            await Sharing.shareAsync(file.sourceUrl);
          } else {
            console.log("File not found anywhere");
          }
        }

        // ✅ mark opened so it doesn't loop
        setHasOpened(true);

        // ✅ go back automatically (best UX)
        router.back();
      } catch (err) {
        console.log("PDF open error:", err);
      } finally {
        setLoading(false);
      }
    };

    openFile();
  }, [id, hasOpened]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ActivityIndicator size="large" />
      <Text>Opening PDF...</Text>
    </View>
  );
}
