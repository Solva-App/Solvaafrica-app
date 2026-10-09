import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function TaskHubScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Standard');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View style={styles.headerPill}>
          <View style={styles.greenDot} />
          <Text style={styles.headerPillText}>SOLVA TASK HUB</Text>
        </View>

        <Text style={styles.mainTitle}>
          Micro-Tasks. <Text style={styles.purpleText}>Real{'\n'}Rewards.</Text> Fast Execution.
        </Text>
        <Text style={styles.subtitle}>
          The bridge connecting university student talent with global brands and cutting-edge enterprise AI.
        </Text>

        <View style={styles.tagsRow}>
          <View style={styles.smallTag}>
            <Text style={styles.smallTagText}>⚡ 72h Payout Escrow</Text>
          </View>
          <View style={styles.smallTag}>
            <Text style={styles.smallTagText}>🎓 100% University Verified</Text>
          </View>
        </View>

        {/* Company Card */}
        <View style={styles.cardContainer}>
          <View style={styles.cardHeader}>
            <View style={styles.companyPill}>
              <Text style={styles.companyPillText}>FOR COMPANIES & BRANDS</Text>
            </View>
            <View style={styles.iconCircleWhite}>
              <MaterialCommunityIcons name="domain" size={16} color="#64748b" />
            </View>
          </View>
          <Text style={styles.cardTitle}>Launch a Task Campaign</Text>
          <Text style={styles.cardDesc}>
            Tap into thousands of verified university students to collect AI data, create authentic campus content, or run market research.
          </Text>
          <TouchableOpacity style={styles.companyBtn} activeOpacity={0.85} onPress={() => router.push('/create-task')}>
            <Feather name="plus-circle" size={18} color="#fff" style={styles.btnIcon} />
            <Text style={styles.companyBtnText}>Post a Task</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={{ alignSelf: 'center', marginTop: 12, padding: 8 }} 
            onPress={() => router.push('/manage-campaigns')}
          >
            <Text style={{ fontFamily: 'Inter-Medium', fontSize: 13, color: '#4800B2' }}>
              Manage existing campaigns →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Student Card */}
        <View style={[styles.cardContainer, styles.studentCardBg]}>
          <View style={styles.cardHeader}>
            <View style={styles.studentPill}>
              <Text style={styles.studentPillText}>FOR UNIVERSITY STUDENTS</Text>
            </View>
            <View style={styles.iconCirclePurple}>
              <MaterialCommunityIcons name="school-outline" size={16} color="#4800B2" />
            </View>
          </View>
          <Text style={styles.cardTitle}>Earn by Completing Tasks</Text>
          <Text style={styles.cardDesc}>
            Turn your spare time into money. Complete high-value micro-tasks in AI, text synthesis, content creation, and surveys right from your phone.
          </Text>
          <TouchableOpacity 
            style={styles.studentBtn} 
            activeOpacity={0.85}
            onPress={() => router.push('/explore-tasks')}
          >
            <Feather name="check-square" size={18} color="#fff" style={styles.btnIcon} />
            <Text style={styles.studentBtnText}>View & Start Tasks</Text>
          </TouchableOpacity>
        </View>

        {/* Payout Guarantee */}
        <View style={styles.guaranteeBox}>
          <View style={styles.guaranteeIconWrap}>
            <MaterialCommunityIcons name="shield-check-outline" size={20} color="#ffffff" />
          </View>
          <View style={styles.guaranteeTextWrap}>
            <Text style={styles.guaranteeTitle}>PAYOUT GUARANTEE</Text>
            <Text style={styles.guaranteeDesc}>
              Standard Payout Window: Rewards are verified and credited to your Solva Wallet within 72 hours of review.
            </Text>
          </View>
        </View>

        {/* How Solva Tasks Work */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>How Solva Tasks Work</Text>
            <Text style={styles.sectionSubtitle}>Simple, predictable steps to get paid</Text>
          </View>
          <MaterialCommunityIcons name="swap-horizontal" size={24} color="#64748b" />
        </View>

        <View style={styles.tabSwitcher}>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'Standard' && styles.tabBtnActive]}
            onPress={() => setActiveTab('Standard')}
          >
            <Text style={[styles.tabText, activeTab === 'Standard' && styles.tabTextActive]}>Standard Micro-Tasks</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'UGC' && styles.tabBtnActive]}
            onPress={() => setActiveTab('UGC')}
          >
            <Text style={[styles.tabText, activeTab === 'UGC' && styles.tabTextActive]}>UGC & Content (Pre-Approval)</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.stepperContainer}>
          {activeTab === 'Standard' ? (
            <>
              <View style={styles.stepperCategoryPill}>
                <MaterialCommunityIcons name="check-decagram-outline" size={14} color="#4800B2" style={{marginRight: 6}} />
                <Text style={styles.stepperCategoryText}>Standard Micro-Tasks: Data, AI, Audio, Surveys & Testing</Text>
              </View>

              <View style={styles.stepItem}>
                <View style={styles.stepNumCircle}>
                  <Text style={styles.stepNumText}>1</Text>
                </View>
                <View style={styles.stepLine} />
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Browse & Select</Text>
                  <Text style={styles.stepDesc}>Pick an open task matching your skills or campus location.</Text>
                </View>
              </View>

              <View style={styles.stepItem}>
                <View style={styles.stepNumCircle}>
                  <Text style={styles.stepNumText}>2</Text>
                </View>
                <View style={styles.stepLine} />
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Review Guidelines</Text>
                  <Text style={styles.stepDesc}>Read instructions, rules, and submission requirements carefully.</Text>
                </View>
              </View>

              <View style={styles.stepItem}>
                <View style={styles.stepNumCircle}>
                  <Text style={styles.stepNumText}>3</Text>
                </View>
                <View style={styles.stepLine} />
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Execute & Submit</Text>
                  <Text style={styles.stepDesc}>Complete the work and upload your proof directly in the app.</Text>
                </View>
              </View>

              <View style={styles.stepItem}>
                <View style={styles.stepNumCircleDone}>
                  <Feather name="check" size={14} color="#16a34a" />
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>72-Hour Review & Payout</Text>
                  <Text style={styles.stepDesc}>Submissions are reviewed and paid out within 72 hours.</Text>
                </View>
              </View>
            </>
          ) : (
            <>
              <View style={[styles.stepperCategoryPill, { borderBottomWidth: 1, borderColor: '#F1F5F9', paddingBottom: 12, marginBottom: 16, backgroundColor: 'transparent', borderWidth: 0, paddingHorizontal: 0 }]}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <MaterialCommunityIcons name="video-outline" size={16} color="#4800B2" style={{marginRight: 6}} />
                  <Text style={[styles.stepperCategoryText, {fontSize: 12}]}>Content & Brand Campaigns</Text>
                </View>
                <Text style={[styles.stepperCategoryText, { color: '#64748b', fontSize: 10, textAlign: 'right', flex: 1, marginLeft: 16 }]}>Videos, UGC, Campus Socials</Text>
              </View>

              <View style={styles.stepItem}>
                <View style={styles.stepNumCircle}>
                  <Text style={styles.stepNumText}>1</Text>
                </View>
                <View style={styles.stepLine} />
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Claim & Draft</Text>
                  <Text style={styles.stepDesc}>Review the creative brief and produce your authentic raw draft video.</Text>
                </View>
              </View>

              <View style={styles.stepItem}>
                <View style={styles.stepNumCircle}>
                  <Text style={styles.stepNumText}>2</Text>
                </View>
                <View style={styles.stepLine} />
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Pre-Submission Upload</Text>
                  <Text style={styles.stepDesc}>Upload draft securely inside Solva before posting publicly for client review.</Text>
                </View>
              </View>

              <View style={styles.stepItem}>
                <View style={styles.stepNumCircle}>
                  <Text style={styles.stepNumText}>3</Text>
                </View>
                <View style={styles.stepLine} />
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Approval & Live Post</Text>
                  <Text style={styles.stepDesc}>Once client approves, publish the post to your active social media handles.</Text>
                </View>
              </View>

              <View style={styles.stepItem}>
                <View style={styles.stepNumCircleDone}>
                  <MaterialCommunityIcons name="check-all" size={14} color="#16a34a" />
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Link Submission & Payout</Text>
                  <Text style={styles.stepDesc}>Submit the public link to Solva. Verification and automatic release complete within 72 hours.</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Explore Task Categories */}
        <View style={[styles.sectionHeader, { marginTop: 40 }]}>
          <View>
            <Text style={styles.sectionTitle}>Explore Task Categories</Text>
            <Text style={styles.sectionSubtitle}>Diverse gigs matched to student skills</Text>
          </View>
          <View style={styles.categoriesPill}>
            <Text style={styles.categoriesPillText}>Categories</Text>
          </View>
        </View>

        <View style={styles.categoriesGrid}>
          {[
            { icon: 'database', name: 'AI & Data Eval', sub: 'Model checks & RLH', color: '#6366f1' },
            { icon: 'fountain-pen-tip', name: 'Prompt Writing', sub: 'Creative & synthetic', color: '#d946ef' },
            { icon: 'microphone-outline', name: 'Audio & Voice', sub: 'Speech datasets', color: '#3b82f6' },
            { icon: 'image-filter-center-focus-strong-outline', name: 'Image Annotation', sub: 'Vision labeling', color: '#f59e0b' },
            { icon: 'video-outline', name: 'Content (UGC)', sub: 'Campus reels & TikTok', color: '#ec4899' },
            { icon: 'bullhorn-outline', name: 'Marketing', sub: 'Brand outreach', color: '#8b5cf6' },
            { icon: 'clipboard-text-outline', name: 'Surveys & Research', sub: 'Campus insights', color: '#64748b' },
            { icon: 'cellphone', name: 'App Testing', sub: 'QA & bug reporting', color: '#10b981' },
            { icon: 'book-open-outline', name: 'Tutoring & Academics', sub: 'Study cohorts', color: '#8b5cf6' },
            { icon: 'tune', name: 'Custom Tasks', sub: 'Specialized briefs', color: '#64748b' },
          ].map((cat, i) => (
            <View key={i} style={styles.categoryCard}>
              <View style={[styles.catIconWrap, { backgroundColor: `${cat.color}15` }]}>
                <MaterialCommunityIcons name={cat.icon as any} size={20} color={cat.color} />
              </View>
              <View style={styles.catTextWrap}>
                <Text style={styles.catName}>{cat.name}</Text>
                <Text style={styles.catSub}>{cat.sub}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Bottom Banner */}
        <LinearGradient
          colors={['#0f172a', '#1e1b4b']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bottomBanner}
        >
          <View style={styles.bannerHeader}>
            <MaterialCommunityIcons name="shield-check" size={20} color="#10b981" />
            <Text style={styles.bannerTitle}>Targeted Audience. Verified Results.</Text>
          </View>
          <Text style={styles.bannerDesc}>
            Every task on Solva is backed by verified student accounts and structured algorithmic quality reviews.
          </Text>
          <View style={styles.bannerInnerCard}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={styles.greenDot} />
              <Text style={styles.bannerInnerCardText}>100% Student Verified</Text>
            </View>
            <MaterialCommunityIcons name="fingerprint" size={20} color="#10b981" />
          </View>
        </LinearGradient>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  headerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF', // Light purple bg
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  headerPillText: {
    color: '#4800B2',
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  mainTitle: {
    fontFamily: 'serif',
    fontSize: 32,
    color: '#0f172a',
    lineHeight: 38,
    marginBottom: 12,
  },
  purpleText: {
    color: '#4800B2',
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 16,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  smallTag: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  smallTagText: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: '#334155',
  },
  
  // Cards
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 2 },
    }),
  },
  studentCardBg: {
    backgroundColor: '#FAF5FF',
    borderColor: '#F3E8FF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  companyPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  companyPillText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#475569',
  },
  iconCircleWhite: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentPill: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  studentPillText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#4800B2',
  },
  iconCirclePurple: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E9D5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#0f172a',
    marginBottom: 8,
  },
  cardDesc: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 20,
  },
  companyBtn: {
    backgroundColor: '#0f172a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  companyBtnText: {
    color: '#fff',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  studentBtn: {
    backgroundColor: '#4800B2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  studentBtnText: {
    color: '#fff',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  btnIcon: {
    marginRight: 8,
  },

  // Guarantee Box
  guaranteeBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 32,
  },
  guaranteeIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  guaranteeTextWrap: {
    flex: 1,
  },
  guaranteeTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#166534',
    marginBottom: 4,
  },
  guaranteeDesc: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#166534',
    lineHeight: 18,
  },

  // Sections
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#0f172a',
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748b',
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#64748b',
  },
  tabTextActive: {
    color: '#4800B2',
    fontFamily: 'Inter-Bold',
  },

  // Stepper
  stepperContainer: {
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  stepperCategoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 20,
  },
  stepperCategoryText: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: '#4800B2',
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  stepNumCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  stepNumCircleDone: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  stepNumText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#4800B2',
  },
  stepLine: {
    position: 'absolute',
    top: 24,
    left: 11,
    bottom: -8, // connect to next
    width: 2,
    backgroundColor: '#E2E8F0',
    zIndex: 1,
  },
  stepContent: {
    flex: 1,
    paddingLeft: 16,
    paddingBottom: 24, // spacing between items
  },
  stepTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#0f172a',
    marginBottom: 4,
  },
  stepDesc: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
  },

  // Categories Grid
  categoriesPill: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoriesPillText: {
    color: '#4800B2',
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4 },
      android: { elevation: 1 },
    }),
  },
  catIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  catTextWrap: {
    flex: 1,
  },
  catName: {
    fontFamily: 'Inter-Bold',
    fontSize: 11,
    color: '#0f172a',
    marginBottom: 2,
  },
  catSub: {
    fontFamily: 'Inter-Regular',
    fontSize: 9,
    color: '#64748b',
  },

  // Bottom Banner
  bottomBanner: {
    borderRadius: 20,
    padding: 24,
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bannerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 15,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  bannerDesc: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 18,
    marginBottom: 20,
  },
  bannerInnerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 12,
    borderRadius: 12,
  },
  bannerInnerCardText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#e2e8f0',
  }
});
