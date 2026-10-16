import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useTaskStore } from '../../store/useTaskStore';
import { fetchSubmissionsByTaskApi } from '../../api/taskApi';

export default function ReviewSubmissionsScreen() {
  const router = useRouter();
  const { campaignId } = useLocalSearchParams();
  const campaigns = useTaskStore(state => state.campaigns);
  const submissions = useTaskStore(state => state.submissions);
  const updateSubmissionStatus = useTaskStore(state => state.updateSubmissionStatus);

  const campaign = campaigns.find(c => c.id === campaignId) || campaigns[0];
  const localCampaignSubmissions = submissions.filter(s => s.campaignId === campaign?.id);

  const [liveSubmissions, setLiveSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!campaign?.id) {
        setLoading(false);
        return;
      }
      try {
        const data = await fetchSubmissionsByTaskApi(campaign.id);
        const subArray = Array.isArray(data) ? data : (data?.data || data?.submissions || []);
        if (subArray.length > 0) {
          setLiveSubmissions(subArray);
        }
      } catch (error) {
        console.log('Failed to fetch live submissions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [campaign?.id]);

  const displaySubmissions = liveSubmissions.length > 0 ? liveSubmissions : localCampaignSubmissions;

  const renderQueueItem = (
    id: string,
    initials: string,
    name: string,
    details: string,
    timeAcc: string,
    status: 'Active' | 'Pending' | 'Queued' | 'Approved' | 'Rejected',
    amount: string,
    isActive: boolean = false
  ) => {
    let statusPillStyle: any = styles.pillQueued;
    let statusPillText: any = styles.pillQueuedText;

    if (status === 'Active' || status === 'Approved') {
      statusPillStyle = styles.pillActive;
      statusPillText = styles.pillActiveText;
    } else if (status === 'Pending') {
      statusPillStyle = styles.pillPending;
      statusPillText = styles.pillPendingText;
    }

    return (
      <TouchableOpacity
        style={[styles.queueItem, isActive && styles.queueItemActive]}
        activeOpacity={0.7}
        onPress={() => router.push({ pathname: '/creator-review', params: { submissionId: id } })}
      >
        <View style={styles.queueAvatar}>
          <Text style={styles.queueAvatarText}>{initials}</Text>
        </View>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.queueName}>{name}</Text>
          <Text style={styles.queueDetails}>{details}</Text>
          <Text style={[styles.queueTime, isActive && { color: '#16a34a' }]}>{timeAcc}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <View style={statusPillStyle}>
            <Text style={statusPillText}>{status}</Text>
          </View>
          <Text style={styles.queueAmount}>{amount}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="chevron-left" size={16} color="#475569" />
          <Text style={styles.backBtnText}>Back to Campaign Details</Text>
        </TouchableOpacity>

        <View style={styles.campaignTitleRow}>
          <Feather name="corner-down-right" size={14} color="#610B99" style={{ marginRight: 6 }} />
          <Text style={styles.campaignSubtitle}>Campaign:</Text>
          <Text style={styles.campaignTitleText} numberOfLines={1}>{campaign?.title || 'Unknown Task'}</Text>
        </View>

        <Text style={styles.mainTitle}>Review Submissions</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Feather name="users" size={14} color="#0f172a" style={{ marginRight: 6 }} />
              <Text style={styles.cardHeaderTitle}>SUBMISSIONS QUEUE</Text>
            </View>
            <View style={styles.lightPurplePill}>
              <Text style={styles.lightPurplePillText}>{displaySubmissions.length} Submissions</Text>
            </View>
          </View>

          {loading ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#610B99" />
              <Text style={{ marginTop: 8, color: '#64748b' }}>Loading submissions...</Text>
            </View>
          ) : displaySubmissions.length === 0 ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Feather name="inbox" size={32} color="#cbd5e1" style={{ marginBottom: 12 }} />
              <Text style={{ color: '#64748b' }}>No submissions yet.</Text>
            </View>
          ) : (
            displaySubmissions.map((sub, idx) => {
              const id = sub.id || sub._id || sub.submissionId || `sub-${idx}`;
              const name = sub.studentName || sub.creatorName || sub.author || 'Student';
              const initials = sub.studentInitials || name.slice(0, 2).toUpperCase();
              let details = 'Awaiting review';
              if (sub.accuracyScore) details = `${sub.accuracyScore}% accuracy score`;
              if (sub.link || sub.videoUrl) details = 'Submitted Video/File';
              const status = sub.status || 'Pending';

              const reward = campaign?.rewardAmount ? `₦${campaign.rewardAmount}` : '₦0';

              return (
                <React.Fragment key={id}>
                  {renderQueueItem(
                    id,
                    initials,
                    name,
                    details,
                    sub.submittedAt || 'Just now',
                    status,
                    reward,
                    idx === 0
                  )}
                  {idx < displaySubmissions.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
              );
            })
          )}

          <View style={styles.batchRow}>
            <Text style={styles.batchText}>Batch Total</Text>
            <Text style={styles.batchTotalValue}>₦{((displaySubmissions.length || 0) * (campaign?.rewardAmount || 0)).toLocaleString()}.00</Text>
          </View>

          <TouchableOpacity
            style={styles.approveAllBtn}
            activeOpacity={0.8}
            onPress={() => {
              const doApproveAll = () => {
                displaySubmissions.forEach(sub => {
                  const subId = sub.id || sub._id;
                  if (sub.status === 'Pending') updateSubmissionStatus(subId, 'Approved');
                });
                Toast.show({
                  type: 'success',
                  text1: 'Batch Approved',
                  text2: 'All pending tasks have been approved.',
                });
              };

              if (Platform.OS === 'web') {
                if (window.confirm('This will approve all pending submissions in this batch and disburse funds. Proceed?')) {
                  doApproveAll();
                }
              } else {
                Alert.alert(
                  'Approve Batch',
                  'This will approve all pending submissions in this batch and disburse funds. Proceed?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Approve All', onPress: doApproveAll },
                  ]
                );
              }
            }}
          >
            <Feather name="check-circle" size={14} color="#610B99" style={{ marginRight: 6 }} />
            <Text style={styles.approveAllText}>Approve Batch & Pay</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  topNav: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  backBtnText: { fontFamily: 'Inter-Medium', fontSize: 13, color: '#475569', marginLeft: 4 },
  campaignTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  campaignSubtitle: { fontFamily: 'Inter-Regular', fontSize: 12, color: '#64748b', marginRight: 4 },
  campaignTitleText: { fontFamily: 'Inter-SemiBold', fontSize: 12, color: '#610B99', flex: 1 },
  mainTitle: { fontFamily: 'Inter-Bold', fontSize: 22, color: '#0f172a' },
  scrollContent: { padding: 20 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderTitle: { fontFamily: 'Inter-Bold', fontSize: 12, color: '#0f172a', letterSpacing: 0.5 },
  lightPurplePill: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  lightPurplePillText: { fontFamily: 'Inter-SemiBold', fontSize: 11, color: '#610B99' },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  queueItemActive: { backgroundColor: '#F8FAFC' },
  queueAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  queueAvatarText: { fontFamily: 'Inter-Bold', fontSize: 13, color: '#610B99' },
  queueName: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#0f172a', marginBottom: 2 },
  queueDetails: { fontFamily: 'Inter-Regular', fontSize: 12, color: '#64748b', marginBottom: 2 },
  queueTime: { fontFamily: 'Inter-Regular', fontSize: 11, color: '#94a3b8' },
  pillActive: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 4,
  },
  pillActiveText: { fontFamily: 'Inter-SemiBold', fontSize: 10, color: '#16a34a' },
  pillPending: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 4,
  },
  pillPendingText: { fontFamily: 'Inter-SemiBold', fontSize: 10, color: '#d97706' },
  pillQueued: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 4,
  },
  pillQueuedText: { fontFamily: 'Inter-SemiBold', fontSize: 10, color: '#64748b' },
  queueAmount: { fontFamily: 'Inter-Bold', fontSize: 13, color: '#0f172a' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 4 },
  batchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 14,
    marginTop: 12,
    marginBottom: 14,
  },
  batchText: { fontFamily: 'Inter-Medium', fontSize: 13, color: '#64748b' },
  batchTotalValue: { fontFamily: 'Inter-Bold', fontSize: 16, color: '#0f172a' },
  approveAllBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingVertical: 12,
    borderRadius: 10,
  },
  approveAllText: { fontFamily: 'Inter-Bold', fontSize: 13, color: '#610B99' },
});

