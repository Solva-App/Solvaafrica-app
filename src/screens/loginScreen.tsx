import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  Platform,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "@expo/vector-icons/Feather";
import { useRef, useState } from "react";
import { router } from "expo-router";
import { BlurView } from "expo-blur";

import { UserProfile, ILoginForm, Tokens } from "../types";
import { hscale, mscale, wscale } from "../helpers/metric";
import LoadingView from "../components/loadingView";
import { useAuthStore } from "../stores/authStore";
import { PUB_API_CLIENT } from "../api/apiClient";
import Logo from "../components/logo";
import ErrorModal from "../components/errorModal";
import { normalizeUserProfile } from "../helpers/freelancerProfile";

export default function LoginScreen() {
  const [form, setForm] = useState<ILoginForm>({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const passwordRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);

  const handleFormSubmit = async () => {
    emailRef.current?.blur();
    
    const { email, password } = form;

    if (!email || !password) return;
    setIsLoading(true);
    try {
      const res = await PUB_API_CLIENT.post("/users/login", form);

      if (res.status === 200) {
        const { data: userData } = res.data;
        const userId = userData.user.id;
        const tokens = userData.tokens;

        const getUserRes = await PUB_API_CLIENT.get(`/users/${userId}`, {
          headers: { Authorization: `Bearer ${tokens.accessToken}` },
        });

        if (getUserRes.status === 200) {
          const { data } = getUserRes.data;
          const userProfile: UserProfile = normalizeUserProfile(data, {
            userID: userId,
          });

          // Check if there is a cached profile image uploaded previously on this device
          try {
            const cachedPic = await AsyncStorage.getItem(`profileImageUri_${userId}`);
            if (cachedPic && !userProfile.profilePic) {
              userProfile.profilePic = cachedPic;
            }
          } catch (e) {
            console.log("Error reading cached profile pic on login:", e);
          }

          const user: { profile: UserProfile; tokens: Tokens | null } = {
            profile: userProfile,
            tokens,
          };

          await AsyncStorage.setItem("User", JSON.stringify(user));
          useAuthStore.setState((state) => ({ ...state, user }));

          router.replace("/(tabs)");
          return;
        }
      }
    } catch (error: any) {
      let message = "Something went wrong!";
      const status = error?.response?.status ?? error?.status;
      if (status === 400 || status === 401) {
        message = "Email or Password is incorrect. Try again!";
      }
      setErrorMessage(message);
      setErrorVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* Background Image */}
      <ImageBackground source={require('../../assets/images/login-bg.png')} style={styles.bgImage}>
        <View style={styles.overlay} />
        
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <BlurView intensity={80} tint="light" style={styles.glassCard}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Logo />
            </View>

            {/* Text Headers */}
            <Text style={styles.headingText}>WELCOME BACK</Text>
            <Text style={styles.subtitleText}>
              It's good to have you back. Ready{"\n"}to EARN and LEARN?
            </Text>

            {/* Form Inputs */}
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Icon name="mail" size={mscale(20)} color="#6B21A8" style={styles.inputIcon} />
                <TextInput
                  ref={emailRef}
                  style={styles.textInput}
                  placeholder="Email Address"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  value={form.email}
                  onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
                />
              </View>

              <View style={styles.inputContainer}>
                <Icon name="lock" size={mscale(20)} color="#6B21A8" style={styles.inputIcon} />
                <TextInput
                  ref={passwordRef}
                  style={styles.textInput}
                  placeholder="Password"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry={!showPassword}
                  value={form.password}
                  onChangeText={(text) => setForm((prev) => ({ ...prev, password: text }))}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                  <Icon name={showPassword ? "eye" : "eye-off"} size={mscale(20)} color="#4b5563" style={styles.eyeIcon} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password aligned right */}
            <TouchableOpacity 
              style={styles.forgotPasswordBtn} 
              onPress={() => router.push("/(auth)/forgot-password")}
              hitSlop={8}
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Log in Button */}
            <TouchableOpacity style={styles.loginBtn} activeOpacity={0.85} onPress={handleFormSubmit}>
              <Text style={styles.loginBtnText}>Log in</Text>
              <Icon name="arrow-right" size={20} color="#fff" style={styles.loginBtnIcon} />
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footerRow}>
              <Text style={styles.footerGreyText}>New to Solva? </Text>
              <TouchableOpacity hitSlop={8} onPress={() => router.push("/(auth)/create-account")}>
                <Text style={styles.footerRedText}>Sign up now</Text>
              </TouchableOpacity>
            </View>

          </BlurView>

          {/* Live Now Static Badge */}
          <View style={styles.liveBadge}>
            <View style={styles.avatarsWrapper}>
              <Image source={{ uri: 'https://randomuser.me/api/portraits/women/44.jpg' }} style={[styles.miniAvatar, { zIndex: 3 }]} />
              <Image source={{ uri: 'https://randomuser.me/api/portraits/men/46.jpg' }} style={[styles.miniAvatar, styles.avatarOverlap, { zIndex: 2 }]} />
              <Image source={{ uri: 'https://randomuser.me/api/portraits/women/68.jpg' }} style={[styles.miniAvatar, styles.avatarOverlap, { zIndex: 1 }]} />
              <View style={[styles.miniAvatar, styles.avatarOverlap, styles.avatarCountBadge, { zIndex: 0 }]}>
                <Text style={styles.avatarCountText}>+1k</Text>
              </View>
            </View>
            <View style={styles.liveRight}>
              <View style={styles.liveDotRow}>
                <View style={styles.liveDot} />
                <Text style={styles.liveTextBold}>LIVE NOW</Text>
              </View>
              <Text style={styles.liveTextSub}>Join 1,000+ students</Text>
            </View>
          </View>
          
        </ScrollView>
      </ImageBackground>

      <LoadingView isLoading={isLoading} />
      <ErrorModal
        visible={errorVisible}
        message={errorMessage}
        onClose={() => setErrorVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  bgImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)', 
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-end', // Push content towards the bottom
    paddingHorizontal: wscale(20),
    paddingTop: hscale(120), // Leave lots of space at top for background
    paddingBottom: hscale(30),
  },
  glassCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 36,
    paddingHorizontal: wscale(24),
    paddingTop: hscale(30),
    paddingBottom: hscale(30),
    alignItems: 'center',
    overflow: 'hidden',
    // fallback for web/android without true blur
    backgroundColor: Platform.OS === 'android' ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.6)',
  },
  
  logoContainer: {
    marginBottom: hscale(8),
    alignItems: "center",
  },
  headingText: {
    fontFamily: "serif",
    fontSize: mscale(14), // Smaller text as in image
    color: "#6B21A8", // purple
    marginBottom: hscale(10),
    textAlign: "center",
    letterSpacing: 0.5,
  },
  subtitleText: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(13),
    color: "#4b5563",
    textAlign: "center",
    lineHeight: mscale(20),
    marginBottom: hscale(24), // Less margin
  },

  formContainer: {
    width: "100%",
    gap: hscale(16),
    marginBottom: hscale(12),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.45)", // slightly more transparent to look like frosted inset
    borderRadius: mscale(24),
    height: hscale(50), // Thinner inputs
    paddingHorizontal: wscale(16),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
  },
  inputIcon: {
    marginRight: wscale(12),
  },
  textInput: {
    flex: 1,
    fontFamily: "Inter-Regular",
    fontSize: mscale(14),
    color: "#333",
    height: "100%",
    ...Platform.select({
      web: { outlineStyle: "none" } as any,
    }),
  },
  eyeIcon: {
    marginLeft: wscale(12),
  },

  forgotPasswordBtn: {
    alignSelf: 'flex-end',
    marginBottom: hscale(20),
    marginRight: wscale(8),
  },
  forgotPasswordText: {
    fontFamily: "Inter-Medium",
    fontSize: mscale(13),
    color: "#C22A2A", // Rust red
  },

  loginBtn: {
    width: "100%",
    backgroundColor: "#5E17EB", 
    borderRadius: mscale(25),
    height: hscale(50), // Thinner button
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hscale(24),
    shadowColor: "#5E17EB",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  loginBtnText: {
    fontFamily: "Inter-Medium",
    fontSize: mscale(15),
    color: "#ffffff",
  },
  loginBtnIcon: {
    marginLeft: wscale(8),
  },

  footerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerGreyText: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(14),
    color: "#4b5563",
  },
  footerRedText: {
    fontFamily: "Inter-Medium",
    fontSize: mscale(14),
    color: "#B91C1C",
  },

  // Live Badge
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 30,
    paddingVertical: hscale(12),
    paddingHorizontal: wscale(16),
    marginTop: hscale(20),
    width: '100%',
    maxWidth: 320, // constrain on large screens
  },
  avatarsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniAvatar: {
    width: mscale(32),
    height: mscale(32),
    borderRadius: mscale(16),
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarOverlap: {
    marginLeft: -mscale(12),
  },
  avatarCountBadge: {
    backgroundColor: '#5E17EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCountText: {
    color: '#fff',
    fontSize: mscale(10),
    fontFamily: 'Inter-Bold',
  },
  liveRight: {
    alignItems: 'flex-end',
  },
  liveDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A', // green
    marginRight: 6,
  },
  liveTextBold: {
    color: '#16A34A',
    fontSize: mscale(12),
    fontFamily: 'Inter-Bold',
  },
  liveTextSub: {
    color: '#4b5563',
    fontSize: mscale(10),
    fontFamily: 'Inter-Regular',
  }
});
