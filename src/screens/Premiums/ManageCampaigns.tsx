import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useTaskStore, Campaign } from '../../store/useTaskStore';

export default function ManageCampaignsScreen() {
  const router = useRouter();
  const campaigns = useTaskStore(state => state.campaigns);
  const deleteCampaign = useTaskStore(state => state.deleteCampaign);

  const totalPool = campaigns.reduce((sum, c) => sum + (c.poolAmount || 0), 0);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.headerPill}>
          <View style={styles.purpleDiamond} />
          <Text style={styles.headerPillText}>MANAGE CAMPAIGNS</Text>
        </View>
        
        <Text style={styles.mainTitle}>
          Manage your <Text style={styles.purpleText}>sponsored campaigns</Text>
        </Text>
        <Text style={styles.subtitle}>
          View campaigns, monitor submissions, manage rewards, and update sponsor details from one clean dashboard.
        </Text>

        {/* Stats Row */}
        <View style={styles.actionRow}>
          <View style={styles.statsBox}>
            <Text style={styles.statsBoxText}>Active: <Text style={{ fontFamily: 'Inter-Bold', color: '#0f172a' }}>{campaigns.length} Live</Text></Text>
          </View>
          <View style={styles.statsBox}>
            <Text style={styles.statsBoxText}>Total Pool: <Text style={{ fontFamily: 'Inter-Bold', color: '#610B99' }}>NGN {totalPool.toLocaleString()}</Text></Text>
          </View>
        </View>

        <TouchableOpacity style={styles.createBtn} activeOpacity={0.8} onPress={() => router.push('/create-task')}>
          <Feather name="plus" size={16} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.createBtnText}>Create Campaign</Text>
        </TouchableOpacity>

        {/* Campaign Cards */}
        {campaigns.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="inbox" size={48} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No Active Campaigns</Text>
            <Text style={styles.emptyDesc}>Create a new campaign to get started.</Text>
          </View>
        ) : (
          campaigns.map(c => {
            let graphicBg = '#F5F3FF';
            if (c.type === 'data') graphicBg = '#F0F9FF';
            else if (c.type === 'content') graphicBg = '#DCFCE7';

            return (
              <View key={c.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.companyRow}>
                    <View style={[styles.companyLogo, { backgroundColor: graphicBg }]}>
                      <Text style={styles.logoText}>{c.companyInitials}</Text>
                    </View>
                    <View>
                      <Text style={styles.companyName}>{c.companyName}</Text>
                      <View style={styles.tagPill}>
                        <Text style={styles.tagText}>{c.category}</Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.trashIcon} onPress={() => {
                      Alert.alert(
                        'Delete Task',
                        'Are you sure you want to delete this task?',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Delete', style: 'destructive', onPress: async () => {
                              try {
                                const { deleteCampaignApi } = require('../../api/taskApi');
                                await deleteCampaignApi(c.id);
                                deleteCampaign(c.id);
                                Toast.show({ type: 'success', text1: 'Task Deleted', position: 'top' });
                              } catch (e: any) {
                                console.log('Delete error:', e);
                                Toast.show({ type: 'error', text1: 'Failed to delete', text2: e.message, position: 'top' });
                              }
                          }}
                        ]
                      );
                    }}>
                    <Feather name="trash-2" size={14} color="#ef4444" />
                  </TouchableOpacity>
                </View>

                <View style={[styles.graphicBox, { backgroundColor: graphicBg }]}>
                  <Text style={styles.graphicTextSmall}>
                    {c.title}
                  </Text>
                  <Text style={styles.graphicLabelPurple}>Total Reward</Text>
                  <Text style={styles.specValue}>₦ {c.rewardAmount} <Text style={styles.specSub}>per task</Text></Text>
                  
                  <View style={styles.pillRow}>
                    <View style={styles.whiteBorderPill}>
                      <Text style={styles.whiteBorderPillText}>{c.category}</Text>
                    </View>
                    <Text style={styles.activeText}>Active</Text>
                  </View>
                </View>

                <View style={styles.statsRow}>
                  <View>
                    <Text style={styles.statsLabel}>Total Reward Pool</Text>
                    <Text style={styles.statsValue}>NGN {c.poolAmount.toLocaleString()}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.daysText}>{c.deadline}</Text>
                    <Text style={styles.progressText}>{c.availableSlots} spots left</Text>
                  </View>
                </View>

                <Text style={styles.campaignTitle}>{c.title}</Text>

                <TouchableOpacity style={styles.viewBtn} activeOpacity={0.8} onPress={() => router.push({ pathname: '/campaign-details', params: { id: c.id } })}>
                  <Text style={styles.viewBtnText}>View Campaign</Text>
                  <Feather name="chevron-right" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            );
          })
        )}
        
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
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  purpleDiamond: {
    width: 6,
    height: 6,
    backgroundColor: '#610B99',
    borderRadius: 3,
    marginRight: 6,
  },
  headerPillText: {
    color: '#610B99',
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  mainTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 26,
    color: '#0f172a',
    marginBottom: 8,
    lineHeight: 32,
  },
  purpleText: {
    color: '#610B99',
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 20,
  },
  actionRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  statsBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statsBoxText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#94a3b8',
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#610B99',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  createBtnText: {
    color: '#fff',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },

  // Card Styles
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
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
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4800B2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoText: {
    color: '#fff',
    fontFamily: 'Inter-Bold',
    fontSize: 11,
  },
  companyName: {
    fontFamily: 'Inter-Bold',
    fontSize: 13,
    color: '#0f172a',
    marginBottom: 4,
  },
  tagPill: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  tagText: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: '#610B99',
  },
  trashIcon: {
    backgroundColor: '#fee2e2',
    padding: 8,
    borderRadius: 10,
  },
  
  // Graphic Boxes
  graphicBox: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  graphicTextSmall: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
    marginBottom: 12,
  },
  graphicLabelPurple: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#610B99',
    marginBottom: 4,
  },
  specValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#0f172a',
    marginBottom: 16,
  },
  specSub: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#475569',
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  whiteBorderPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  whiteBorderPillText: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#475569',
  },
  activeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: '#610B99',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statsLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
  statsValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 15,
    color: '#610B99',
  },
  daysText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#10b981',
    marginBottom: 4,
  },
  progressText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#94a3b8',
  },
  campaignTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 15,
    color: '#0f172a',
    marginBottom: 16,
  },
  viewBtn: {
    backgroundColor: '#610B99',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  viewBtnText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#fff',
    marginRight: 6,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 20,
  },
  emptyTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#0f172a',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDesc: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748b',
  },
});
