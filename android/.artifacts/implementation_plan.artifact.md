# Implementation Plan - Update Target SDK to 36 and Fix 16 KB Page Size Support

This plan addresses the Google Play Console requirement to target Android 16 (API 36) by August 31, 2026, and ensures the app is compatible with 16 KB page size devices.

## User Review Required

> [!IMPORTANT]
> **Breaking Changes:**
> - **Edge-to-Edge:** Android 16 enforces edge-to-edge display. Your app will automatically draw behind the system navigation and status bars. Since you are using `react-native-safe-area-context`, this should be manageable, but you should verify the UI layouts.
> - **Predictive Back:** API 36 enables predictive back gestures by default. Ensure your back navigation logic (via `BackHandler` or React Navigation) is tested.
> - **16 KB Support:** This change involves how native libraries are packaged. It is essential for modern hardware but requires testing on a real device or 16 KB emulator if possible.

## Proposed Changes

### [Component] Android Build Configuration

We will update the project-wide SDK versions and add specific Gradle properties to ensure 16 KB alignment.

#### [MODIFY] [build.gradle](file:///C:/Users/HP/Documents/404%20workspace/solva/Solvaafrica-app/android/build.gradle)
- Update `compileSdkVersion` to `36`.
- Update `targetSdkVersion` to `36`.
- Update `buildToolsVersion` to `36.0.0`.

#### [MODIFY] [gradle.properties](file:///C:/Users/HP/Documents/404%20workspace/solva/Solvaafrica-app/android/gradle.properties)
- Add `android.bundle.enableUncompressedNativeLibs=true` to ensure native libraries in the AAB are not compressed, allowing them to be page-aligned.
- Verify `expo.useLegacyPackaging=false` is maintained.

### [Component] Android Manifest

#### [MODIFY] [AndroidManifest.xml](file:///C:/Users/HP/Documents/404%20workspace/solva/Solvaafrica-app/android/app/src/main/AndroidManifest.xml)
- Add `android:enableOnBackInvokedCallback="true"` to the `<application>` tag to explicitly support predictive back gestures if needed, though API 36 enables it by default.

## Verification Plan

### Automated Tests
- Run `./gradlew assembleRelease` to ensure the project builds successfully with the new SDK.

### Manual Verification
- **AAB Alignment Check:** After generating the AAB, you can use the `bundletool` or Android Studio's **APK Analyzer** to verify that `.so` files in the AAB are aligned to 16 KB boundaries.
- **UI Check:** Deploy to a device/emulator running Android 15+ to check for edge-to-edge layout issues.
