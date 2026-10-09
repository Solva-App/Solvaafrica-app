import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTaskStore } from '../../store/useTaskStore';

const CATEGORIES = ['AI / DATA', 'MARKETING', 'AUDIO', 'SURVEY', 'VIDEO'];

export default function CampaignDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const campaigns = useTaskStore(state => state.campaigns);
  const updateCampaign = useTaskStore(state => state.updateCampaign);

  const campaign = campaigns.find(c => c.id === id) || campaigns[0];

  // Editable state
  const [title, setTitle] = useState(campaign?.title ?? '');
  const [category, setCategory] = useState(campaign?.category ?? 'AI / DATA');
  const [deadline, setDeadline] = useState(campaign?.deadline ?? '');
  const [totalSlots, setTotalSlots] = useState(String(campaign?.totalSlots ?? ''));
  const [rewardAmount, setRewardAmount] = useState(String(campaign?.rewardAmount ?? ''));
  const [overviewText, setOverviewText] = useState(
    'Read the prompt and two anonymized LLM candidate responses. Score both on a 5-point Likert scale across three strict dimensions: Factuality (zero hallucinations), Helpfulness, and Tone.'
  );

  // Banner image state
  const [bannerUri, setBannerUri] = useState<string | null>(null);

  const handlePickBanner = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow access to your photo library to upload a banner.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [5, 2],
      quality: 0.85,
    });
    if (!result.canceled && result.assets.length > 0) {
      setBannerUri(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (!campaign) return;
    updateCampaign(campaign.id, {
      title: title.trim(),
      category,
      deadline: deadline.trim(),
      totalSlots: parseInt(totalSlots, 10) || campaign.totalSlots,
      rewardAmount: parseFloat(rewardAmount) || campaign.rewardAmount,
    });
    Alert.alert('Saved', 'Campaign updated successfully!');
  };

  const renderRequirement = (text: string) => (
    <View style={styles.requirementRow} key={text}>
      <Feather name="check-circle" size={16} color="#10b981" style={{ marginRight: 12, marginTop: 2 }} />
      <Text style={styles.requirementText}>{text}</Text>
      <TouchableOpacity style={styles.trashBtn}>
        <Feather name="trash-2" size={14} color="#64748b" />
      </TouchableOpacity>
    </View>
  );

  const renderApplicant = (initials: string, name: string, details: string, batch: string) => (
    <View style={styles.applicantRow} key={name}>
      <View style={styles.applicantAvatar}>
        <Text style={styles.applicantInitials}>{initials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.applicantName}>{name}</Text>
        <Text style={styles.applicantDetails}>{details}</Text>
      </View>
      <View style={styles.batchPill}>
        <Text style={styles.batchPillText}>Batch</Text>
        <Text style={styles.batchPillTextBold}>#{batch}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="chevron-left" size={16} color="#475569" />
          <Text style={styles.backBtnText}>Back to Campaigns</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Main Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroPill}>
            <MaterialCommunityIcons name="magic-staff" size={12} color="#610B99" style={{ marginRight: 4 }} />
            <Text style={styles.heroPillText}>SPONSORED TASK • AI & DATA EVALUATION</Text>
          </View>

          <View style={styles.kineticRow}>
            <Feather name="zap" size={12} color="#d8b4fe" style={{ marginRight: 6 }} />
            <Text style={styles.kineticText}>KINETIC CAMPUS NATIONAL BROADCAST</Text>
          </View>

          <Text style={styles.heroTitle}>{title || campaign?.title}</Text>

          <View style={styles.sponsorCard}>
            <View style={styles.sponsorLogo}>
              <Text style={styles.sponsorLogoText}>A·L</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.sponsorName}>Anthropic & Lagos Tech Lab</Text>
                <MaterialCommunityIcons name="check-decagram" size={14} color="#3b82f6" style={{ marginLeft: 4 }} />
              </View>
              <Text style={styles.sponsorSub}>Kinetic Partner Ecosystem • Tier-1 AI Benchmark Sponsor</Text>
            </View>
          </View>

          <View style={styles.statusPill}>
            <View style={styles.greenDot} />
            <Text style={styles.statusPillText}>Accepting Submissions (14 days remaining)</Text>
          </View>

          <View style={styles.createdPill}>
            <Feather name="clock" size={12} color="#475569" style={{ marginRight: 6 }} />
            <Text style={styles.createdPillText}>Created 6 days ago</Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statCard}>
          <View style={styles.statHeaderRow}>
            <Text style={styles.statLabel}>TOTAL BUDGET</Text>
            <View style={styles.statIconBox}><MaterialCommunityIcons name="wallet-outline" size={16} color="#610B99" /></View>
          </View>
          <Text style={styles.statMainValue}>₦75,000</Text>
          <Text style={styles.statSubValueGreen}>₦28,200 remaining balance</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '40%', backgroundColor: '#16a34a' }]} />
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statHeaderRow}>
            <Text style={styles.statLabel}>WORKER QUOTA</Text>
            <View style={styles.statIconBox}><Feather name="users" size={16} color="#610B99" /></View>
          </View>
          <Text style={styles.statMainValue}>500 <Text style={styles.statMainSub}>Spots</Text></Text>
          <Text style={styles.statSubValueRegular}>312 filled, <Text style={{ color: '#610B99' }}>188 spots available</Text></Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '62%', backgroundColor: '#610B99' }]} />
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statHeaderRow}>
            <Text style={styles.statLabel}>TOTAL APPLICANTS</Text>
            <View style={styles.statIconBox}><Feather name="user-check" size={16} color="#475569" /></View>
          </View>
          <Text style={styles.statMainValue}>348 Students</Text>
          <Text style={styles.statSubValueRegular}>294 approved • <Text style={{ color: '#dc2626' }}>18 awaiting</Text> • 36 rejected</Text>
          <View style={[styles.progressBarBg, { flexDirection: 'row', backgroundColor: 'transparent' }]}>
            <View style={{ flex: 0.84, backgroundColor: '#16a34a', height: '100%', borderRadius: 4, marginRight: 2 }} />
            <View style={{ flex: 0.05, backgroundColor: '#610B99', height: '100%', borderRadius: 4, marginRight: 2 }} />
            <View style={{ flex: 0.11, backgroundColor: '#dc2626', height: '100%', borderRadius: 4 }} />
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statHeaderRow}>
            <Text style={styles.statLabel}>UNIT REWARD</Text>
            <View style={styles.statIconBox}><Feather name="tag" size={16} color="#610B99" /></View>
          </View>
          <Text style={[styles.statMainValue, { color: '#610B99' }]}>₦150</Text>
          <Text style={styles.statSubValueRegular}>per verified completed task</Text>
          <View style={styles.lightPill}>
            <Text style={styles.lightPillText}>Instant wallet disbursement</Text>
          </View>
        </View>

        {/* Campaign Brief Configuration */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderLeft}>
              <View style={styles.sectionIconCircle}>
                <Feather name="edit-3" size={16} color="#610B99" />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Campaign Brief{'\n'}Configuration</Text>
                <Text style={styles.sectionSubtitle}>Update active parameters,{'\n'}grading rubric & requirements</Text>
              </View>
            </View>
            <View style={styles.configModePill}>
              <Text style={styles.configModePillText}>Config{'\n'}Mode</Text>
            </View>
          </View>

          {/* CAMPAIGN TITLE — editable */}
          <Text style={styles.inputLabel}>CAMPAIGN TITLE</Text>
          <TextInput
            style={styles.inputBox}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter campaign title"
            placeholderTextColor="#94a3b8"
            multiline={false}
          />

          {/* CATEGORY — pill buttons */}
          <Text style={styles.inputLabel}>CATEGORY</Text>
          <View style={styles.categoryRow}>
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryPill, isSelected && styles.categoryPillSelected]}
                  onPress={() => setCategory(cat)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.categoryPillText, isSelected && styles.categoryPillTextSelected]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* DEADLINE — editable */}
          <Text style={styles.inputLabel}>DEADLINE</Text>
          <TextInput
            style={styles.inputBox}
            value={deadline}
            onChangeText={setDeadline}
            placeholder="e.g. Oct 12, 2026"
            placeholderTextColor="#94a3b8"
          />

          {/* WORKER COUNT — editable */}
          <Text style={styles.inputLabel}>WORKER QUOTA (TOTAL SPOTS)</Text>
          <TextInput
            style={styles.inputBox}
            value={totalSlots}
            onChangeText={setTotalSlots}
            placeholder="e.g. 500"
            placeholderTextColor="#94a3b8"
            keyboardType="numeric"
          />

          {/* PAY AMOUNT — editable */}
          <Text style={styles.inputLabel}>UNIT REWARD (₦)</Text>
          <TextInput
            style={styles.inputBox}
            value={rewardAmount}
            onChangeText={setRewardAmount}
            placeholder="e.g. 150"
            placeholderTextColor="#94a3b8"
            keyboardType="numeric"
          />

          {/* FULL OVERVIEW */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, marginBottom: 8 }}>
            <Text style={styles.inputLabel}>FULL OVERVIEW & STUDENT{'\n'}INSTRUCTIONS</Text>
            <Text style={styles.charCount}>{overviewText.length} / 3,000{'\n'}chars</Text>
          </View>
          <TextInput
            style={[styles.textAreaBox, { fontFamily: 'Inter-Regular', fontSize: 13, color: '#1e293b', lineHeight: 20 }]}
            value={overviewText}
            onChangeText={setOverviewText}
            multiline
            placeholder="Enter full overview and student instructions..."
            placeholderTextColor="#94a3b8"
            maxLength={3000}
            textAlignVertical="top"
          />

          {/* Requirements Checklist */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 12 }}>
            <View>
              <Text style={styles.subSectionTitle}>Requirements Checklist</Text>
              <Text style={styles.subSectionSubtitle}>Workers must satisfy every requirement before receiving payment</Text>
            </View>
            <TouchableOpacity style={styles.addBtn}>
              <Feather name="plus" size={12} color="#610B99" style={{ marginRight: 4 }} />
              <Text style={styles.addBtnText}>Add{'\n'}Requirement</Text>
            </TouchableOpacity>
          </View>

          {renderRequirement('Undergraduate or postgraduate student in an accredited Nigerian University')}
          {renderRequirement('Native or professional fluency in Nigerian English dialects and slang')}
          {renderRequirement('Completed Solva AI Benchmark Pre-Test with 90%+ accuracy')}

          {/* Save Changes Button */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
            <Feather name="save" size={14} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.saveBtnText}>Save Changes</Text>
          </TouchableOpacity>
        </View>

        {/* Brand Assets & Uploads */}
        <View style={styles.sectionCard}>
          <View style={[styles.sectionHeaderRow, { marginBottom: 20 }]}>
            <View style={styles.sectionHeaderLeft}>
              <View style={[styles.sectionIconCircle, { backgroundColor: '#F3E8FF' }]}>
                <Feather name="image" size={16} color="#610B99" />
              </View>
              <Text style={[styles.sectionTitle, { marginLeft: 12 }]}>Brand Assets &{'\n'}Uploads</Text>
            </View>
            <Text style={styles.linkedAssetsText}>3 Linked{'\n'}Assets</Text>
          </View>

          {/* Asset 1 — Sponsor Brand Mark */}
          <View style={styles.assetBox}>
            <View style={styles.assetAvatar}>
              <Text style={styles.assetAvatarText}>A·L</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.assetTitle}>Sponsor Brand Mark</Text>
              <Text style={styles.assetDesc}>anthropic_lagos_logo.svg{'\n'}• 48 KB</Text>
            </View>
            <TouchableOpacity style={styles.replaceBtn}>
              <Text style={styles.replaceBtnText}>Replace</Text>
            </TouchableOpacity>
          </View>

          {/* Asset 2 — Banner Graphic (functional upload) */}
          <View style={styles.assetBoxCol}>
            <View style={styles.assetHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Feather name="image" size={14} color="#610B99" style={{ marginRight: 8 }} />
                <Text style={styles.assetTitle}>Banner Graphic Preview</Text>
              </View>
              <TouchableOpacity style={styles.replaceBtn} onPress={handlePickBanner}>
                <Text style={styles.replaceBtnText}>{bannerUri ? 'Change' : 'Upload'}</Text>
              </TouchableOpacity>
            </View>

            {bannerUri ? (
              <Image
                source={{ uri: bannerUri }}
                style={styles.bannerImage}
                resizeMode="cover"
              />
            ) : (
              <TouchableOpacity style={styles.bannerPreviewBox} onPress={handlePickBanner} activeOpacity={0.8}>
                <Text style={styles.bannerSmallText}>DATASET PROMPT INSPECTOR</Text>
                <Text style={styles.bannerLargeText}>Eval Batch #4 - South-West Campuses</Text>
                <View style={styles.dimensionPill}>
                  <Text style={styles.dimensionPillText}>1200x480</Text>
                </View>
                <View style={styles.uploadOverlay}>
                  <Feather name="upload-cloud" size={22} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.uploadOverlayText}>Tap to upload banner</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Asset 3 — CSV */}
          <View style={styles.assetBox}>
            <View style={[styles.assetAvatar, { backgroundColor: '#4ade80' }]}>
              <MaterialCommunityIcons name="microsoft-excel" size={20} color="#064e3b" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.assetTitle}>eval_prompts_batch4.csv</Text>
              <Text style={styles.assetDesc}>10,000 prompts{'\n'}rows • 4.8 MB</Text>
            </View>
            <Feather name="download" size={16} color="#64748b" style={{ marginRight: 12 }} />
            <TouchableOpacity style={styles.replaceBtn}>
              <Text style={styles.replaceBtnText}>Replace</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Applicant Moderation Stream */}
        <View style={styles.sectionCard}>
          <View style={[styles.sectionHeaderRow, { marginBottom: 20 }]}>
            <View style={styles.sectionHeaderLeft}>
              <View style={[styles.sectionIconCircle, { backgroundColor: '#F3E8FF' }]}>
                <MaterialCommunityIcons name="account-group-outline" size={16} color="#610B99" />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.sectionTitle}>Applicant Moderation{'\n'}Stream</Text>
                <Text style={styles.sectionSubtitle}>Live student queue awaiting audit</Text>
              </View>
            </View>
            <View style={styles.pendingPill}>
              <Text style={styles.pendingPillText}>18{'\n'}Pending</Text>
            </View>
          </View>

          {renderApplicant('CO', 'Chidinma Okafor', 'Computer Science • UNILAG\n• 12m ago', '218')}
          {renderApplicant('TO', 'Tunde Olatunji', 'Linguistics • OAU • 34m\nago', '219')}

          <TouchableOpacity
            style={styles.reviewBtn}
            onPress={() => router.push({ pathname: '/review-submissions', params: { campaignId: campaign?.id } })}
          >
            <Feather name="check-square" size={14} color="#610B99" style={{ marginRight: 8 }} />
            <Text style={styles.reviewBtnText}>Review Submissions</Text>
          </TouchableOpacity>
        </View>

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
  topNav: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backBtnText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#475569',
    marginLeft: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 8,
  },

  // Hero Card
  heroCard: {
    backgroundColor: '#3b2585',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  heroPillText: {
    fontFamily: 'Inter-Bold',
    fontSize: 9,
    color: '#610B99',
    flexShrink: 1,
  },
  kineticRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  kineticText: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    color: '#d8b4fe',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: '#fff',
    lineHeight: 28,
    marginBottom: 16,
  },
  sponsorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  sponsorLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#E9D5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sponsorLogoText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#4C1D95',
  },
  sponsorName: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#0f172a',
  },
  sponsorSub: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: '#475569',
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4ade80',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#064e3b',
    marginRight: 6,
  },
  statusPillText: {
    fontFamily: 'Inter-Bold',
    fontSize: 11,
    color: '#064e3b',
    flexShrink: 1,
  },
  createdPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  createdPillText: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: '#f8fafc',
  },

  // Stat Cards
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    color: '#475569',
    letterSpacing: 0.5,
  },
  statIconBox: {
    backgroundColor: '#F3E8FF',
    padding: 6,
    borderRadius: 8,
  },
  statMainValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#0f172a',
    marginBottom: 2,
  },
  statMainSub: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#475569',
  },
  statSubValueGreen: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: '#16a34a',
    marginBottom: 12,
  },
  statSubValueRegular: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#475569',
    marginBottom: 12,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  lightPill: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  lightPillText: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: '#64748b',
  },

  // Section Cards
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
  },
  sectionIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 15,
    color: '#0f172a',
    lineHeight: 20,
  },
  sectionSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 16,
  },
  configModePill: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  configModePillText: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: '#0f172a',
    textAlign: 'center',
  },

  // Inputs
  inputLabel: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    color: '#475569',
    marginBottom: 6,
    letterSpacing: 0.5,
    marginTop: 8,
  },
  inputBox: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#1e293b',
    lineHeight: 20,
  },
  textAreaBox: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
  },
  charCount: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: '#64748b',
    textAlign: 'right',
  },

  // Category pills
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#F8FAFC',
  },
  categoryPillSelected: {
    backgroundColor: '#610B99',
    borderColor: '#610B99',
  },
  categoryPillText: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    color: '#475569',
    letterSpacing: 0.3,
  },
  categoryPillTextSelected: {
    color: '#fff',
  },

  // Save button
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#610B99',
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 20,
  },
  saveBtnText: {
    fontFamily: 'Inter-Bold',
    fontSize: 13,
    color: '#fff',
  },

  // Requirements
  subSectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#0f172a',
  },
  subSectionSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnText: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    color: '#610B99',
    textAlign: 'center',
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  requirementText: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
  trashBtn: {
    paddingLeft: 12,
  },

  // Assets
  linkedAssetsText: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#64748b',
    textAlign: 'right',
  },
  assetBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  assetBoxCol: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  assetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  assetAvatar: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  assetAvatarText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#475569',
  },
  assetTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#0f172a',
  },
  assetDesc: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 14,
  },
  replaceBtn: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  replaceBtnText: {
    fontFamily: 'Inter-Bold',
    fontSize: 11,
    color: '#610B99',
  },
  bannerPreviewBox: {
    backgroundColor: '#2e1065',
    borderRadius: 8,
    padding: 16,
    minHeight: 90,
  },
  bannerImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  bannerSmallText: {
    fontFamily: 'Inter-Bold',
    fontSize: 9,
    color: '#fff',
    marginBottom: 4,
  },
  bannerLargeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 13,
    color: '#fff',
    paddingRight: 70,
  },
  dimensionPill: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dimensionPillText: {
    fontFamily: 'Inter-Medium',
    fontSize: 9,
    color: '#fff',
  },
  uploadOverlay: {
    marginTop: 12,
    alignItems: 'center',
  },
  uploadOverlayText: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },

  // Applicant Stream
  pendingPill: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pendingPillText: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    color: '#991b1b',
    textAlign: 'center',
  },
  applicantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  applicantAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  applicantInitials: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#610B99',
  },
  applicantName: {
    fontFamily: 'Inter-Bold',
    fontSize: 13,
    color: '#0f172a',
  },
  applicantDetails: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 16,
  },
  batchPill: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  batchPillText: {
    fontFamily: 'Inter-Medium',
    fontSize: 9,
    color: '#610B99',
  },
  batchPillTextBold: {
    fontFamily: 'Inter-Bold',
    fontSize: 11,
    color: '#610B99',
  },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E9D5FF',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 6,
  },
  reviewBtnText: {
    fontFamily: 'Inter-Bold',
    fontSize: 13,
    color: '#610B99',
  },
});
