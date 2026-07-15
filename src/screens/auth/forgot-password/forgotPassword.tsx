import React, { useRef, useState } from "react";
import Logo from "@/src/components/logo";
import ScreenHeadingText from "@/src/components/screenHeadingText";
import Icon from "@expo/vector-icons/Feather";

import { View, Text, StyleSheet, TextInput, Alert, Image } from "react-native";
import { globalStyles } from "@/src/styles/global";
import { colors } from "@/src/constants/theme";

import { hscale, mscale, wscale } from "@/src/helpers/metric";

import PrimaryButton from "@/src/components/primaryButton";
import { PUB_API_CLIENT } from "@/src/api/apiClient";
import { useNavigation } from "@react-navigation/native";
import LoadingView from "@/src/components/loadingView";
import ErrorModal from "@/src/components/errorModal";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ForgotPassword() {
  const inputRef = useRef<TextInput>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFormSubmit = async () => {
    inputRef.current?.blur();
    console.log("The email", email);

    if (!email) return;
    setLoading(true);
    try {
      //forgotPassword
      const res = await PUB_API_CLIENT.post("users/forgotten/password/otp", {
        callback: "https://www.solvaafrica.com",
        email: email.trim(),
      });

      if (res.status === 200) {
        setLoading(false);

        const userId = res.data.userId;
        await AsyncStorage.setItem("userId", String(userId));
        navigation.navigate("App", { screen: "otpforgotPassword" });

        
      }
    } catch (error: any) {
      setLoading(false);
      console.log("Error in forgot password", error.response);

      const status = error?.response?.status ?? error?.status;

      if (status === 400 || status === 401) {
        const message = "Error, check email and try again Try again!";
        setErrorMessage(message);
        setErrorVisible(true);
        return;
      }

      if (status === 500) {
        const message = "Server error, please try again later!";
        setErrorMessage(message);
        setErrorVisible(true);
        return;
      }

      if (status === 404) {
        const message = "Email not found!";
        setErrorMessage(message);
        setErrorVisible(true);
        return;
      }

      // Alert.alert("Error", "Something went wrong!");
      const message = "Something went wrong!";
      setErrorMessage(message);
      setErrorVisible(true);
    } finally {
      console.log("Operation complete");
      setLoading(false);
    }
  };

  return (
    <View style={globalStyles.screen}>
      <View style={{ marginHorizontal: "auto" }}>
        <Logo />
      </View>

      <View
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 30,
          justifyContent: "space-between",
          marginTop: 20,
          // height: hscale(400),
        }}
      >
        <Image
          source={require("../../../../assets/images/forgotP.png")}
          style={{
            height: hscale(213),
            width: wscale(208),
            // backgroundColor: "#D9D9D9",
            marginHorizontal: "auto",
          }}
        />

        <ScreenHeadingText
          text="update your password"
          customStyle={{ textAlign: "center", marginVertical: "auto" }}
        />
        <Text
          style={{
            fontSize: mscale(17),
            color: colors.bodyText,
            textAlign: "center",
            fontFamily: "Inter-Regular",
          }}
        >
          Enter your email address
        </Text>

        <View style={styles.inputView}>
          <Icon name="mail" size={20} color={colors.primary} />
          <TextInput
            ref={inputRef}
            placeholderTextColor={colors.placeholderInput}
            placeholder="Email Address"
            style={styles.input}
            onChangeText={(text) => setEmail(text)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false} 
          />
        </View>

        <PrimaryButton text="Next" onPress={handleFormSubmit} />

        <LoadingView isLoading={loading} />
      </View>
      <ErrorModal
        visible={errorVisible}
        message={errorMessage}
        onClose={() => setErrorVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputView: {
    flexDirection: "row",
    alignItems: "center",
    height: hscale(50),
    backgroundColor: colors.inputField,
    paddingHorizontal: wscale(20),
    borderRadius: mscale(50),
  },
  input: {
    flex: 1,
    height: "100%",
    fontFamily: "Inter-Bold",
    color: colors.black,
    fontSize: mscale(14),
    paddingLeft: wscale(8),
  },
});
