import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTaskStore } from '../../store/useTaskStore';

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
      if (!campaign?.id) return;
      try {
        const { fetchSubmissionsByTaskApi } = require('../../api/taskApi');
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

  const displaySubmissions = liveSubmissions;

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
    let statusPillStyle = styles.pillQueued;
    let statusPillText = styles.pillQueuedText;
    
    if (status === 'Active') {
      statusPillStyle = styles.pillActive;
      statusPillText = styles.pillActiveText;
    } else if (status === 'Pending') {
      statusPillStyle = styles.pillPending;
      statusPillText = styles.pillPendingText;
    } else if (status === 'Approved') {
      statusPillStyle = styles.pillActive;
      statusPillText = styles.pillActiveText;
    } else if (status === 'Rejected') {
      statusPillStyle = styles.pillQueued;
      statusPillText = styles.pillQueuedText;
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

          <TouchableOpacity style={styles.approveAllBtn} onPress={() => {
            Alert.alert(
              'Approve Batch',
              'This will approve all pending submissions in this batch and disburse funds. Proceed?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Approve All', onPress: () => {
                    displaySubmissions.forEach(sub => {
                      if (sub.status === 'Pending') updateSubmissionStatus(sub.id, 'Approved');
                    });
                    Toast.show({ type: 'success', text1: 'Batch Approved', text2: 'All pending tasks have been approved.'});
                }}
              ]
            );
          }}>
            <Feather name="check-circle" size={14} color="#610B99" style={{ marginRight: 6 }} />
            <Text style={styles.approveAllText}>Approve Batch & Pay</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

