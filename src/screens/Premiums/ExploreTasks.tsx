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
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTaskStore } from '../../store/useTaskStore';

export default function ExploreTasksScreen() {
  const router = useRouter();
  const campaigns = useTaskStore(state => state.campaigns);
  
  const [liveTasks, setLiveTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const { fetchTasksApi } = require('../../api/taskApi');
        const data = await fetchTasksApi();
        // Handle various common API response structures
        const tasksArray = Array.isArray(data) ? data : (data?.data || data?.tasks || data?.results || []);
        
        if (tasksArray.length > 0) {
          setLiveTasks(tasksArray);
        }
      } catch (error) {
        console.log("Failed to fetch live tasks:", error);
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, []);

  const displayTasks = liveTasks;

  const renderFilter = (text: string, isActive = false) => (
    <TouchableOpacity style={[styles.filterPill, isActive && styles.filterPillActive]}>
      <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>{text}</Text>
    </TouchableOpacity>
  );

  const renderTaskCard = (
    id: string,
    company: string,
    categoryTag: string | null,
    subTags: { text: string; type: 'green' | 'purple' | 'outline' | 'solid-green' | 'trending' }[],
    price: string,
    priceSub: string,
    title: string,
    desc: string,
    dueDate: string,
    slots: string,
    isUrgent = false
  ) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => router.push({ pathname: '/task-details', params: { id: id } })}>
      {/* Header Row */}
      <View style={styles.cardHeader}>
        <View style={styles.companyRow}>
          <Feather name="box" size={12} color="#610B99" style={{ marginRight: 6 }} />
          <Text style={styles.companyName}>{company}</Text>
        </View>
        {categoryTag && (
          <View style={styles.categoryTag}>
            <Text style={styles.categoryTagText}>{categoryTag}</Text>
          </View>
        )}
      </View>

      {/* Tags & Price Row */}
      <View style={styles.tagsPriceRow}>
        <View style={styles.subTagsRow}>
          {subTags.map((tag, idx) => {
            let tagStyle = styles.tagOutline;
            let textStyle = styles.tagOutlineText;
            let icon = null;

            if (tag.type === 'green') {
              tagStyle = styles.tagGreen;
              textStyle = styles.tagGreenText;
              icon = <Feather name="check-circle" size={10} color="#10b981" style={{ marginRight: 4 }} />;
            } else if (tag.type === 'purple') {
              tagStyle = styles.tagPurple;
              textStyle = styles.tagPurpleText;
              icon = <Feather name="zap" size={10} color="#610B99" style={{ marginRight: 4 }} />;
            } else if (tag.type === 'solid-green') {
              tagStyle = styles.tagSolidGreen;
              textStyle = styles.tagSolidGreenText;
            } else if (tag.type === 'trending') {
              tagStyle = styles.tagOutlineGreen;
              textStyle = styles.tagOutlineGreenText;
              icon = <Feather name="trending-up" size={10} color="#10b981" style={{ marginRight: 4 }} />;
            }

            return (
              <View key={idx} style={[styles.subTag, tagStyle]}>
                {icon}
                <Text style={[styles.subTagText, textStyle]}>{tag.text}</Text>
              </View>
            );
          })}
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.priceText}>{price}</Text>
          <Text style={styles.priceSubText}>{priceSub}</Text>
        </View>
      </View>

      <Text style={styles.taskTitle}>{title}</Text>
      <Text style={styles.taskDesc} numberOfLines={2}>{desc}</Text>

      {/* Footer */}
      <View style={styles.footerRow}>
        <View style={styles.footerInfoRow}>
          <View style={styles.footerItem}>
            <Feather name="calendar" size={12} color="#94a3b8" style={{ marginRight: 4 }} />
            <Text style={styles.footerText}>{dueDate}</Text>
          </View>
          <View style={styles.footerItem}>
            <Feather name="users" size={12} color={isUrgent ? '#ef4444' : '#3b82f6'} style={{ marginRight: 4 }} />
            <Text style={[styles.footerText, isUrgent && { color: '#ef4444' }]}>{slots}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.arrowBtn}>
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
              <Text style={styles.poolValue}>₦285,000</Text>
            </View>
          </View>
          <View style={styles.livePayoutPill}>
            <View style={styles.greenDot} />
            <Text style={styles.livePayoutText}>Live Payouts</Text>
          </View>
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll} style={{ marginBottom: 20 }}>
          {renderFilter('All (18)', true)}
          {renderFilter('AI & Data (6)')}
          {renderFilter('Video / Reels (4)')}
          {renderFilter('Audio / ...')}
        </ScrollView>

        {/* Task Cards */}
        {loading ? (
          <View style={{ marginTop: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#610B99" />
            <Text style={{ marginTop: 12, color: '#64748b', fontFamily: 'Inter-Medium' }}>Loading tasks...</Text>
          </View>
        ) : (
          displayTasks.map((c, i) => {
            // Flexible property mapping to accommodate varying backend responses
            const id = c.id || c._id || `task-${i}`;
            const company = c.companyName || c.company || c.sponsor || 'Solva Sponsor';
            const category = c.category || c.type || 'Task';
            const price = `₦${c.rewardAmount || c.price || c.reward || 150}`;
            const title = c.title || c.name || 'Untitled Task';
            const desc = (c.requirements && c.requirements[0]) || c.description || c.desc || 'No description provided.';
            const dueDate = c.deadline ? `Due ${c.deadline}` : 'No deadline';
            const slotsLeft = `${c.availableSlots || c.slots || c.capacity || 100} slots left`;

            return renderTaskCard(
              id,
              company,
              category,
              [{ text: 'New', type: 'green' }],
              price,
              'per task',
              title,
              desc,
              dueDate,
              slotsLeft
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
  },
  companyName: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#475569',
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
  },
});
