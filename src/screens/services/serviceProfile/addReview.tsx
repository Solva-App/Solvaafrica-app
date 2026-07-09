import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  ToastAndroid,
} from "react-native";
import React, { useState } from "react";
import { mscale, hscale } from "@/src/helpers/metric";
import { colors } from "@/src/constants/theme";
import { globalStyles } from "@/src/styles/global";
import {
  StaticScreenProps,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { AUTH_API_CLIENT } from "@/src/api/apiClient";
import ToastManager, { Toast } from "toastify-react-native";
import { useAuthStore } from "@/src/stores/authStore";
import { FreelancerProfile } from "@/src/types";
import { useLocalSearchParams, useRouter } from "expo-router";

// type Props = StaticScreenProps<{ userData: FreelancerProfile }>;
export default function AddReview() {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { userData } = useLocalSearchParams();
  const navigation = useRouter();

  const parsedUserData = userData ? JSON.parse(userData as string) : null;

  console.log(parsedUserData.id);

  const handleSubmit = async () => {
    if (!name || !title || !message) {
      Toast.error("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      const payload = { name, title, message };

      const response = await AUTH_API_CLIENT.post(
        `/freelancers/create/comment/${parsedUserData?.id}`,
        payload,
      );

      if (response.status === 200 || response.status === 201) {
        Toast.success("Review submitted successfully!");
        setName("");
        setTitle("");
        setMessage("");
      } else {
        Toast.error("Failed to submit review.");
      }
    } catch (error) {
      console.error("Review submit error:", error);
      Toast.error("Something went wrong while submitting review.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={globalStyles.screen}>
      <Text style={styles.label}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Enter your name"
        style={styles.input}
      />

      <Text style={styles.label}>Title</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Enter a short title for your review"
        style={styles.input}
      />

      <Text style={styles.label}>
        Message
        <Text
          style={{
            fontSize: mscale(12),
          }}
        >
          {" "}
          (max 200 characters.)
        </Text>
      </Text>
      <TextInput
        value={message}
        onChangeText={setMessage}
        placeholder="Write your review"
        multiline
        numberOfLines={4}
        style={[
          styles.input,
          { height: hscale(100), textAlignVertical: "top" },
        ]}
      />

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={loading}
        style={{
          backgroundColor: colors.primary,
          paddingVertical: mscale(12),
          borderRadius: mscale(10),
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: mscale(16),
            fontFamily: "Inter-Bold",
          }}
        >
          {loading ? <ActivityIndicator color="white" /> : "Submit Review"}
        </Text>
      </TouchableOpacity>
      <ToastManager />
    </ScrollView>
  );
}

const styles = {
  label: {
    fontSize: mscale(16),
    fontFamily: "Inter-Medium",
    color: colors.black,
    marginBottom: mscale(5),
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: mscale(10),
    paddingHorizontal: mscale(10),
    paddingVertical: mscale(8),
    marginBottom: mscale(15),
    fontFamily: "Inter-Regular",
    fontSize: mscale(14),
    color: colors.black,
  },
};
