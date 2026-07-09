import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Alert,
  Text,
  View,
  RefreshControl,
  StyleSheet,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import * as FileSystem from "expo-file-system";
import { useCallback, useState } from "react";
import { normalizeRemoteFileUrl } from "../helpers/normalizeRemoteFileUrl";
import { isRemoteFileMissing } from "../helpers/isRemoteFileMissing";

import { DownloadItemView } from "../components/downloadItemView";
import { hscale, mscale, wscale } from "../helpers/metric";
import { globalStyles } from "../styles/global";
import { DownloadedFileRef } from "../types";
import { colors } from "../constants/theme";

export default function DownloadScreen() {
  const [downloadsList, setDownloadsList] = useState<DownloadedFileRef[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDownloads = useCallback(async () => {
    try {
      const downloadsRefListInStore =
        await AsyncStorage.getItem("DownloadRefs");
      const downloadsRefList: DownloadedFileRef[] = downloadsRefListInStore
        ? JSON.parse(downloadsRefListInStore)
        : [];
      setDownloadsList(downloadsRefList);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDownloads();
    }, [fetchDownloads, refreshing]),
  );

  const onRefresh = () => {
    setRefreshing(true);
  };

  const handleDeleteItem = async (item: DownloadedFileRef) => {
    const downloadsInStore = await AsyncStorage.getItem("DownloadRefs");
    const downloadList: DownloadedFileRef[] = downloadsInStore
      ? JSON.parse(downloadsInStore)
      : [];

    // Delete actual file from device storage !important
    const isRemotePath =
      item.platform === "web" ||
      item.filePath?.startsWith("http://") ||
      item.filePath?.startsWith("https://");

    if (Platform.OS !== "web" && !isRemotePath) {
      await FileSystem.deleteAsync(item.filePath, { idempotent: true });
    }
    // Remove the file reference !important
    const filteredDownloadRefList = downloadList.filter(
      (currentItem) => currentItem.filePath !== item.filePath,
    );
    await AsyncStorage.setItem(
      "DownloadRefs",
      JSON.stringify(filteredDownloadRefList),
    );
    setDownloadsList(filteredDownloadRefList);
    setRefreshing(false);
  };

  const handleOpenItem = async (item: DownloadedFileRef, index: number) => {
    console.log(item);

    const normalizedPath = item.filePath;

    if (await isRemoteFileMissing(normalizedPath)) {
      Alert.alert(
        "File unavailable",
        "This file link now returns 404 from storage. Download it again after the source link is fixed.",
      );
      return;
    }

    const lowerName = item.fileName?.toLowerCase() || "";
    const lowerPath = normalizedPath.toLowerCase();
    const isPdf = lowerName.endsWith(".pdf") || lowerPath.includes(".pdf");

    if (isPdf) {
      router.push({
        pathname: "/pdf-viewer",
        params: { id: index }, // ✅ pass index only
      });
    } else {
      router.push({
        pathname: "/image-viewer",
        params: { id: index, imageSource: normalizedPath }, // ✅ pass both or just imageSource
      });
    }
  };

  console.log(downloadsList);

  // Render empty state screen
  if (downloadsList.length === 0) {
    return (
      <View style={globalStyles.screen}>
        <View style={styles.emptyHeaderContainer}>
          <Text style={styles.emptyHeaderText}>Downloads</Text>
        </View>
        <View style={styles.emptyContentContainer}>
          <Text style={styles.emptyText}>
            Files you downloaded in this app will show here
          </Text>
        </View>
      </View>
    );
  }

  // Render downloads list screen
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Downloads</Text>
      </View>
      <View style={styles.downloadsWrapper}>
        <View style={styles.downloadsContainer}>
          <FlashList
            data={downloadsList}
            estimatedItemSize={100}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => {
              return (
                <View style={styles.downloadItemCard}>
                  <DownloadItemView
                    fileCode={
                      item.fileCode?.trim()
                        ? `${item.fileCode.trim()}(${index + 1})`
                        : undefined
                    }
                    source={item.filePath}
                    fileName={item.fileName}
                    parentDirectory={item.parentDirectory}
                    onDeletePress={() => handleDeleteItem(item)}
                    onItemPress={() => handleOpenItem(item, index)}
                  />
                </View>
              );
            }}
            contentContainerStyle={{
              paddingVertical: hscale(4),
              paddingBottom: hscale(24),
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                colors={[colors.primary]}
                onRefresh={onRefresh}
              />
            }
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary, // Changed to primary color
  },
  headerContainer: {
    paddingTop: hscale(60),
    paddingBottom: hscale(30),
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(24),
    color: colors.white,
    textAlign: "center",
  },

  downloadsWrapper: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    width: "100%",
    paddingHorizontal: wscale(16),
    paddingVertical: hscale(12),
    alignItems: "center",
  },
  downloadsContainer: {
    flex: 1,
    width: "100%",
    paddingVertical: hscale(8),
    paddingHorizontal: wscale(4),
  },
  downloadItemCard: {
    backgroundColor: colors.inputFieldNew,
    borderRadius: 10,
    paddingVertical: hscale(14),
    paddingHorizontal: wscale(16),
    marginBottom: hscale(12),
  },
  // Empty state styles
  emptyHeaderContainer: {
    paddingTop: hscale(32),
    paddingHorizontal: wscale(16),
    alignItems: "flex-start", // Text at top right
  },
  emptyHeaderText: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(24),
    color: colors.black,
  },
  emptyContentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wscale(20),
  },
  emptyText: {
    textAlign: "center",
    fontFamily: "Inter-Regular",
    fontSize: mscale(14),
    color: colors.bodyText,
  },
});
