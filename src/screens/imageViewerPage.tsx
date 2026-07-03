import { Zoomable } from "@likashefqet/react-native-image-zoom";
import { View } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { normalizeRemoteFileUrl } from "../helpers/normalizeRemoteFileUrl";

import { globalStyles } from "../styles/global";
import { colors } from "../constants/theme";
import { hscale } from "../helpers/metric";

type ImageViewerRouteLike = {
  params?: {
    imageSource?: string;
  };
};

const ImageViewerPage = ({ route }: { route?: ImageViewerRouteLike }) => {
  const params = useLocalSearchParams<{ imageSource?: string }>();
  const imageSource = normalizeRemoteFileUrl(params.imageSource || route?.params?.imageSource || "");

  return (
    <View style={[globalStyles.screen, { backgroundColor: colors.black }]}>
      <Zoomable style={{ flex: 1, justifyContent: "center" }}>
        <Image source={imageSource} style={{ flex: 1, width: "100%" }} contentFit="contain" />
      </Zoomable>
    </View>
  );
};

export default ImageViewerPage;
