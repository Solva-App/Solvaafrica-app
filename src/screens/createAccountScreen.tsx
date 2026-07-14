import {
  Text,
  TextInput,
  View,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import ToastManager, { Toast } from "toastify-react-native";
import Icon from "@expo/vector-icons/Feather";
import { Formik, FormikProps } from "formik";
import { useState } from "react";
import * as Yup from "yup";
import { router } from "expo-router";

import ScreenHeadingText from "../components/screenHeadingText";
import { hscale, mscale, wscale } from "../helpers/metric";
import TextLinkButton from "../components/textLinkButton";
import PrimaryButton from "../components/primaryButton";
import { PUB_API_CLIENT } from "../api/apiClient";
import { globalStyles } from "../styles/global";
import { colors } from "../constants/theme";
import Logo from "../components/logo";

interface IFormValues {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  referral: string;
}

const requiredFieldMessage = "This field is required";

const CreateAccountSchema = Yup.object().shape({
  fullName: Yup.string()
    .test("fullName", "Kindly provide a last name", (value) => {
      if (!value) return false;
      const names = value.trim().split(" ");
      return names.length >= 2;
    })
    .min(2, "Name cannot be less than 2 characters")
    .required(requiredFieldMessage),
  email: Yup.string()
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Kindly provide a valid email address",
    )
    .required(requiredFieldMessage),
  phone: Yup.string().max(14).required(requiredFieldMessage),
  password: Yup.string()
    .min(8, "Minimum password length allowed is 8")
    .required(requiredFieldMessage),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Password must match")
    .required(requiredFieldMessage),
  referral: Yup.string(),
});

