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
  Alert,
  Linking,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTaskStore } from '../../store/useTaskStore';

export default function CreatorReviewScreen() {
  const router = useRouter();
  const { submissionId } = useLocalSearchParams();
  const submissions = useTaskStore(state => state.submissions);
  const updateSubmissionStatus = useTaskStore(state => state.updateSubmissionStatus);

  const submission = submissions.find(s => s.id === submissionId) || submissions[0];

  const [rejectionNote, setRejectionNote] = useState('');

  const handlePreApprove = () => {
    Alert.alert(
      'Pre-Approved',
      'Chidinma has been instructed to post the reel. Check back to verify the live link.',
      [{ text: 'OK' }],
    );
  };

  const handleApprove = async () => {
    try {
      const { approveSubmissionApi } = require('../../api/taskApi');
      await approveSubmissionApi(submission.id);
      
      updateSubmissionStatus(submission.id, 'Approved');
      Alert.alert(
        'Payment Sent!',
        'Submission approved. ₦150 has been disbursed from escrow.',
        [{ text: 'OK', onPress: () => router.back() }],
      );
    } catch (error: any) {
      console.log('Approve failed:', error);
      Alert.alert('Error', error?.message || 'Failed to approve submission on backend.');
    }
  };

  const handleReject = async () => {
    if (!rejectionNote.trim()) {
      Alert.alert('Missing Reason', 'Please write a rejection reason before sending');
      return;
    }
    try {
      const { rejectSubmissionApi } = require('../../api/taskApi');
      await rejectSubmissionApi(submission.id, rejectionNote.trim());
      
      updateSubmissionStatus(submission.id, 'Rejected');
      Alert.alert('Revision Requested', 'Revision requested', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.log('Reject failed:', error);
      Alert.alert('Error', error?.message || 'Failed to reject submission on backend.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topNav}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Feather name="chevron-left" size={16} color="#475569" />
            <Text style={styles.backBtnText}>Back to Campaign Submissions</Text>
          </TouchableOpacity>
          <View style={styles.creatorPill}>
            <Feather name="video" size={12} color="#4800B2" style={{ marginRight: 6 }} />
            <Text style={styles.creatorPillText}>Creator{'\n'}Campaign</Text>
          </View>
        </View>
        
        <View style={styles.campaignTitleRow}>
          <MaterialCommunityIcons name="bullhorn-outline" size={14} color="#610B99" style={{ marginRight: 6 }} />
          <Text style={styles.campaignSubtitle}>Campaign:</Text>
          <Text style={styles.campaignTitleText} numberOfLines={1}>Campus Ambassador Video Reels</Text>
          <Text style={styles.submissionIdText}>• Submission #CR-8821</Text>
        </View>
        
        <Text style={styles.mainTitle}>Creator Submission Review</Text>
        <Text style={styles.escrowText}>Locked in Escrow: <Text style={{ color: '#16a34a', fontFamily: 'Inter-Bold' }}>₦150.00</Text></Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Stepper Card */}
        <View style={styles.card}>
          {/* Step 1 */}
          <View style={styles.stepRow}>
            <View style={styles.stepIndicatorActive}>
              <Text style={styles.stepIndicatorTextActive}>1</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.stepTitleActive}>Video Pre-Approval</Text>
                <View style={styles.activeStepPill}>
                  <Text style={styles.activeStepPillText}>Active</Text>
                </View>
              </View>
              <Text style={styles.stepSubtitle}>Brand inspects draft quality</Text>
            </View>
          </View>
          
          <View style={styles.stepLine} />

          {/* Step 2 */}
          <View style={styles.stepRow}>
            <View style={styles.stepIndicatorInactive}>
              <Text style={styles.stepIndicatorTextInactive}>2</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepTitleInactive}>Creator Posts to Socials</Text>
              <Text style={styles.stepSubtitle}>Instagram / TikTok post</Text>
            </View>
          </View>

          <View style={styles.stepLine} />

          {/* Step 3 */}
          <View style={styles.stepRow}>
            <View style={styles.stepIndicatorInactive}>
              <Text style={styles.stepIndicatorTextInactive}>3</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.stepTitleInactive}>Live Link &amp; Payout</Text>
                <View style={styles.lockedStepPill}>
                  <Text style={styles.lockedStepPillText}>Locked</Text>
                </View>
              </View>
              <Text style={styles.stepSubtitle}>Verify live URL &amp; release escrow</Text>
            </View>
          </View>
        </View>

        {/* Student Profile Card */}
        <View style={styles.card}>
          <View style={styles.studentProfileRow}>
            <View>
              {/* Avatar placeholder */}
              <View style={styles.largeAvatarPlaceholder}>
                <Feather name="user" size={24} color="#94a3b8" />
              </View>
              <View style={styles.verifiedBadge}>
                <Feather name="check-circle" size={10} color="#fff" />
              </View>
            </View>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.studentName}>
                  {submission?.studentName ?? 'Chidinma\nOkafor'}
                </Text>
                <Text style={styles.studentHandle}>@chidinma_unilag</Text>
              </View>
              <Text style={styles.studentUni}>University of Lagos (UNILAG) • Computer Science, Year 3</Text>
            </View>
            <View style={styles.verifiedStudentPill}>
              <Feather name="check-circle" size={10} color="#064e3b" style={{ marginRight: 4 }} />
              <Text style={styles.verifiedStudentText}>Verified{'\n'}Student</Text>
            </View>
          </View>

          <View style={styles.statsDivider} />

          <View style={styles.profileStatsRow}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.statLabel}>CREATOR SCORE</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.statValueGreen}>96.2%</Text>
                <Feather name="trending-up" size={12} color="#16a34a" style={{ marginLeft: 4 }} />
              </View>
            </View>
            <View style={styles.verticalDivider} />
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.statLabel}>BOUNTY</Text>
              <Text style={styles.statValuePurple}>₦150.00</Text>
            </View>
          </View>
        </View>

        {/* Step 1: Video Draft Review */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.circleNumberSmall}>
                <Text style={styles.circleNumberSmallText}>1</Text>
              </View>
              <Text style={styles.cardHeaderTitle}>Video Draft Review{'\n'}(Pre-Approval)</Text>
            </View>
            <View style={styles.inspectionPill}>
              <Feather name="eye" size={12} color="#610B99" style={{ marginRight: 4 }} />
              <Text style={styles.inspectionPillText}>Ready for{'\n'}Inspection</Text>
            </View>
          </View>

          <View style={styles.videoContainerBox}>
            <View style={styles.videoPlayer}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 12, width: '100%' }}>
                <View style={styles.videoFormatPill}><Text style={styles.videoFormatPillText}>9:16 Reel</Text></View>
                <View style={styles.videoDurationPill}><Text style={styles.videoDurationPillText}>0:45s</Text></View>
              </View>
              
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <View style={styles.playBtnCircle}>
                  <Feather name="play" size={24} color="#610B99" style={{ marginLeft: 4 }} />
                </View>
                <Text style={styles.watchPreviewText}>Watch Preview</Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 12, width: '100%' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Feather name="heart" size={10} color="#ef4444" style={{ marginRight: 4 }} />
                  <Text style={styles.videoMetaText}>1.8k</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Feather name="music" size={10} color="#fff" style={{ marginRight: 4 }} />
                  <Text style={styles.videoMetaText}>Solva Audio</Text>
                </View>
              </View>
            </View>

            <Text style={styles.draftDeliverableLabel}>SUBMITTED DRAFT DELIVERABLE</Text>
            <Text style={styles.draftFileName}>kampus_vlog_solva_review_draft.mp4</Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 12, flexWrap: 'wrap' }}>
              <View style={styles.grayTag}><Text style={styles.grayTagText}>1080 × 1920 (FHD)</Text></View>
              <Text style={styles.dotSeparator}>•</Text>
              <Text style={styles.metaGrayText}>24.8 MB</Text>
              <Text style={styles.dotSeparator}>•</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Feather name="check-circle" size={10} color="#16a34a" style={{ marginRight: 4 }} />
                <Text style={styles.codecText}>H.264 / AAC</Text>
              </View>
            </View>

            <View style={styles.quoteBoxOutline}>
              <Text style={styles.quoteText}>
                "Created an authentic day-in-the-life clip showcasing how Solva unlocks student research bounties in under 10 minutes at UNILAG cafeteria. Sound is high-clarity voiceover."
              </Text>
            </View>

            <Text style={styles.complianceCheckLabel}>GUIDELINES COMPLIANCE CHECK</Text>

            <TouchableOpacity style={styles.watchFullBtn} onPress={() => { if (submission?.videoUrl) Linking.openURL(submission.videoUrl); else Alert.alert('Not available', 'Video URL is missing.'); }}>
              <Feather name="play-circle" size={14} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.watchFullBtnText}>Watch Full Video</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.downloadMp4Btn} onPress={() => Alert.alert('Downloading', 'The MP4 file is being downloaded to your device.')}>
              <Feather name="download" size={14} color="#1e293b" style={{ marginRight: 8 }} />
              <Text style={styles.downloadMp4BtnText}>Download MP4</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Step 2 & 3: Live Social Post */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.circleNumberSmallMulti}>
                <Text style={styles.circleNumberSmallText}>2{'\n'}&amp;{'\n'}3</Text>
              </View>
              <Text style={styles.cardHeaderTitle}>Live Social Post &amp; Final{'\n'}Link Verification</Text>
            </View>
            <View style={styles.pendingPrePill}>
              <MaterialCommunityIcons name="timer-sand" size={12} color="#475569" style={{ marginRight: 4 }} />
              <Text style={styles.pendingPrePillText}>Pending Pre-{'\n'}Approval</Text>
            </View>
          </View>

          <View style={styles.infoAlertBox}>
            <Feather name="info" size={14} color="#610B99" style={{ marginRight: 8, marginTop: 2 }} />
            <Text style={styles.infoAlertText}>
              3-Step Process: After you pre-approve the video draft above, the creator is instructed to publish to Instagram/TikTok and provide their live link here for final payout release.
            </Text>
          </View>

          <View style={styles.linkBox}>
            <View style={{ flexDirection: 'row' }}>
              <View style={styles.linkIconSquare}>
                <Feather name="link" size={14} color="#4800B2" />
              </View>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.linkLabel}>LIVE PUBLISHED POST LINK</Text>
                <Text style={styles.linkUrl}>https://www.instagram.com/reel/C7x9LK2mp8Q/</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <Text style={styles.platformText}>Platform: Instagram{'\n'}Reel</Text>
                  <Text style={styles.dotSeparatorBig}>•</Text>
                  <Text style={styles.hashtagVerifiedText}>#SolvaCampus{'\n'}verified</Text>
                </View>
              </View>
            </View>
            
            <TouchableOpacity style={styles.openLinkBtn} onPress={() => { if (submission?.videoUrl) Linking.openURL(submission.videoUrl); else Linking.openURL('https://instagram.com'); }}>
              <Feather name="external-link" size={14} color="#4800B2" style={{ marginRight: 8 }} />
              <Text style={styles.openLinkBtnText}>Open Live Post</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Workflow Decision */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="gavel" size={18} color="#0f172a" style={{ marginRight: 6 }} />
              <Text style={styles.decisionTitle}>Workflow Decision</Text>
            </View>
            <View style={styles.stepActionPill}>
              <Text style={styles.stepActionPillText}>Step 1 Action Available</Text>
            </View>
          </View>

          <Text style={styles.decisionDesc}>
            Pre-approving instructs {submission?.studentName ?? 'Chidinma'} to post the reel. Once the live link is verified, approve payout to disburse ₦150.00 instantly from escrow.
          </Text>

          <View style={styles.decisionHeaderRow}>
            <Text style={styles.rejectionLabel}>CREATOR REVISION NOTE (REQUIRED IF{'\n'}REQUESTING RE-EDIT):</Text>
            <Text style={styles.rejectionSubLabel}>SENT IMMEDIATELY{'\n'}TO STUDENT</Text>
          </View>

          <TextInput
            style={styles.rejectionInput}
            placeholder="Optional revision note or rejection reason... (e.g. adjust audio loudness or re-tag Solva handle)"
            placeholderTextColor="#94a3b8"
            multiline
            value={rejectionNote}
            onChangeText={setRejectionNote}
          />

          <TouchableOpacity style={styles.requestReeditBtn} onPress={handleReject}>
            <MaterialCommunityIcons name="playlist-edit" size={16} color="#dc2626" style={{ marginRight: 8 }} />
            <Text style={styles.requestReeditBtnText}>Reject &amp; Request Revision</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.preApproveBtn} onPress={handlePreApprove}>
            <Feather name="check" size={14} color="#4800B2" style={{ marginRight: 8 }} />
            <Text style={styles.preApproveBtnText}>Pre-Approve Video Draft</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.approveFinalBtn} onPress={handleApprove}>
            <MaterialCommunityIcons name="shield-check-outline" size={16} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.approveFinalBtnText}>Approve Final Link &amp; Pay ₦150</Text>
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
  },
  backBtnText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#475569',
    marginLeft: 4,
  },
  creatorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  creatorPillText: {
    fontFamily: 'Inter-Bold',
    fontSize: 9,
    color: '#4800B2',
  },
  campaignTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  campaignSubtitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: '#64748b',
    marginRight: 4,
  },
  campaignTitleText: {
    fontFamily: 'Inter-Bold',
    fontSize: 11,
    color: '#0f172a',
    flexShrink: 1,
  },
  submissionIdText: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: '#94a3b8',
    marginLeft: 4,
  },
  mainTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#0f172a',
    marginTop: 4,
  },
  escrowText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 8,
  },

  // Cards
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardHeaderTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#0f172a',
    lineHeight: 20,
  },

  // Stepper
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepIndicatorActive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4800B2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepIndicatorTextActive: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#fff',
  },
  stepIndicatorInactive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepIndicatorTextInactive: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#475569',
  },
  stepLine: {
    width: 2,
    height: 16,
    backgroundColor: '#e2e8f0',
    marginLeft: 11,
    marginVertical: 4,
  },
  stepTitleActive: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#0f172a',
    marginRight: 8,
  },
  stepTitleInactive: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: '#475569',
    marginRight: 8,
  },
  stepSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  activeStepPill: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeStepPillText: {
    fontFamily: 'Inter-Bold',
    fontSize: 9,
    color: '#16a34a',
  },
  lockedStepPill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lockedStepPillText: {
    fontFamily: 'Inter-Medium',
    fontSize: 9,
    color: '#64748b',
  },

  // Student Profile
  studentProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  largeAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: 10,
    backgroundColor: '#16a34a',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  studentName: {
    fontFamily: 'Inter-Bold',
    fontSize: 15,
    color: '#0f172a',
    lineHeight: 18,
    marginRight: 6,
  },
  studentHandle: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: '#64748b',
  },
  studentUni: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
    marginTop: 4,
  },
  verifiedStudentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  verifiedStudentText: {
    fontFamily: 'Inter-Bold',
    fontSize: 9,
    color: '#064e3b',
  },
  statsDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },
  profileStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    paddingVertical: 12,
  },
  verticalDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#e2e8f0',
  },
  statLabel: {
    fontFamily: 'Inter-Bold',
    fontSize: 9,
    color: '#475569',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValueGreen: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#16a34a',
  },
  statValuePurple: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#4800B2',
  },

  // Draft Review
  circleNumberSmall: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  circleNumberSmallMulti: {
    width: 20,
    height: 28,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  circleNumberSmallText: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    color: '#0f172a',
    textAlign: 'center',
  },
  inspectionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  inspectionPillText: {
    fontFamily: 'Inter-Bold',
    fontSize: 9,
    color: '#610B99',
  },
  videoContainerBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  videoPlayer: {
    backgroundColor: '#1e293b',
    height: 360,
    borderRadius: 12,
    marginBottom: 16,
    alignSelf: 'center',
    width: '75%',
  },
  videoFormatPill: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  videoFormatPillText: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: '#fff',
  },
  videoDurationPill: {
    backgroundColor: '#610B99',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  videoDurationPillText: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    color: '#fff',
  },
  playBtnCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  watchPreviewText: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: '#fff',
  },
  videoMetaText: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: '#cbd5e1',
  },
  draftDeliverableLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: '#475569',
    letterSpacing: 0.5,
  },
  draftFileName: {
    fontFamily: 'Inter-Bold',
    fontSize: 13,
    color: '#0f172a',
    marginTop: 4,
  },
  grayTag: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  grayTagText: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: '#475569',
  },
  dotSeparator: {
    color: '#94a3b8',
    marginHorizontal: 6,
    fontSize: 10,
  },
  metaGrayText: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#475569',
  },
  codecText: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: '#16a34a',
  },
  quoteBoxOutline: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  quoteText: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
  },
  complianceCheckLabel: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    color: '#0f172a',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  watchFullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4800B2',
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  watchFullBtnText: {
    fontFamily: 'Inter-Bold',
    fontSize: 13,
    color: '#fff',
  },
  downloadMp4Btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 12,
    borderRadius: 10,
  },
  downloadMp4BtnText: {
    fontFamily: 'Inter-Bold',
    fontSize: 13,
    color: '#0f172a',
  },

  // Social Post Verification
  pendingPrePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pendingPrePillText: {
    fontFamily: 'Inter-Medium',
    fontSize: 9,
    color: '#475569',
  },
  infoAlertBox: {
    flexDirection: 'row',
    backgroundColor: '#F3E8FF',
    borderWidth: 1,
    borderColor: '#e9d5ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  infoAlertText: {
    flex: 1,
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: '#0f172a',
    lineHeight: 16,
  },
  linkBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
  },
  linkIconSquare: {
    width: 32,
    height: 32,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  linkLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 9,
    color: '#475569',
    letterSpacing: 0.5,
  },
  linkUrl: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#4800B2',
    marginTop: 2,
    lineHeight: 18,
  },
  platformText: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    color: '#475569',
  },
  dotSeparatorBig: {
    color: '#94a3b8',
    marginHorizontal: 6,
    fontSize: 16,
  },
  hashtagVerifiedText: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    color: '#16a34a',
  },
  openLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9d5ff',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  openLinkBtnText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#4800B2',
  },

  // Workflow Decision
  decisionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#0f172a',
  },
  stepActionPill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stepActionPillText: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: '#475569',
  },
  decisionDesc: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
    marginBottom: 20,
  },
  decisionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  rejectionLabel: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    color: '#0f172a',
    letterSpacing: 0.5,
  },
  rejectionSubLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 9,
    color: '#94a3b8',
    textAlign: 'right',
  },
  rejectionInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#0f172a',
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  requestReeditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 10,
  },
  requestReeditBtnText: {
    fontFamily: 'Inter-Bold',
    fontSize: 13,
    color: '#dc2626',
  },
  preApproveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4800B2',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 10,
  },
  preApproveBtnText: {
    fontFamily: 'Inter-Bold',
    fontSize: 13,
    color: '#4800B2',
  },
  approveFinalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4800B2',
    borderRadius: 12,
    paddingVertical: 14,
  },
  approveFinalBtnText: {
    fontFamily: 'Inter-Bold',
    fontSize: 13,
    color: '#fff',
  },
});
