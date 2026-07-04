import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { globalStyles } from "@/src/styles/global";
import { hscale, mscale, wscale } from "@/src/helpers/metric";
import { colors } from "@/src/constants/theme";
import { useRouter, useLocalSearchParams } from "expo-router";
import { AUTH_API_CLIENT } from "@/src/api/apiClient";
import { ServiceType } from "@/src/types";
import ErrorModal from "@/src/components/errorModal";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Feather from "@expo/vector-icons/Feather";

const getIconName = (
  title: string
): keyof typeof MaterialCommunityIcons.glyphMap => {
  switch (title) {
    case "Graphics & Design":
      return "briefcase-outline";
    case "Digital Marketing":
      return "bullhorn-outline";
    case "Programming & Tech":
      return "code-tags";
    case "Video & Animation":
      return "video-plus-outline";
    case "Photography":
      return "camera-outline";
    case "Business":
      return "briefcase-variant-outline";
    case "Others":
      return "dots-horizontal";
    default:
      return "briefcase-outline";
  }
};

export default function FindServices() {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category?: string }>();
  const [services, setServices] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(
    category ?? null
  );

  useEffect(() => {
    const getServices = async () => {
      try {
        setLoading(true);
        const response = await AUTH_API_CLIENT.get("/freelancers/catigories");
        if (response.status === 200) {
          setServices(response.data.data);
        }
      } catch (error) {
        console.error("Job fetch error:", error);
        setErrorMessage("Something went wrong while fetching services!");
        setErrorVisible(true);
      } finally {
        setLoading(false);
      }
    };

    getServices();
  }, []);

  const handleServicePress = useCallback(
    (service: ServiceType) => {
      setActiveCategory(service.title);
      router.push({
        pathname: "/(services)/find-service/service-details",
        params: {
          service: JSON.stringify(service),
        },
      });
    },
    [router]
  );

  return (
    <View style={[globalStyles.screen, styles.screen]}>
      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => {
               if (router.canGoBack()) {
               router.back();
              } else {
              router.replace("/(services)/services"); // change to your home route
              }
}}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={styles.backBtn}
                activeOpacity={0.8}
              >
                <Feather name="arrow-left" size={mscale(22)} color="black" />
              </TouchableOpacity>

              <Text style={styles.headerTitle}>Categories</Text>

              {/* Spacer to keep the title centered like the screenshot */}
              <View style={styles.headerRightSpacer} />
            </View>
          }
          renderItem={({ item }) => {
            const isActive =
              activeCategory?.toLowerCase() === item.title?.toLowerCase();
            return (
              <TouchableOpacity
                onPress={() => handleServicePress(item)}
                activeOpacity={0.9}
                style={[
                  styles.row,
                  isActive && styles.rowActive,
                ]}
              >
                <View style={[styles.iconCol, isActive && styles.iconColActive]}>
                  <MaterialCommunityIcons
                    name={getIconName(item.title)}
                    size={mscale(30)}
                    color={isActive ? "#fff" : colors.primary}
                  />
                </View>

                <View style={styles.textCol}>
                  <Text style={[styles.title, isActive && styles.titleActive]}>{item.title}</Text>
                  <Text style={[styles.desc, isActive && styles.descActive]}>{item.description}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No services available at the moment.
            </Text>
          }
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

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "white",
  },

  loaderWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  listContent: {
    paddingBottom: hscale(34),
    paddingTop: hscale(8),
    paddingHorizontal: wscale(22), // matches screenshot left/right spacing
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hscale(18),
    paddingTop: hscale(6),
  },

  backBtn: {
    width: wscale(36),
    height: wscale(36),
    alignItems: "flex-start",
    justifyContent: "center",
  },

  headerTitle: {
    flex: 1,
    //textAlign: "center", // centered like screenshot
    fontFamily: "Inter-Bold",
    fontSize: mscale(32),
    color: "black",
  },

  headerRightSpacer: {
    width: wscale(36), // same as back button width for perfect centering
  },

  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: hscale(28), // more breathing room like screenshot
  },

  iconCol: {
    width: wscale(52),
    alignItems: "flex-start",
    paddingTop: hscale(4), // aligns icon with title baseline like screenshot
  },

  textCol: {
    flex: 1,
    paddingRight: wscale(6),
  },

  title: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(18.5),
    color: colors.primary,
    marginBottom: hscale(6),
  },

  desc: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(14.5),
    color: "black",
    lineHeight: mscale(20),
  },

  emptyText: {
    textAlign: "center",
    marginTop: hscale(20),
    fontFamily: "Inter-Regular",
    color: colors.black,
  },
  rowActive: {
    backgroundColor: colors.primary,
    borderRadius: mscale(12),
    paddingHorizontal: wscale(12),
    paddingVertical: hscale(10),
    marginHorizontal: -wscale(12),
  },
  iconColActive: {
    // icon turns white when active
  },
  titleActive: {
    color: "#fff",
  },
  descActive: {
    color: "rgba(255,255,255,0.8)",
  },
});