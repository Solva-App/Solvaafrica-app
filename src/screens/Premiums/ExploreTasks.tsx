import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { normalizeTaskRecord, calcSpotsLeft, calcTimeLeft } from '../../utils/taskNormalization';
import { fetchPublicTasksApi } from '../../api/taskApi';

export default function ExploreTasksScreen() {
  const router = useRouter();
  const [liveTasks, setLiveTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('All');

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await fetchPublicTasksApi();
        // Handle various common API response structures
        const rawList = Array.isArray(data)
          ? data
          : (data?.data?.tasks || data?.data || data?.tasks || data?.results || []);

        // Filter out drafts / tasks where payment was NOT made
        const activeOnly = rawList.filter((t: any) => {
          if (t.status) {
            const s = String(t.status).toLowerCase();
            if (s === 'draft' || s === 'unpaid' || s === 'pending_payment' || s === 'cancelled') {
              return false;
            }
          }
          if (t.isPaid === false || t.isActive === false) return false;
          return true;
        });

        const normalized = activeOnly.map((t: any, index: number) => {
          const norm = normalizeTaskRecord(t);
          const totalSpots = norm.totalSpots || 100;
          const poolAmount = norm.totalPool || 0;
          const rewardAmount =
            totalSpots > 0 ? Math.round(poolAmount / totalSpots) : Number(t.rewardAmount || 150);

          return {
            id: norm.id || String(t.id || index),
            brandName: norm.brandName || 'Solva Sponsor',
            campaignType: norm.campaignType || 'AI / DATA',
            title: norm.title || 'Untitled Campaign',
            overview: norm.overview || 'Complete tasks and earn instant rewards.',
            timeLeft: calcTimeLeft(norm.endDate),
            spotsLeft: calcSpotsLeft(norm.totalSpots, norm.usedSpots),
            totalPool: poolAmount,
            rewardAmount: rewardAmount || 150,
            bannerUri: norm.bannerImage || null,
            logoUri: norm.sponsorLogo || null,
          };
        });

        setLiveTasks(normalized);
      } catch (error) {
        console.log('Failed to fetch live tasks:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, []);

  const totalPoolSum = liveTasks.reduce((sum, t) => sum + (t.totalPool || 0), 0);

  const filteredTasks = liveTasks.filter((t) => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'AI & Data') {
      return (
        t.campaignType?.toLowerCase().includes('ai') ||
        t.campaignType?.toLowerCase().includes('data')
      );
    }
    if (selectedFilter === 'Video / Reels') {
      return (
        t.campaignType?.toLowerCase().includes('video') ||
        t.campaignType?.toLowerCase().includes('reel') ||
        t.campaignType?.toLowerCase().includes('content')
      );
    }
    if (selectedFilter === 'Marketing') {
      return (
        t.campaignType?.toLowerCase().includes('marketing') ||
        t.campaignType?.toLowerCase().includes('survey')
      );
    }
    return true;
  });

  const renderFilter = (label: string, count: number, filterKey: string) => {
    const isActive = selectedFilter === filterKey;
    return (
      <TouchableOpacity
        key={filterKey}
        style={[styles.filterPill, isActive && styles.filterPillActive]}
        onPress={() => setSelectedFilter(filterKey)}
      >
        <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
          {label} ({count})
        </Text>
      </TouchableOpacity>
    );
  };

  const renderTaskCard = (item: any) => (
    <TouchableOpacity
      key={item.id}
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => router.push({ pathname: '/task-details', params: { id: item.id } })}
    >
      {/* Header Row: Sponsor Logo + Name + Category Tag */}
      <View style={styles.cardHeader}>
        <View style={styles.companyRow}>
          {item.logoUri ? (
            <Image source={{ uri: item.logoUri }} style={styles.companyLogoImg} resizeMode="cover" />
          ) : (
            <View style={styles.logoPlaceholderWrap}>
              <Feather name="box" size={13} color="#610B99" />
            </View>
          )}
          <Text style={styles.companyName}>{item.brandName}</Text>
        </View>
        {item.campaignType && (
          <View style={styles.categoryTag}>
            <Text style={styles.categoryTagText}>{item.campaignType}</Text>
          </View>
        )}
      </View>

      {/* Optional Banner Image */}
      {item.bannerUri ? (
        <View style={styles.cardBannerWrap}>
          <Image source={{ uri: item.bannerUri }} style={styles.cardBannerImg} resizeMode="cover" />
        </View>
      ) : null}

      {/* Tags & Price Row */}
      <View style={styles.tagsPriceRow}>
        <View style={styles.subTagsRow}>
          <View style={[styles.subTag, styles.tagGreen]}>
            <Feather name="check-circle" size={10} color="#10b981" style={{ marginRight: 4 }} />
            <Text style={[styles.subTagText, styles.tagGreenText]}>Verified Live</Text>
          </View>
          <View style={[styles.subTag, styles.tagPurple]}>
            <Feather name="zap" size={10} color="#610B99" style={{ marginRight: 4 }} />
            <Text style={[styles.subTagText, styles.tagPurpleText]}>Instant Escrow</Text>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.priceText}>₦{item.rewardAmount}</Text>
          <Text style={styles.priceSubText}>per task</Text>
        </View>
      </View>

      <Text style={styles.taskTitle}>{item.title}</Text>
      <Text style={styles.taskDesc} numberOfLines={2}>
        {item.overview}
      </Text>

      {/* Footer */}
      <View style={styles.footerRow}>
        <View style={styles.footerInfoRow}>
          <View style={styles.footerItem}>
            <Feather name="calendar" size={12} color="#94a3b8" style={{ marginRight: 4 }} />
            <Text style={styles.footerText}>{item.timeLeft || 'Ongoing'}</Text>
          </View>
          <View style={styles.footerItem}>
            <Feather name="users" size={12} color="#3b82f6" style={{ marginRight: 4 }} />
            <Text style={styles.footerText}>{item.spotsLeft}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.arrowBtn}
          activeOpacity={0.7}
          onPress={() => router.push({ pathname: '/task-details', params: { id: String(item.id) } })}
        >
          <Feather name="arrow-right" size={16} color="#610B99" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <View style={styles.topNav}>
          <View style={styles.breadcrumbRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.purpleDiamond} />
              <Text style={styles.breadcrumbText}>STUDENT FLOW</Text>
            </View>
            <Text style={styles.breadcrumbText}>STUDENT WORKSPACE</Text>
          </View>
        </View>

        <Text style={styles.mainTitle}>
          Explore Tasks & <Text style={styles.purpleText}>Micro-Bounties</Text>
        </Text>

        {/* Total Pool Box */}
        <View style={styles.poolBox}>
          <View style={styles.poolLeft}>
            <View style={styles.lightningSquare}>
              <MaterialCommunityIcons name="lightning-bolt" size={18} color="#610B99" />
            </View>
            <View>
              <Text style={styles.poolLabel}>Total Pool</Text>
              <Text style={styles.poolValue}>₦{totalPoolSum.toLocaleString()}</Text>
            </View>
          </View>
          <View style={styles.livePayoutPill}>
            <View style={styles.greenDot} />
            <Text style={styles.livePayoutText}>Live Payouts</Text>
          </View>
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
          style={{ marginBottom: 20 }}
        >
          {renderFilter('All', liveTasks.length, 'All')}
          {renderFilter(
            'AI & Data',
            liveTasks.filter(
              (t) =>
                t.campaignType?.toLowerCase().includes('ai') ||
                t.campaignType?.toLowerCase().includes('data')
            ).length,
            'AI & Data'
          )}
          {renderFilter(
            'Video / Reels',
            liveTasks.filter(
              (t) =>
                t.campaignType?.toLowerCase().includes('video') ||
                t.campaignType?.toLowerCase().includes('reel') ||
                t.campaignType?.toLowerCase().includes('content')
            ).length,
            'Video / Reels'
          )}
          {renderFilter(
            'Marketing',
            liveTasks.filter(
              (t) =>
                t.campaignType?.toLowerCase().includes('marketing') ||
                t.campaignType?.toLowerCase().includes('survey')
            ).length,
            'Marketing'
          )}
        </ScrollView>

        {/* Task Cards */}
        {loading ? (
          <View style={{ marginTop: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#610B99" />
            <Text style={{ marginTop: 12, color: '#64748b', fontFamily: 'Inter-Medium' }}>
              Loading verified tasks...
            </Text>
          </View>
        ) : filteredTasks.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Feather name="inbox" size={48} color="#cbd5e1" style={{ marginBottom: 12 }} />
            <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 16, color: '#0f172a' }}>
              No Active Bounties Right Now
            </Text>
            <Text style={{ color: '#64748b', textAlign: 'center', marginTop: 6, fontSize: 13 }}>
              Check back soon as new verified campaigns launch regularly.
            </Text>
          </View>
        ) : (
          filteredTasks.map((item) => renderTaskCard(item))
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
  topNav: {
    marginBottom: 20,
  },
  breadcrumbRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  purpleDiamond: {
    width: 6,
    height: 6,
    backgroundColor: '#610B99',
    transform: [{ rotate: '45deg' }],
    marginRight: 6,
  },
  breadcrumbText: {
    color: '#610B99',
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  mainTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 26,
    color: '#0f172a',
    marginBottom: 20,
    lineHeight: 32,
  },
  purpleText: {
    color: '#610B99',
  },
  poolBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4 },
      android: { elevation: 1 },
    }),
  },
  poolLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lightningSquare: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  poolLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#64748b',
    marginBottom: 2,
  },
  poolValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#0f172a',
  },
  livePayoutPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5', // emerald-50
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  livePayoutText: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    color: '#065f46', // emerald-800
  },
  
  // Filters
  filtersScroll: {
    paddingBottom: 4,
  },
  filterPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: '#610B99',
  },
  filterPillText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: '#475569',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },

  // Task Cards
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  companyLogoImg: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#F3EEF9',
  },
  logoPlaceholderWrap: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#F3EEF9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyName: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#475569',
  },
  cardBannerWrap: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    marginBottom: 12,
  },
  cardBannerImg: {
    width: '100%',
    height: '100%',
  },
  categoryTag: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryTagText: {
    fontFamily: 'Inter-Bold',
    fontSize: 9,
    color: '#610B99',
  },
  tagsPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  subTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
    paddingRight: 10,
  },
  subTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subTagText: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
  },
  
  tagGreen: { backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#DCFCE7' },
  tagGreenText: { color: '#166534' },
  
  tagPurple: { backgroundColor: '#F3E8FF', borderWidth: 1, borderColor: '#E9D5FF' },
  tagPurpleText: { color: '#610B99' },
  
  tagOutline: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
  tagOutlineText: { color: '#610B99' },

  tagOutlineGreen: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DCFCE7' },
  tagOutlineGreenText: { color: '#166534' },
  
  tagSolidGreen: { backgroundColor: '#10b981', borderWidth: 0, borderColor: 'transparent' },
  tagSolidGreenText: { color: '#FFFFFF' },

  priceText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#16a34a', // green-600
    marginBottom: 2,
  },
  priceSubText: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    color: '#94a3b8',
  },
  taskTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 15,
    color: '#0f172a',
    marginBottom: 8,
    lineHeight: 20,
  },
  taskDesc: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 16,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 12,
  },
  footerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: '#64748b',
  },
  arrowBtn: {
    backgroundColor: '#F3E8FF',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
});
