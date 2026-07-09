import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { Alert, Platform } from "react-native";
import { DownloadedFileRef, FileDirectory } from "../types";
import { normalizeRemoteFileUrl } from "../helpers/normalizeRemoteFileUrl";

/**
 * Why this file exists:
 * - On mobile we actually download to FileSystem.
 * - On web we store a URL reference so the user can view/open it in-app.
 *
 * Important: Firebase Storage URLs must NOT be double-encoded.
 * A very common bug is ending up with "documents%252Ffile.pdf" (double-encoded)
 * instead of "documents%2Ffile.pdf" (single-encoded) which causes 404s.
 */

const sanitizeFileName = (name: string) =>
  name
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
    .replace(/\s+/g, " ");

const splitFileName = (fileName: string) => {
  const sanitized = sanitizeFileName(fileName || "file");
  const lastDot = sanitized.lastIndexOf(".");

  if (lastDot <= 0 || lastDot === sanitized.length - 1) {
    return { baseName: sanitized, extension: "" };
  }

  return {
    baseName: sanitized.slice(0, lastDot),
    extension: sanitized.slice(lastDot),
  };
};

const buildStableSuffix = (value?: string) => {
  const input = String(value ?? "").trim();

  if (!input) {
    return "";
  }

  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }

  return hash.toString(36);
};

const buildStoredFileName = (
  originalFileName: string,
  fileCode?: string,
  sourceUrl?: string,
) => {
  const { baseName, extension } = splitFileName(originalFileName);
  const safeCode = (fileCode ?? "").trim().replace(/[^\w-]+/g, "_");
  const uniqueSuffix = buildStableSuffix(sourceUrl);
  const fileBaseName = uniqueSuffix ? `${baseName}_${uniqueSuffix}` : baseName;

  return safeCode
    ? `${safeCode}_${fileBaseName}${extension}`
    : `${fileBaseName}${extension}`;
};

