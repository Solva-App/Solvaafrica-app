import React from 'react';
import { ScrollView, StyleSheet, Text, View, Image, TouchableOpacity, Dimensions } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Logo from "../components/logo";

const { width } = Dimensions.get('window');

const FeatureCard = ({ iconName, iconColor, iconBg, title, titleColor, description, centered = false }: any) => (
  <View style={[styles.featureCard, centered && styles.featureCardCentered]}>
    <View style={[styles.featureIconContainer, { backgroundColor: iconBg }, centered && styles.featureIconContainerCentered]}>
      <MaterialCommunityIcons name={iconName} size={centered ? 28 : 24} color={iconColor} />
    </View>
    <Text style={[styles.featureTitle, { color: titleColor }, centered && { textAlign: 'center', fontSize: 18 }]}>{title}</Text>
    <Text style={[styles.featureDescription, centered && { textAlign: 'center' }]}>{description}</Text>
  </View>
);

export default function OnboardScreen() {
  return (
    <LinearGradient
      colors={['#F9F1FE', '#FFFFFF', '#FFFFFF', '#FFF7FB']}
      locations={[0, 0.4, 0.8, 1]}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Logo />
          </View>

          {/* Main Image with Badge */}
          <View style={styles.imageWrapper}>
            <View style={styles.imageShadowLayer}>
              <Image
                source={require("../../assets/images/onboardGroup.png")}
                style={styles.mainImage}
              />
            </View>
            
            {/* Badge positioned absolutely overlapping the bottom left */}
            <View style={styles.aiBadge}>
              <MaterialCommunityIcons name="star-four-points-outline" size={14} color="#63109E" />
              <Text style={styles.aiBadgeText}>AI Learning Ready</Text>
            </View>
          </View>

          {/* Text Content */}
          <View style={styles.textContainer}>
            <Text style={styles.titleText}>WELCOME TO{"\n"}SOLVA</Text>
            <Text style={styles.subtitleText}>
              Africa's Student Ecosystem. The one{"\n"}
              place where students <Text style={styles.purpleText}>learn, earn, build{"\n"}skills,</Text> and unlock opportunities.
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={styles.primaryButton}
              activeOpacity={0.8}
              onPress={() => router.push('/(auth)/create-account')}
            >
              <Text style={styles.primaryButtonText}>GET STARTED</Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" style={styles.buttonArrow} />
            </TouchableOpacity>
            
            <View style={styles.loginContainer}>
              <Text style={styles.loginPromptText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.loginLinkText}>Log in</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Social Proof Pill */}
          <View style={styles.socialProofCard}>
            <View style={styles.avatarsContainer}>
              <Image source={{uri: 'https://ui-avatars.com/api/?name=A&background=e0e7ff&color=4f46e5'}} style={[styles.avatar, {zIndex: 3}]} />
              <Image source={{uri: 'https://ui-avatars.com/api/?name=B&background=fce7f3&color=db2777'}} style={[styles.avatar, styles.avatarOverlap, {zIndex: 2}]} />
              <Image source={{uri: 'https://ui-avatars.com/api/?name=C&background=dcfce7&color=16a34a'}} style={[styles.avatar, styles.avatarOverlap, {zIndex: 1}]} />
              <View style={[styles.avatar, styles.avatarOverlap, styles.plusOneAvatar, {zIndex: 0}]}>
                <Text style={styles.plusOneText}>+1k</Text>
              </View>
            </View>
            <View style={styles.liveStatsContainer}>
              <View style={styles.liveIndicatorRow}>
                <View style={styles.greenDot} />
                <Text style={styles.liveNowText}>LIVE NOW</Text>
              </View>
              <Text style={styles.joinStudentsText}>Join 1,000+ students</Text>
            </View>
          </View>

          {/* Down Chevron */}
          <View style={styles.chevronContainer}>
            <MaterialCommunityIcons name="chevron-double-down" size={40} color="#A354EF" />
          </View>

          <View style={{ height: 40 }} />

          {/* Features */}
          <FeatureCard 
            centered 
            iconName="head-lightbulb-outline" 
            iconBg="#F3E8FF" 
            iconColor="#7E22CE" 
            title="Learn with AI" 
            titleColor="#6B21A8" 
            description="Personalized curriculum designed for the future of African tech. Master skills at your own pace with intelligent guidance." 
          />
          <FeatureCard 
            iconName="wallet-outline" 
            iconBg="#F3E8FF" 
            iconColor="#7E22CE" 
            title="Earn Money from Tasks" 
            titleColor="#6B21A8" 
            description="Complete micro tasks for global startups and get paid instantly." 
          />
          <FeatureCard 
            iconName="school-outline" 
            iconBg="#FFE4E6" 
            iconColor="#E11D48" 
            title="Access Scholarships" 
            titleColor="#9F1239" 
            description="Curated list of local and international educational funding." 
          />
          <FeatureCard 
            iconName="cloud-upload-outline" 
            iconBg="#F3E8FF" 
            iconColor="#7E22CE" 
            title="Upload Projects" 
            titleColor="#6B21A8" 
            description="Monetize your code and design assets through our marketplace." 
          />
          <FeatureCard 
            iconName="briefcase-outline" 
            iconBg="#F3E8FF" 
            iconColor="#7E22CE" 
            title="Sell Digital Skills" 
            titleColor="#6B21A8" 
            description="Connect with clients across the continent and build your career." 
          />

          {/* Bottom CTA */}
          <View style={styles.ctaBox}>
            <Text style={styles.ctaTitle}>Ready to start?</Text>
            <Text style={styles.ctaSubtitle}>Your future as a skilled professional starts here.</Text>
            <TouchableOpacity 
              style={styles.ctaButton}
              activeOpacity={0.8}
              onPress={() => router.push('/(auth)/create-account')}
            >
              <Text style={styles.ctaButtonText}>CREATE ACCOUNT</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  imageWrapper: {
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
    width: width * 0.7,
    height: width * 0.7,
    maxWidth: 320,
    maxHeight: 320,
  },
  imageShadowLayer: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#fff',
    elevation: 8,
    shadowColor: '#C4A1D9',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6, // creates a white border effect
  },
  mainImage: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    resizeMode: 'cover',
  },
  aiBadge: {
    position: 'absolute',
    bottom: -10,
    left: -20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  aiBadgeText: {
    color: '#63109E',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 36,
    width: '100%',
  },
  titleText: {
    fontSize: 22,
    textAlign: 'center',
    color: '#551187',
    fontFamily: 'serif',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  subtitleText: {
    fontSize: 15,
    textAlign: 'center',
    color: '#52525B',
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
  },
  purpleText: {
    color: '#551187',
    fontFamily: 'Inter-Medium',
  },
  actionContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 28,
  },
  primaryButton: {
    backgroundColor: '#610B99',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 30,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#610B99',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.5,
  },
  buttonArrow: {
    marginLeft: 8,
  },
  loginContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loginPromptText: {
    fontSize: 14,
    color: "#3F3F46",
    fontFamily: "Inter-Regular",
  },
  loginLinkText: {
    color: "#E11D48",
    fontSize: 14,
    fontFamily: "Inter-Medium",
  },
  socialProofCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    width: '100%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    marginBottom: 24,
  },
  avatarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarOverlap: {
    marginLeft: -10,
  },
  plusOneAvatar: {
    backgroundColor: '#7A13C6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusOneText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'Inter-Bold',
  },
  liveStatsContainer: {
    alignItems: 'flex-end',
  },
  liveIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  liveNowText: {
    fontSize: 11,
    color: '#10B981',
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.5,
  },
  joinStudentsText: {
    fontSize: 11,
    color: '#71717A',
    fontFamily: 'Inter-Medium',
  },
  chevronContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6,
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    width: '100%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
  },
  featureCardCentered: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  featureIconContainerCentered: {
    marginBottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  featureTitle: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#52525B',
    lineHeight: 22,
    fontFamily: 'Inter-Regular',
  },
  ctaBox: {
    backgroundColor: '#520A86',
    borderRadius: 32,
    padding: 40,
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
    elevation: 4,
    shadowColor: '#520A86',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  ctaTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: 'serif',
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  ctaSubtitle: {
    color: '#D8B4FE',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  ctaButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  ctaButtonText: {
    color: '#520A86',
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.5,
  }
});