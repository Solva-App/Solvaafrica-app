import { StyleSheet, Text, View, Image } from "react-native";
import { useEffect, useState } from "react";

import { hscale, mscale, wscale } from "../helpers/metric";
import { useAuthStore } from "../stores/authStore";
import { colors } from "../constants/theme";
import { Platform } from "expo-modules-core";

export default function AvatarView({ size = 40 }: { size?: number }) {
  const user = useAuthStore((state) => state.user);

  const profilePic = user?.profile?.profilePic ?? null;
  const fullName = user?.profile?.fullName ?? "";

  const nameParts = fullName.trim().split(" ");
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts[1] ?? "";

  const [userNamePrefix, setUserNamePrefix] = useState("");

  useEffect(() => {
    const firstInitial = firstName ? firstName[0] : "";
    const lastInitial = lastName ? lastName[0] : "";
    setUserNamePrefix(firstInitial + lastInitial);
  }, [fullName]);

  if (profilePic) {
    return (
      <Image
        source={{ uri: profilePic }}
        style={[
          styles.avatarView,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.avatarView,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={styles.avatarViewText}>{userNamePrefix.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarView: {
    width: wscale(40),
    height: hscale(40),
    backgroundColor: colors.primary,
    borderRadius: mscale(30),
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    ...Platform.select({
      web: {
        maxWidth: "100%",
      },
    }),
  },
  avatarViewText: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(14),
    color: "#ffffff",
    textAlign: "center",
    textTransform: "uppercase",
  },
});
