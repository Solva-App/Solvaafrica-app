import { useLocalSearchParams, useNavigation, router } from "expo-router";
import { View, FlatList, Dimensions, Pressable, Platform } from "react-native";
import { useEffect, useState } from "react";
import { Image } from "expo-image";

import { colors, screenHorizontalPadding } from "../constants/theme";
import { getImageSource } from "../helpers/getImageSource";
import EmptyStateView from "../components/emptyStateView";
import LoadingView from "../components/loadingView";
import NativePdfViewer from "../components/NativePdfViewer";
import { normalizeRemoteFileUrl } from "../helpers/normalizeRemoteFileUrl";
import { hscale, mscale } from "../helpers/metric";
import { AUTH_API_CLIENT } from "../api/apiClient";
import ErrorModal from "../components/errorModal";

export default function CourseMaterials() {
  const params = useLocalSearchParams();
  const { courseId, headerTitle, courseCode } = params;
  const headerTitleString = Array.isArray(headerTitle)
    ? headerTitle[0]
    : headerTitle;
  const courseCodeString = Array.isArray(courseCode)
    ? courseCode[0]
    : courseCode;
  const [courses, setCourses] = useState<any[] | []>([]);
  const [fetchingCourseMaterials, setFetchingCourseMaterials] =
    useState<boolean>(false);
  const navigation = useNavigation();

  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    navigation.setOptions({ title: `${headerTitleString}` });
    const fetchCourseMaterials = async () => {
      setFetchingCourseMaterials(true);
      try {
        const res = await AUTH_API_CLIENT.get(`/questions/${courseId}`);
        const { data: coursesList } = res.data;
        setCourses(coursesList.documents);
      } catch (error) {
        // console.log("Error getting course materials", error);
        let message = "Error getting course materials";
        setErrorMessage(message);
        setErrorVisible(true);
      } finally {
        setFetchingCourseMaterials(false);
      }
    };

    fetchCourseMaterials();
  }, []);

  if (fetchingCourseMaterials)
    return <LoadingView isLoading={fetchingCourseMaterials} />;

  return (
    <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
      {!courses.length ? (
        <EmptyStateView />
      ) : (
        <FlatList
          data={courses}
          renderItem={({ item }) => (
            <CourseItemView
              url={item.url}
              key={item.id}
              title={headerTitleString}
              fileName={item.name}
              courseCode={courseCodeString}
            />
          )}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{ paddingHorizontal: screenHorizontalPadding }}
        />
      )}
      <ErrorModal
        visible={errorVisible}
        message={errorMessage}
        onClose={() => setErrorVisible(false)}
      />
    </View>
  );
}

const CourseItemView = ({
  url,
  title,
  fileName,
  courseCode,
}: {
  url: string;
  title: string;
  fileName: string;
  courseCode: string;
}) => {
  const handleImagePress = () => {
    router.push({
      pathname: "/courses/download-material",
      params: {
        url,
        screenTitle: title,
        originalFileName: fileName,
        fileCode: courseCode,
      },
    });
  };
  const normalizedUrl = normalizeRemoteFileUrl(url);
  const isPdf = normalizedUrl?.toLowerCase().includes('.pdf') ?? false;

  const width = Dimensions.get("window").width / 2 - screenHorizontalPadding * 1.5;
  const commonStyle = {
    aspectRatio: 0.75, // Standard document aspect ratio
    width,
    borderWidth: 1,
    borderColor: "#E2CFEA",
    marginBottom: hscale(12),
    borderRadius: mscale(8),
    overflow: "hidden" as const,
  };

  return (
    <Pressable onPress={handleImagePress}>
      <View pointerEvents="none" style={commonStyle}>
        {Platform.OS === 'web' ? (
          <iframe
            src={normalizedUrl}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title={title}
          />
        ) : isPdf ? (
          <NativePdfViewer
            uri={normalizedUrl}
            style={{ flex: 1, backgroundColor: "#f5f5f5" }}
          />
        ) : (
          <Image
            source={getImageSource(normalizedUrl)}
            transition={1000}
            contentFit="cover"
            style={{ flex: 1 }}
          />
        )}
      </View>
    </Pressable>
  );
};