const isAbsoluteHttpUrl = (uri: string) => {
  try {
    const u = new URL(uri);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

const isValidDownloadUrl = (uri: string) => {
  if (!isAbsoluteHttpUrl(uri)) return false;
  // Accept any valid http/https URL — backend may serve from Firebase, S3, Cloudinary, etc.
  return true;
};

const buildNormalizedDownloadUrl = (rawUrl: string) =>
  normalizeRemoteFileUrl(rawUrl);

export const useDownloadFile = (
  initiateDownload: boolean = false,
  fileCode?: string,
) => {
  const downloadFile = async (
    fileDirectory: FileDirectory,
    downloadFileUri: string,
    originalFileName: string,
    overrideFileCode?: string,
  ) => {
    try {
      const effectiveFileCode = overrideFileCode ?? fileCode;
      const normalizedDownloadUri = buildNormalizedDownloadUrl(downloadFileUri);
      console.log("[Download] Raw URL:", downloadFileUri);
      console.log("[Download] Normalized URL:", normalizedDownloadUri);

      if (!isValidDownloadUrl(normalizedDownloadUri)) {
        console.error("[Download] Invalid URL rejected:", normalizedDownloadUri);
        Alert.alert(
          "Invalid file URL",
          "This file link is invalid. Please contact support or refresh data.",
        );
        return { isExistingFile: null, fileUri: null, success: false };
      }

      // Always track the download reference regardless of platform
      const downloadedFileRef: DownloadedFileRef = {
        fileName: originalFileName,
        filePath: normalizedDownloadUri, // Web: store URL reference; Mobile: updated after download
        parentDirectory: fileDirectory,
        fileCode: effectiveFileCode,
        sourceUrl: normalizedDownloadUri,
        platform: Platform.OS,
        downloadDate: new Date().toISOString(),
      };

      // Handle platform-specific downloads
      let result;
      if (Platform.OS === "web") {
        result = await handleWebDownload(
          normalizedDownloadUri,
          downloadedFileRef,
        );
      } else {
        result = await handleMobileDownload(
          fileDirectory,
          normalizedDownloadUri,
          originalFileName,
          effectiveFileCode,
          normalizedDownloadUri,
          downloadedFileRef,
        );
      }

      // Save download reference only when a usable download/reference was created.
      if (result?.success) {
        await saveDownloadReference(downloadedFileRef);
      }

      return result;
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert("Error downloading", "Please retry later.");
      return { isExistingFile: null, fileUri: null, success: false };
    }
  };

  const saveDownloadReference = async (
    downloadedFileRef: DownloadedFileRef,
  ) => {
    try {
      const downloadRefsInStore = await AsyncStorage.getItem("DownloadRefs");
      if (downloadRefsInStore) {
        const downloadRefsList: DownloadedFileRef[] =
          JSON.parse(downloadRefsInStore);

        // Check if file already exists in references
        const existingIndex = downloadRefsList.findIndex(
          (ref: DownloadedFileRef) => {
            const sameParent =
              ref.parentDirectory === downloadedFileRef.parentDirectory;
            const sameSource =
              !!ref.sourceUrl &&
              !!downloadedFileRef.sourceUrl &&
              ref.sourceUrl === downloadedFileRef.sourceUrl;
            const samePath = ref.filePath === downloadedFileRef.filePath;
            const sameFile =
              !ref.sourceUrl &&
              !downloadedFileRef.sourceUrl &&
              ref.fileName === downloadedFileRef.fileName &&
              (ref.fileCode ?? "") === (downloadedFileRef.fileCode ?? "");

            return sameParent && (sameSource || samePath || sameFile);
          },
        );

        if (existingIndex >= 0) {
          // Update existing reference
          downloadRefsList[existingIndex] = downloadedFileRef;
        } else {
          // Add new reference
          downloadRefsList.push(downloadedFileRef);
        }

        await AsyncStorage.setItem(
          "DownloadRefs",
          JSON.stringify(downloadRefsList),
        );
      } else {
        await AsyncStorage.setItem(
          "DownloadRefs",
          JSON.stringify([downloadedFileRef]),
        );
      }

      console.log("Download reference saved:", downloadedFileRef);
    } catch (error) {
      console.error("Error saving download reference:", error);
    }
  };

  const handleMobileDownload = async (
    fileDirectory: FileDirectory,
    downloadFileUri: string,
    originalFileName: string,
    fileCode?: string,
    sourceUrl?: string,
    downloadedFileRef?: DownloadedFileRef,
  ) => {
    const filesDownloadsDirectoryPath =
      FileSystem.documentDirectory + `${fileDirectory}`;
    const storedFileName = buildStoredFileName(
      originalFileName,
      fileCode,
      sourceUrl,
    );
    const storedFilePath = `${filesDownloadsDirectoryPath}/${storedFileName}`;
    const filesDirectoryExist = (
      await FileSystem.getInfoAsync(filesDownloadsDirectoryPath)
    ).exists;

    if (!filesDirectoryExist) {
      await FileSystem.makeDirectoryAsync(filesDownloadsDirectoryPath, {
        intermediates: true,
      });
    }

    // Check if file already exists
    const existingFileInfo = await FileSystem.getInfoAsync(storedFilePath);

    if (existingFileInfo.exists) {
      if (downloadedFileRef) {
        downloadedFileRef.filePath = storedFilePath;
      }

      return {
        isExistingFile: true,
        fileUri: storedFilePath,
        success: true,
      };
    }

    // Proceed to download file
    if (initiateDownload) {
      const downloadedFile = await FileSystem.downloadAsync(
        downloadFileUri,
        storedFilePath,
      );

      // Update file path in reference for mobile
      if (downloadedFileRef) {
        downloadedFileRef.filePath = downloadedFile.uri;
      }

      return {
        isExistingFile: true,
        fileUri: downloadedFile.uri,
        success: true,
      };
    }

    return { isExistingFile: null, fileUri: null, success: false };
  };

  const handleWebDownload = async (
    downloadFileUri: string,
    downloadedFileRef?: DownloadedFileRef,
  ) => {
    /**
     * On web:
     * - Do NOT rely on HEAD requests: many CDNs / Firebase configurations can block it via CORS.
     * - Also: validating by fetching the whole file is expensive.
     *
     * Strategy:
     * - If it looks like a valid URL, store it as a reference (success = true).
     * - Optionally, try a lightweight GET with Range to catch obvious 404s when supported.
     */
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    try {
      const res = await fetch(downloadFileUri, {
        method: "GET",
        headers: { Range: "bytes=0-0" },
        signal: controller.signal,
      });

      if (res.status === 404) {
        console.error("Web download validation failed with 404", {
          downloadFileUri,
        });
        return { isExistingFile: null, fileUri: null, success: false };
      }

      if (downloadedFileRef) {
        downloadedFileRef.filePath = downloadFileUri;
      }

      return { isExistingFile: true, fileUri: downloadFileUri, success: true };
    } catch (error) {
      console.error(
        "Web download validation warning (storing URL anyway):",
        error,
      );

      if (downloadedFileRef) {
        downloadedFileRef.filePath = downloadFileUri;
      }

      return { isExistingFile: true, fileUri: downloadFileUri, success: true };
    } finally {
      clearTimeout(timeout);
    }
  };

  return downloadFile;
};
