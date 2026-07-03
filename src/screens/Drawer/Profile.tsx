import AsyncStorage from "@react-native-async-storage/async-storage";
import { Pressable, TextInput } from "react-native-gesture-handler";
import { View, StyleSheet, Text, Alert, Platform } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { AUTH_API_CLIENT } from "@/src/api/apiClient";
import { useCallback, useState } from "react";
import { MaterialIcons, Entypo, FontAwesome } from "@expo/vector-icons";
import { Toast } from "toastify-react-native";
import { UserProfile } from "@/src/types";
import { hscale, mscale, wscale } from "../../helpers/metric";
import PrimaryButton from "../../components/primaryButton";
import { useAuthStore } from "../../stores/authStore";
import { globalStyles } from "../../styles/global";
import { colors } from "../../constants/theme";
import ErrorModal from "@/src/components/errorModal";

type UpdateUserProfile = {
  fullName: null | string;
  email: null | string;
  address: null | string;
  phone: null | string;
  password?: null | string;
};

export default function Profile() {
  const [userProfile, setUserProfile] = useState<UpdateUserProfile>({
    fullName: null,
    email: null,
    address: null,
    password: null,
    phone: null,
  });

  const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");

  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem("User").then((value) => {
        if (value) {
          const { fullName, password, email, address, phone } =
            JSON.parse(value).profile;
          setUserProfile({ fullName, password, email, address, phone });
        }
      });
      setShowDropdown(false);
    }, [])
  );

  
  const handleTextInputChange = (text: string) => {
    // no symbols, special characters or numbers allowed
    const filterdText = text.replace(/[^a-zA-Z ]/g, "");
    return filterdText;
  };

  const handleUpdateUserProfile = async () => {
  try {
    setIsLoading(true);

    // Validation functions
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const fieldsPass = () => {
      if (
        userProfile.fullName &&
        userProfile.fullName.trim().split(" ").length < 2
      ) {
        Toast.error("Kindly provide your first and last name, e.g John Doe");
        return false;
      }
      if (userProfile.email && !emailRegex.test(userProfile.email.trim())) {
        Toast.error("Kindly provide a valid email address");
        return false;
      }
      if (password || confirmPassword) {
        if (password !== confirmPassword) {
          Toast.error("Passwords do not match.");
          return false;
        }
      }

      return true;
    };

    if (!fieldsPass()) return;

    // get current user profile
    const user = await AsyncStorage.getItem("User");
    const currentUserProfile = user && JSON.parse(user).profile;

    // basic sanitization
    const updatedProfile = {
      ...userProfile,
      fullName: userProfile.fullName?.trim(),
      address: userProfile.address?.trim(),
      ...(password ? { password } : {}), // only send password if provided
    };

    if (
      JSON.stringify(currentUserProfile).toLowerCase() ===
      JSON.stringify(updatedProfile).toLowerCase()
    )
      return;

    console.log("Proceeding to update user");

    const profileUpdateRes = await AUTH_API_CLIENT.patch(
      "/users",
      updatedProfile
    );

    if (profileUpdateRes.status === 200) {
      const cachedUser = await AsyncStorage.getItem("User");
      const user = cachedUser && JSON.parse(cachedUser);
      user.profile = updatedProfile;

      // save to storage
      useAuthStore.setState((state) => ({
        ...state,
        user: { profile: updatedProfile },
      }));
      await AsyncStorage.setItem("User", JSON.stringify(user));
      console.log("user updated", user);
      Toast.success("Profile Updated successfully!");
    }
  } catch (error) {
    let message =
      "Update failed, Something went wrong, kindly check your network";
    setErrorMessage(message);
    setErrorVisible(true);
  } finally {
    setIsLoading(false);
  }
};

  return (
    <View>
      {/* inputs */}
      <View style={styles.inputFieldViewWrap}>
        <View style={styles.inputWrapper}>
        <MaterialIcons name="person" size={20} color={colors.primary} style={styles.inputIcon} />
        <TextInput
          value={userProfile.fullName ?? undefined}
          style={styles.inputFieldView}
          placeholder="Full name"
          placeholderTextColor={colors.placeholderInput}
          autoCapitalize="words"
          onChangeText={(text) =>
            setUserProfile((prev) => ({
              ...prev,
              fullName: handleTextInputChange(text),
            }))
          }
        />
        </View>

        <View style={styles.inputWrapper}>
        <MaterialIcons name="email" size={20} color={colors.primary} style={styles.inputIcon} />
        <TextInput
          value={userProfile.email ?? undefined}
          style={styles.inputFieldView}
          placeholder="Email address"
          placeholderTextColor={colors.placeholderInput}
          onChangeText={(text) =>
            setUserProfile((prev) => ({ ...prev, email: text.trim() }))
          }
        />
        </View>

        <View style={styles.inputWrapper}>
        <MaterialIcons name="phone" size={20} color={colors.primary} style={styles.inputIcon} />
        <TextInput
          value={userProfile.phone ?? undefined}
          style={styles.inputFieldView}
          placeholder="Phone number"
          keyboardType="phone-pad"
          placeholderTextColor={colors.placeholderInput}
          onChangeText={(text) =>
            setUserProfile((prev) => ({ ...prev, phone: text.trim() }))
          }
        />
        </View>
       
        <View style={styles.inputWrapper}>
         <MaterialIcons name="home" size={20} color={colors.primary} style={styles.inputIcon} />
        <TextInput
          value={userProfile.address ?? undefined}
          style={styles.inputFieldView}
          placeholder="Residential address"
          placeholderTextColor={colors.placeholderInput}
          onChangeText={(text) =>
            setUserProfile((prev) => ({
              ...prev,
              address: handleTextInputChange(text),
            }))
          }
        />
        </View>
        <View style={styles.inputWrapper}>
        <MaterialIcons name="lock" size={20} color={colors.primary} style={styles.inputIcon} />
        <TextInput
          value={confirmPassword}
          style={styles.inputFieldView}
          placeholder="Confirm Password"
          placeholderTextColor={colors.placeholderInput}
          secureTextEntry={true} // hides the text
          onChangeText={(text) => setConfirmPassword(text)}/>
        </View>
      
      </View>
      <PrimaryButton
        text="Update profile"
        onPress={handleUpdateUserProfile}
        isLoading={isLoading}
      />
      <ErrorModal
        visible={errorVisible}
        message={errorMessage}
        onClose={() => setErrorVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputFieldView: {
    flex: 1, // ensures TextInput takes the remaining width
    height: hscale(60),
    fontFamily: "Inter-Medium",
    color: "#5C5F62",
    borderWidth: 0,
   ...Platform.select({
      web: {
        outlineStyle: "none",
        outlineWidth: 0,
      } as any,
    }),
  },
  inputFieldViewWrap: { gap: hscale(12), marginVertical: hscale(40) },
  dropdownContainer: {
    borderRadius: mscale(12),
    elevation: 5,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.7,
    shadowRadius: 2,
    backgroundColor: colors.inputFieldNew,
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 90,
    top: hscale(0),
  },

  inputWrapper: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.inputField,
  borderRadius: mscale(30),
  borderWidth: 0,
  paddingHorizontal: wscale(16),
  marginBottom: hscale(12),
},

  dropdownText: {
    fontFamily: "Inter-Regular",
    paddingVertical: hscale(20),
    paddingHorizontal: wscale(40),
    textTransform: "capitalize"
  },
  inputIcon: {
  marginRight: wscale(10),
},
});
