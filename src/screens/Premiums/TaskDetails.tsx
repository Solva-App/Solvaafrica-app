import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  TextInput,
  Share,
  ActivityIndicator,
  Image,
  Modal,
  Linking,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTaskStore } from '../../store/useTaskStore';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { normalizeTaskRecord, calcSpotsLeft, calcTimeLeft } from '../../utils/taskNormalization';
import { fetchTaskByIdApi, submitTaskApi } from '../../api/taskApi';

export default function TaskDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const campaigns = useTaskStore(state => state.campaigns);
  const addSubmission = useTaskStore(state => state.addSubmission);

  const storeCampaign = campaigns.find(c => c.id === id);
  const [liveTask, setLiveTask] = useState<any>(null);
  const [loading, setLoading] = useState(!storeCampaign);

  useEffect(() => {
    const loadTaskDetail = async () => {
      if (!id) return;
      try {
        const data = await fetchTaskByIdApi(String(id));
        const taskObj = data?.data?.task || data?.task || data?.data || data;
        if (taskObj) {
          setLiveTask(taskObj);
        }
      } catch (err) {
        console.log('Error fetching task details:', err);
      } finally {
        setLoading(false);
      }
    };
    loadTaskDetail();
  }, [id]);

  const norm = liveTask ? normalizeTaskRecord(liveTask) : null;
  const campaign = {
    id: String(id || norm?.id || storeCampaign?.id || ''),
    title: norm?.title || storeCampaign?.title || 'Campaign Details',
    companyName: norm?.brandName || storeCampaign?.companyName || 'Sponsor',
    companyInitials: (norm?.brandName || storeCampaign?.companyName || 'SP').slice(0, 2).toUpperCase(),
    category: norm?.campaignType || storeCampaign?.category || 'General',
    rewardAmount:
      norm?.totalPool && norm?.totalSpots
        ? Math.round(norm.totalPool / norm.totalSpots)
        : storeCampaign?.rewardAmount || 150,
    poolAmount: norm?.totalPool || storeCampaign?.poolAmount || 0,
    deadline: norm?.endDate || storeCampaign?.deadline || 'Ongoing',
    spotsText: norm ? calcSpotsLeft(norm.totalSpots, norm.usedSpots) : (storeCampaign?.availableSlots ? `${storeCampaign.availableSlots} spots left` : 'Spots available'),
    overview: norm?.overview || storeCampaign?.overview || 'Review campaign requirements and submit proof of completion to claim your reward.',
    bannerUri: norm?.bannerImage || storeCampaign?.bannerImageUri || null,
    logoUri: norm?.sponsorLogo || storeCampaign?.sponsorLogoUri || null,
  };

  // Asset state & preview modal
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const assetUrl =
    liveTask?.datasetUrl ||
    liveTask?.dataset ||
    liveTask?.file ||
    liveTask?.attachment ||
    liveTask?.csvFile ||
    liveTask?.assetUrl ||
    null;
  const assetName =
    liveTask?.datasetName ||
    (assetUrl && typeof assetUrl === 'string' ? assetUrl.split('/').pop() : null) ||
    'dialect_eval_sample_v2.json';

  const handlePreviewAsset = () => {
    if (assetUrl && typeof assetUrl === 'string' && (assetUrl.startsWith('http://') || assetUrl.startsWith('https://'))) {
      Linking.openURL(assetUrl);
    } else {
      setShowPreviewModal(true);
    }
  };

  // Submission form state
  const [rationale, setRationale] = useState('');
  const [previewLink, setPreviewLink] = useState('');
  const [liveUrl, setLiveUrl] = useState('');

  // Upload state
  const [proofFileName, setProofFileName] = useState<string | null>(null);
  const [videoFileName, setVideoFileName] = useState<string | null>(null);

  const handleSubmitDraft = async () => {
    if (!previewLink.trim() && !videoFileName) {
      Toast.show({
        type: 'error',
        text1: 'Draft Details Needed',
        text2: 'Please paste a private preview link or select a video draft first.',
        position: 'top',
      });
      return;
    }
    setSubmitting(true);
    try {
      const linkToSend = previewLink.trim() || videoFileName || 'video-draft-uploaded';
      await submitTaskApi(campaign.id, linkToSend);
      addSubmission({
        id: Math.random().toString(36).substr(2, 9),
        campaignId: campaign.id,
        studentName: 'Guest Student',
        studentInitials: 'GS',
        status: 'Pending',
        submittedAt: 'Just now',
        accuracyScore: undefined,
      });
      Toast.show({
        type: 'success',
        text1: '🚀 Draft Submitted!',
        text2: 'Your draft has been submitted for pre-approval. You will be notified once reviewed.',
        position: 'top',
        visibilityTime: 3500,
      });
    } catch (e: any) {
      Toast.show({
        type: 'error',
        text1: 'Draft Submission Failed',
        text2: e?.message || 'Could not submit draft to backend.',
        position: 'top',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProofFileName(result.assets[0].name);
      }
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: 'Could not pick document. Please try again.',
        position: 'top',
      });
    }
  };

  const handlePickVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        const parts = uri.split('/');
        setVideoFileName(parts[parts.length - 1]);
      }
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: 'Could not pick video. Please try again.',
        position: 'top',
      });
    }
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!rationale.trim() && !previewLink.trim() && !liveUrl.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Submission Incomplete',
        text2: 'Please fill in your rationale, a link, or upload a file before submitting.',
        position: 'top',
        visibilityTime: 3500,
      });
      return;
    }

    setSubmitting(true);

    try {
      const linkToSend = liveUrl.trim() || previewLink.trim() || 'uploaded-file-placeholder';
      await submitTaskApi(campaign.id, linkToSend);

      addSubmission({
        id: Math.random().toString(36).substr(2, 9),
        campaignId: campaign.id,
        studentName: 'Guest Student',
        studentInitials: 'GS',
        status: 'Pending',
        submittedAt: 'Just now',
        accuracyScore: undefined,
      });

      Toast.show({
        type: 'success',
        text1: '🚀 Task Submitted!',
        text2: "Your submission is under review. You'll be notified when approved.",
        position: 'top',
        visibilityTime: 3000,
        onHide: () => router.back(),
      });
    } catch (error: any) {
      console.log('Submission failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Submission Failed',
        text2: error?.message || 'Could not submit task to backend.',
        position: 'top',
        visibilityTime: 4000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#610B99" />
        <Text style={{ marginTop: 12, color: '#64748b', fontFamily: 'Inter-Medium' }}>
          Loading campaign details...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="chevron-left" size={18} color="#0f172a" />
          <Text style={styles.backBtnText}>Task Details</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.circleBtn}
          onPress={() => Share.share({ message: `Check out this task on Solva: ${campaign.title}` })}
        >
          <Feather name="share" size={16} color="#0f172a" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroBanner}>
          {campaign.bannerUri ? (
            <Image
              source={{ uri: campaign.bannerUri }}
              style={StyleSheet.absoluteFillObject}
              resizeMode="cover"
            />
          ) : null}
          <View style={styles.heroOverlay}>
            <View style={styles.heroTopRow}>
              <View style={styles.aiDataPill}>
                <Text style={styles.aiDataPillText}>{campaign.category}</Text>
              </View>
            </View>
            <View style={styles.heroBottomRow}>
              <View style={[styles.sponsorAvatar, { overflow: 'hidden' }]}>
                {campaign.logoUri ? (
                  <Image
                    source={{ uri: campaign.logoUri }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={styles.sponsorAvatarText}>{campaign.companyInitials}</Text>
                )}
              </View>
              <View>
                <Text style={styles.sponsorName}>{campaign.companyName}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.sponsorSub}>Verified Campus Sponsor</Text>
                  <Feather name="check" size={12} color="#16a34a" style={{ marginLeft: 4 }} />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Title & Reward Section */}
        <View style={styles.titleCard}>
          <View style={styles.titleHeader}>
            <View style={styles.solvaLogoBox}>
              <Text style={styles.solvaLogoText}>solva</Text>
            </View>
            <Text style={styles.taskTitle}>{campaign.title}</Text>
          </View>

          <View style={styles.rewardBanner}>
            <Text style={styles.rewardLabel}>REWARD PAYOUT</Text>
            <View style={styles.rewardValueRow}>
              <Text style={styles.rewardValue}>₦{campaign.rewardAmount}</Text>
              <Text style={styles.rewardValueSub}>/ approved task</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statBoxLabel}>Availability</Text>
              <View style={styles.statBoxValueRow}>
                <Feather name="users" size={12} color="#0f172a" style={{ marginRight: 4 }} />
                <Text style={styles.statBoxValue}>{campaign.spotsText}</Text>
              </View>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statBoxLabel}>Deadline</Text>
              <View style={styles.statBoxValueRow}>
                <Feather name="calendar" size={12} color="#dc2626" style={{ marginRight: 4 }} />
                <Text style={styles.statBoxValue}>{campaign.deadline}</Text>
              </View>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statBoxLabel}>Reward Pool</Text>
              <View style={styles.statBoxValueRow}>
                <Text style={[styles.statBoxValue, { color: '#4800B2' }]}>
                  ₦{campaign.poolAmount.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Task Overview */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>TASK OVERVIEW</Text>
          <Text style={styles.overviewText}>{campaign.overview}</Text>
        </View>

        {/* Requirements */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.iconCircleSmall, { backgroundColor: '#F3E8FF' }]}>
                <Feather name="check" size={12} color="#610B99" />
              </View>
              <Text style={styles.cardTitle}>Requirements</Text>
            </View>
            <View style={styles.criteriaCountPill}>
              <Text style={styles.criteriaCountText}>4 Criteria</Text>
            </View>
          </View>

          <View style={styles.reqItem}>
            <Feather name="check-circle" size={14} color="#16a34a" style={styles.reqIcon} />
            <Text style={styles.reqText}>Fluency in Nigerian Pidgin or conversational Yoruba.</Text>
          </View>
          <View style={styles.reqItem}>
            <Feather name="check-circle" size={14} color="#16a34a" style={styles.reqIcon} />
            <Text style={styles.reqText}>Minimum 85% qualification accuracy score.</Text>
          </View>
          <View style={styles.reqItem}>
            <Feather name="check-circle" size={14} color="#16a34a" style={styles.reqIcon} />
            <Text style={styles.reqText}>Device: Smartphone or laptop with stable internet connection.</Text>
          </View>
          <View style={styles.reqItem}>
            <Feather name="check-circle" size={14} color="#16a34a" style={styles.reqIcon} />
            <Text style={styles.reqText}>Must complete all 20 evaluation pairs in a single session.</Text>
          </View>
        </View>

        {/* Guidelines */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.iconCircleSmall, { backgroundColor: '#ffedd5' }]}>
                <Feather name="refresh-cw" size={12} color="#ea580c" style={{ transform: [{ rotate: '45deg' }] }} />
              </View>
              <Text style={styles.cardTitle}>Guidelines</Text>
            </View>
          </View>
          <View style={styles.bulletItem}>
            <View style={styles.bulletDot} />
            <Text style={styles.reqText}>Rate on a scale of 1-5 for cultural fluency, emotional tone, and relevance.</Text>
          </View>
          <View style={styles.bulletItem}>
            <View style={styles.bulletDot} />
            <Text style={styles.reqText}>Flag synthetic or robotic phrasings that sound unnatural to a native speaker.</Text>
          </View>
          <View style={styles.bulletItem}>
            <View style={styles.bulletDot} />
            <Text style={styles.reqText}>Do not use automated translation tools; provide authentic human feedback.</Text>
          </View>
        </View>

        {/* Selection Criteria */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.iconCircleSmall, { backgroundColor: '#dbeafe' }]}>
                <MaterialCommunityIcons name="account-search-outline" size={14} color="#2563eb" />
              </View>
              <Text style={styles.cardTitle}>Selection Criteria</Text>
            </View>
          </View>

          <View style={styles.criteriaRow}>
            <Text style={styles.criteriaText}>Verified Student Network Badge</Text>
            <View style={[styles.criteriaPill, { backgroundColor: '#dcfce7' }]}>
              <Text style={[styles.criteriaPillText, { color: '#16a34a' }]}>Verified ✓</Text>
            </View>
          </View>
          <View style={styles.criteriaRow}>
            <Text style={styles.criteriaText}>History Acceptance Rate ({'>'}90%)</Text>
            <View style={[styles.criteriaPill, { backgroundColor: '#faf5ff' }]}>
              <Text style={[styles.criteriaPillText, { color: '#8b5cf6' }]}>96% Match</Text>
            </View>
          </View>
          <View style={[styles.criteriaRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
            <Text style={styles.criteriaText}>Dialect Evaluation Benchmark</Text>
            <View style={[styles.criteriaPill, { backgroundColor: '#eff6ff' }]}>
              <Text style={[styles.criteriaPillText, { color: '#2563eb' }]}>Passed</Text>
            </View>
          </View>
        </View>

        {/* How To Submit */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.iconCircleSmall, { backgroundColor: '#F3E8FF' }]}>
                <Feather name="info" size={14} color="#610B99" />
              </View>
              <Text style={styles.cardTitle}>How To Submit</Text>
            </View>
          </View>

          <View style={styles.stepItemLineWrapper}>
            <View style={styles.stepItem}>
              <View style={styles.stepDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>1. Compare Pair A vs Pair B</Text>
                <Text style={styles.stepDesc}>Read both model outputs on the interactive response evaluation interface.</Text>
              </View>
            </View>
            <View style={styles.stepVerticalLine} />
          </View>

          <View style={styles.stepItemLineWrapper}>
            <View style={styles.stepItem}>
              <View style={styles.stepDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>2. Provide 1-Sentence Rationale</Text>
                <Text style={styles.stepDesc}>Select the winner and cite authentic cultural or grammatical reasoning.</Text>
              </View>
            </View>
            <View style={styles.stepVerticalLine} />
          </View>

          <View style={styles.stepItemLineWrapper}>
            <View style={styles.stepItem}>
              <View style={styles.stepDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>3. Tap 'Submit & Claim Escrow'</Text>
                <Text style={styles.stepDesc}>Instant automated validation triggers direct release of ₦250 to your Solva wallet.</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Assets */}
        <Text style={styles.sectionLabel}>TASK ASSETS & ATTACHMENTS</Text>
        <View style={styles.assetBox}>
          <View style={styles.assetIconBox}>
            <Feather name="file" size={20} color="#610B99" />
          </View>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.assetTitle} numberOfLines={1}>{assetName}</Text>
            <Text style={styles.assetSub}>Reference Schema &amp; Instructions</Text>
          </View>
          <TouchableOpacity style={styles.previewBtn} activeOpacity={0.7} onPress={handlePreviewAsset}>
            <Text style={styles.previewBtnText}>Preview</Text>
          </TouchableOpacity>
        </View>

        {/* Submission Console */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.iconCircleSmall, { backgroundColor: '#F3E8FF' }]}>
                <Feather name="file-text" size={12} color="#610B99" />
              </View>
              <Text style={styles.cardTitle}>Submission</Text>
            </View>
            <View style={styles.readyInputPill}>
              <View style={styles.greenDot} />
              <Text style={styles.readyInputText}>Ready for Input</Text>
            </View>
          </View>

          <Text style={styles.inputLabel}>Evaluation Rationale & Proof Link</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Paste your live submission link or write your evaluation rationale here..."
            placeholderTextColor="#94a3b8"
            multiline
            value={rationale}
            onChangeText={setRationale}
          />

          <TouchableOpacity style={styles.uploadBox} onPress={handlePickDocument}>
            <View style={styles.uploadIconCircle}>
              <Feather name="upload" size={16} color="#4800B2" />
            </View>
            <Text style={styles.uploadBoxTitle}>
              {proofFileName ? proofFileName : 'Upload Proof or Completed File'}
            </Text>
            <Text style={styles.uploadBoxSub}>
              {proofFileName ? 'File selected' : 'PNG, JPG, PDF, or JSON up to 15MB'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Workflow Stages */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.iconCircleSmall, { backgroundColor: '#F3E8FF' }]}>
                <Feather name="file-text" size={12} color="#610B99" />
              </View>
              <Text style={styles.cardTitle}>Submissions Workflow for content</Text>
            </View>
            <View style={styles.stagesPill}>
              <Text style={styles.stagesPillText}>2 Stages</Text>
            </View>
          </View>

          {/* Stage 1 */}
          <View style={styles.stageRow}>
            <View style={styles.stageIndicatorActive}>
              <Text style={styles.stageIndicatorTextActive}>Stage{'\n'}1</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={styles.stageTitle}>Video Draft Pre-{'\n'}Approval</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={styles.activeReadyPill}>
                    <View style={styles.greenDot} />
                    <Text style={styles.activeReadyPillText}>Active /{'\n'}Ready</Text>
                  </View>
                  <Feather name="chevron-down" size={16} color="#94a3b8" style={{ marginLeft: 8 }} />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.yellowAlertBox}>
            <Feather name="alert-circle" size={14} color="#b45309" style={{ marginRight: 8, marginTop: 2, transform: [{ rotate: '45deg' }] }} />
            <Text style={styles.yellowAlertText}>Do not post publicly until your draft is pre-approved by the sponsor.</Text>
          </View>

          <Text style={styles.inputLabel}>Private Preview Link</Text>
          <TextInput
            style={styles.textInputSingle}
            placeholder="Google Drive, Loom, Unlisted TikTok URL..."
            placeholderTextColor="#94a3b8"
            value={previewLink}
            onChangeText={setPreviewLink}
          />

          <TouchableOpacity style={styles.uploadBox} onPress={handlePickVideo}>
            <View style={styles.uploadIconCircle}>
              <Feather name="upload" size={16} color="#4800B2" />
            </View>
            <Text style={styles.uploadBoxTitle}>
              {videoFileName ? videoFileName : 'Upload Raw Video Draft'}
            </Text>
            <Text style={styles.uploadBoxSub}>
              {videoFileName ? 'Video selected' : 'MP4, MOV up to 100MB'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitDraftBtn, submitting && { opacity: 0.7 }]}
            activeOpacity={0.8}
            onPress={handleSubmitDraft}
            disabled={submitting}
          >
            <Feather name="send" size={14} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.submitDraftBtnText}>{submitting ? 'Submitting...' : 'Submit Draft for Pre-Approval'}</Text>
          </TouchableOpacity>

          {/* Stage 2 */}
          <View style={[styles.stageRow, { marginTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 16 }]}>
            <View style={styles.stageIndicatorInactive}>
              <Text style={styles.stageIndicatorTextInactive}>Stage{'\n'}2</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={styles.stageTitle}>Live Published{'\n'}Link</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={styles.lockedStagePill}>
                    <Feather name="lock" size={10} color="#475569" style={{ marginRight: 4 }} />
                    <Text style={styles.lockedStagePillText}>Unlocks After Pre-{'\n'}Approval</Text>
                  </View>
                  <Feather name="chevron-down" size={16} color="#94a3b8" style={{ marginLeft: 8 }} />
                </View>
              </View>
            </View>
          </View>

          <Text style={styles.overviewText}>
            Once your draft is approved, publish to your verified channel and paste the live post URL.
          </Text>

          <Text style={styles.inputLabel}>Live Public Post URL</Text>
          <TextInput
            style={styles.textInputSingle}
            placeholder="Instagram Reel, TikTok, YouTube Shorts, X..."
            placeholderTextColor="#94a3b8"
            value={liveUrl}
            onChangeText={setLiveUrl}
          />

        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={[styles.submitTaskBtn, submitting && { opacity: 0.7 }]} onPress={handleSubmit} disabled={submitting}>
          <Feather name="send" size={14} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.submitTaskBtnText}>{submitting ? 'Submitting...' : 'Submit Task'}</Text>
        </TouchableOpacity>
      </View>

      {/* Asset Preview Modal */}
      <Modal visible={showPreviewModal} transparent animationType="fade" onRequestClose={() => setShowPreviewModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
                <Feather name="file-text" size={18} color="#610B99" style={{ marginRight: 8 }} />
                <Text style={styles.modalTitle} numberOfLines={1}>{assetName}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowPreviewModal(false)} style={styles.modalCloseBtn}>
                <Feather name="x" size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>Reference Asset Schema &amp; Instructions</Text>

            <View style={styles.codeBox}>
              <Text style={styles.codeText}>
{`{
  "task": "${campaign.title}",
  "sponsor": "${campaign.companyName}",
  "category": "${campaign.category}",
  "reward": "₦${campaign.rewardAmount}",
  "schema_version": "v2.1",
  "instructions": "Follow all guidelines carefully and submit authentic verification link or proof."
}`}
              </Text>
            </View>

            <View style={styles.modalActionRow}>
              {assetUrl && typeof assetUrl === 'string' && (
                <TouchableOpacity
                  style={styles.modalDownloadBtn}
                  onPress={() => Linking.openURL(assetUrl)}
                >
                  <Feather name="download" size={14} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.modalDownloadBtnText}>Download</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.modalDismissBtn}
                onPress={() => setShowPreviewModal(false)}
              >
                <Text style={styles.modalDismissBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtnText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#0f172a',
    marginLeft: 8,
  },
  circleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // Hero
  heroBanner: {
    height: 140,
    backgroundColor: '#0f172a', // very dark background simulating the image
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginHorizontal: 20,
    marginTop: 20,
    overflow: 'hidden',
  },
  heroOverlay: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(76, 29, 149, 0.4)', // purple tint overlay
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  aiDataPill: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  aiDataPillText: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    color: '#4800B2',
  },
  heroBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sponsorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#4c1d95',
  },
  sponsorAvatarText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#fff',
  },
  sponsorName: {
    fontFamily: 'Inter-Bold',
    fontSize: 13,
    color: '#fff',
  },
  sponsorSub: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: '#cbd5e1',
    marginTop: 2,
  },

  // Title Card
  titleCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderTopWidth: 0,
  },
  titleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  solvaLogoBox: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 12,
  },
  solvaLogoText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#0f172a',
  },
  taskTitle: {
    flex: 1,
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#0f172a',
    lineHeight: 24,
  },
  rewardBanner: {
    backgroundColor: '#F3E8FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  rewardLabel: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    color: '#64748b',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  rewardValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  rewardValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#4800B2',
  },
  rewardValueSub: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statBoxLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: '#64748b',
    marginBottom: 6,
    textAlign: 'center',
  },
  statBoxValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statBoxValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#0f172a',
  },

  // General Card
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionLabel: {
    fontFamily: 'Inter-Bold',
    fontSize: 11,
    color: '#94a3b8',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 20,
  },
  overviewText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircleSmall: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cardTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 15,
    color: '#0f172a',
  },

  // Requirements
  criteriaCountPill: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  criteriaCountText: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: '#610B99',
  },
  reqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  reqIcon: {
    marginRight: 12,
  },
  reqText: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },

  // Guidelines
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4800B2',
    marginTop: 6,
    marginRight: 12,
    marginLeft: 4,
  },

  // Selection Criteria
  criteriaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  criteriaText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#334155',
  },
  criteriaPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  criteriaPillText: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
  },

  // How To Submit
  stepItemLineWrapper: {
    position: 'relative',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4800B2',
    marginTop: 4,
    marginRight: 12,
  },
  stepVerticalLine: {
    position: 'absolute',
    left: 3,
    top: 12,
    bottom: 0,
    width: 2,
    backgroundColor: '#F3E8FF',
  },
  stepTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 13,
    color: '#0f172a',
    marginBottom: 4,
  },
  stepDesc: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
  },

  // Assets
  assetBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e9d5ff',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  assetIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  assetTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 13,
    color: '#0f172a',
  },
  assetSub: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  previewBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9d5ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  previewBtnText: {
    fontFamily: 'Inter-Bold',
    fontSize: 11,
    color: '#4800B2',
  },

  // Console
  readyInputPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16a34a',
    marginRight: 4,
  },
  readyInputText: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: '#16a34a',
  },
  inputLabel: {
    fontFamily: 'Inter-Bold',
    fontSize: 11,
    color: '#334155',
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#0f172a',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  textInputSingle: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#0f172a',
    marginBottom: 20,
  },
  uploadBox: {
    backgroundColor: '#faf5ff',
    borderWidth: 1,
    borderColor: '#e9d5ff',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  uploadIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  uploadBoxTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 13,
    color: '#0f172a',
  },
  uploadBoxSub: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
  },
  stagesPill: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  stagesPillText: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: '#610B99',
  },

  // Stages
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stageIndicatorActive: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageIndicatorTextActive: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    color: '#4800B2',
    textAlign: 'center',
  },
  stageIndicatorInactive: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageIndicatorTextInactive: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    color: '#475569',
    textAlign: 'center',
  },
  stageTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#0f172a',
  },
  activeReadyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
  },
  activeReadyPillText: {
    fontFamily: 'Inter-Bold',
    fontSize: 9,
    color: '#16a34a',
    textAlign: 'center',
  },
  lockedStagePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
  },
  lockedStagePillText: {
    fontFamily: 'Inter-Medium',
    fontSize: 9,
    color: '#64748b',
  },
  yellowAlertBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  yellowAlertText: {
    flex: 1,
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#92400e',
    lineHeight: 16,
  },
  submitDraftBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4800B2',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  submitDraftBtnText: {
    fontFamily: 'Inter-Bold',
    fontSize: 13,
    color: '#fff',
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  submitTaskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4800B2',
    paddingVertical: 16,
    borderRadius: 8,
  },
  submitTaskBtnText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#fff',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 520,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  modalTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#0f172a',
  },
  modalCloseBtn: {
    padding: 6,
    borderRadius: 8,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  modalSub: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#64748b',
    marginBottom: 16,
  },
  codeBox: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    color: '#38bdf8',
    lineHeight: 18,
  },
  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalDownloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#610B99',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  modalDownloadBtnText: {
    color: '#fff',
    fontFamily: 'Inter-Bold',
    fontSize: 13,
  },
  modalDismissBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  modalDismissBtnText: {
    color: '#475569',
    fontFamily: 'Inter-Medium',
    fontSize: 13,
  },
});