export default function CreateAccountScreen() {
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const initialValues: IFormValues = {
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    referral: "",
  };

  const handleFormSubmit = async (values: IFormValues) => {
    const { fullName, email, phone, password, referral } = values;
    if (!agreeTerms) {
      Toast.error("Accept user terms and agreement");
      return;
    }

    try {
      setIsLoading(true);
      const createUserRes = await PUB_API_CLIENT.post("/users/create", {
        fullName,
        email,
        phone,
        password,
        referral,
      });
      console.log({ createUserRes: createUserRes.data });

      if (createUserRes.status === 201) {
        // ✅ NAVIGATE TO LOGIN
        router.replace("/(auth)/login");
        return;
      }
    } catch (error: any) {
      console.log("Error creating user", error.response.data);

      const status = error?.response?.status ?? error?.status;
      if (status === 401 || status === 400) {
        const message = error?.response?.data?.message || "Invalid input";
        Toast.error(message);
        return;
      }

      let message = "Error, Something went wrong!";
      Toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.logoContainer}>
        <Logo />
      </View>

      <ScreenHeadingText
        text="create your account"
        customStyle={styles.heading}
      />
      <Text style={styles.subtitle}>Fill in your details accurately</Text>

      <Formik
        initialValues={initialValues}
        onSubmit={(values) => handleFormSubmit(values)}
        validationSchema={CreateAccountSchema}
      >
        {({
          handleBlur,
          handleChange,
          handleSubmit,
          values,
          errors,
        }: FormikProps<IFormValues>) => (
          <View style={styles.formContainer}>
            {/* full name input field */}
            <View>
              <View style={styles.inputView}>
                <Icon name="user" size={20} color={colors.primary} />
                <TextInput
                  autoCapitalize="words"
                  placeholderTextColor={colors.placeholderInput}
                  placeholder="Full Name"
                  onChangeText={handleChange("fullName")}
                  onBlur={handleBlur("fullName")}
                  value={values.fullName}
                  style={styles.input}
                />
              </View>
              {errors.fullName && (
                <Text style={styles.errorText}>{errors.fullName}</Text>
              )}
            </View>

            {/* email input field */}
            <View>
              <View style={styles.inputView}>
                <Icon name="mail" size={20} color={colors.primary} />
                <TextInput
                  placeholderTextColor={colors.placeholderInput}
                  placeholder="Email Address"
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  value={values.email}
                  style={styles.input}
                />
              </View>
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            {/* phone input field */}
            <View>
              <View style={styles.inputView}>
                <Icon name="phone" size={20} color={colors.primary} />
                <TextInput
                  placeholderTextColor={colors.placeholderInput}
                  placeholder="Phone"
                  keyboardType="phone-pad"
                  onChangeText={handleChange("phone")}
                  onBlur={handleBlur("phone")}
                  value={values.phone}
                  style={styles.input}
                />
              </View>
              {errors.phone && (
                <Text style={styles.errorText}>{errors.phone}</Text>
              )}
            </View>

            {/* password input field */}
            <View>
              <View style={styles.inputView}>
                <Icon name="lock" size={20} color={colors.primary} />
                <TextInput
                  secureTextEntry={!showPassword}
                  placeholderTextColor={colors.placeholderInput}
                  placeholder="Password"
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  value={values.password}
                  style={styles.input}
                />
                <Icon
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={colors.primary}
                  onPress={() => setShowPassword((prev) => !prev)}
                />
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            {/* confirm password input field */}
            <View>
              <View style={styles.inputView}>
                <Icon name="lock" size={20} color={colors.primary} />
                <TextInput
                  secureTextEntry={!showConfirmPassword}
                  placeholderTextColor={colors.placeholderInput}
                  placeholder="Confirm Password"
                  onChangeText={handleChange("confirmPassword")}
                  onBlur={handleBlur("confirmPassword")}
                  value={values.confirmPassword}
                  style={styles.input}
                />
                <Icon
                  name={showConfirmPassword ? "eye-off" : "eye"}
                  size={20}
                  color={colors.primary}
                  onPress={() => setShowConfirmPassword((prev) => !prev)}
                />
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            {/* referral code input field */}
            <View>
              <View style={styles.inputView}>
                <Icon name="share-2" size={20} color={colors.primary} />
                <TextInput
                  placeholderTextColor={colors.placeholderInput}
                  placeholder="Referral Code"
                  onChangeText={handleChange("referral")}
                  onBlur={handleBlur("referral")}
                  value={values.referral}
                  style={styles.input}
                />
              </View>
              {errors.referral && (
                <Text style={styles.errorText}>{errors.referral}</Text>
              )}
            </View>

            <View style={styles.termsContainer}>
              <Icon
                name={agreeTerms ? "check-square" : "square"}
                size={20}
                color={colors.primary}
                style={{ marginRight: wscale(8) }}
                onPress={() => setAgreeTerms(!agreeTerms)}
              />
              <TextLinkButton
                text="By checking this box, you agree to our terms/conditions."
                onPress={() => router.push("/(auth)/terms-and-conditions")}
                customStyle={{ textAlign: "left", color: colors.textLink }}
              />
            </View>

            {/* create account button */}
            <PrimaryButton
              text="create account"
              onPress={handleSubmit}
              isLoading={isLoading}
            />
          </View>
        )}
      </Formik>

      <Text style={styles.haveAccount}>
        Already have an account?{" "}
        <TextLinkButton
          customStyle={{ color: colors.textLink }}
          text="Log in"
          onPress={() => router.push("/(auth)/login")}
        />
      </Text>

      <ToastManager />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    paddingHorizontal: 40,
    paddingVertical: 40,
    paddingBottom: 60,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  heading: {
    textAlign: "center",
    marginTop: 20,
  },
  subtitle: {
    color: colors.bodyText,
    textAlign: "center",
    fontFamily: "Inter-Regular",
    marginBottom: 20,
  },
  formContainer: {
    gap: 16,
  },
  inputView: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    backgroundColor: colors.inputField,
    paddingHorizontal: 20,
    borderRadius: 50,
  },
  input: {
    flex: 1,
    height: "100%",
    fontFamily: "Inter-Bold",
    color: colors.black,
    fontSize: mscale(14),
    paddingLeft: wscale(8),
    borderWidth: 0,
    ...Platform.select({
      web: {
        outlineStyle: "none",
        outlineWidth: 0,
      } as any,
    }),
  },
  errorText: {
    fontFamily: "Inter-Medium",
    color: "red",
    fontSize: 12,
    marginLeft: 20,
    marginTop: 4,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  haveAccount: {
    fontFamily: "Inter-Regular",
    color: colors.bodyText,
    fontSize: 14,
    textAlign: "center",
    marginTop: 30,
  },
});
