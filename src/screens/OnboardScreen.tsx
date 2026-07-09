import { ScrollView, StyleSheet, Text, View, Image } from "react-native";
import { router } from "expo-router";
import { colors, screenHorizontalPadding } from "../constants/theme";
import TextLinkButton from "../components/textLinkButton";
import PrimaryButton from "../components/primaryButton";
import Logo from "../components/logo";
import { hscale, mscale } from "../helpers/metric";
import { globalStyles } from "../styles/global";

export default function OnboardScreen() {
  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={{ flexGrow: 1, justifyContent: "space-between" }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        
        {/* Top Logo */}
        <View style={styles.logoContainer}>
          <Logo />
        </View>

        {/* 2x2 Image Group */}
        <View style={styles.onboardImageView}>
          <Image
            source={require("../../assets/images/onboardGroup.png")}
            style={styles.onboardImage}
            resizeMode="contain"
          />
        </View>

        {/* Text and Actions */}
        <View style={styles.onboardModal}>
          <View style={styles.onboardWelcome}>
            <Text style={[globalStyles.headlineText, styles.welcomeTitle]}>
              Welcome to Solva
            </Text>
            <View style={{ height: hscale(12) }} />
            <Text style={[globalStyles.bodyText, styles.welcomeSubtitle]}>
              It's good to have you back. Always a good time to learn and earn
            </Text>
          </View>

          {/* buttons */}
          <PrimaryButton
            text="Get Started"
            onPress={() => router.push('/(auth)/create-account')}
          />
          
          <View style={styles.loginContainer}>
            <Text style={styles.loginPromptText}>Already have an account? </Text>
            <TextLinkButton
              text="Log in"
              customStyle={styles.loginLinkText}
              onPress={() => router.push('/(auth)/login')}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#ffffff', 
  },
  
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: screenHorizontalPadding,
    paddingTop: hscale(60),
    paddingBottom: hscale(40),
    justifyContent: "space-between",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: hscale(30),
  },
  onboardImage: {
    width: "100%",
    height: "100%",
  },
  onboardImageView: {
    width: "100%",
    height: hscale(320),
    maxHeight: 380,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hscale(30),
  },
  onboardWelcome: {
    marginBottom: hscale(30),
    alignItems: "center",
  },
  onboardModal: {
    paddingHorizontal: mscale(10),
    justifyContent: "center",
  },
  welcomeTitle: {
    textAlign: "center",
    fontFamily: "Inter-Bold",
    fontSize: mscale(24),
    color: "#0F172A",
  },
  welcomeSubtitle: {
    textAlign: "center",
    paddingHorizontal: mscale(10),
    lineHeight: mscale(22),
    fontSize: mscale(15),
    color: "#64748B",
    fontFamily: "Inter-Regular",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: hscale(20),
  },
  loginPromptText: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(14),
    color: "#1A171C",
  },
  loginLinkText: {
    color: "#C41A66", // Pinkish/magenta from the design
    fontFamily: "Inter-Medium",
    fontSize: mscale(14),
  },
});