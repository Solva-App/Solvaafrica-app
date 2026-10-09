import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { fetchSeasonDetails } from '../../utils/api';

export default function SeasonDetailsScreen() {
  const router = useRouter();
  const [season, setSeason] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await fetchSeasonDetails(1);
      if (data) {
        setSeason(data);
      } else {
        setSeason({
          id: 1,
          title: 'Solva Scavenger Hunt',
          description: 'University of Benin · inter-faculty edition. Faculties compete across staged academic and creative challenges on one main day, ranked by skill — not speed or chance.',
          prize: '₦10,000,000',
          funded_by: 'Sponsors',
          main_day: 'Sat 4 Oct',
          voting_opens: 'Sun 20 Sep',
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <Text style={styles.logoText}>SOLVA</Text>
        
        <View style={styles.livePill}>
          <Text style={styles.livePillText}>SEASON 1 · LIVE NOW</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#610B99" style={{ marginVertical: 40 }} />
        ) : (
          <>
            <Text style={styles.mainTitle}>{season?.title || 'Solva Scavenger Hunt'}</Text>
            <Text style={styles.subtitle}>
              {season?.description || 'University of Benin · inter-faculty edition. Faculties compete across staged academic and creative challenges on one main day, ranked by skill — not speed or chance.'}
            </Text>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>PRIZE</Text>
                <Text style={styles.statValue}>{season?.prize || '₦10,000,000'}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>FUNDED BY</Text>
                <Text style={styles.statValue}>{season?.funded_by || 'Sponsors'}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>MAIN DAY</Text>
                <Text style={styles.statValue}>{season?.main_day || 'Sat 4 Oct'}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>VOTING OPENS</Text>
                <Text style={styles.statValue}>{season?.voting_opens || 'Sun 20 Sep'}</Text>
              </View>
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>HOW IT WORKS</Text>

        {/* Progress Rows */}
        <View style={styles.progressRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.progressTitle}>Stage progress</Text>
            <Text style={styles.progressDesc}>Stages correctly solved, out of 5</Text>
          </View>
          <Text style={styles.progressPercent}>70%</Text>
        </View>
        
        <View style={styles.progressDivider} />

        <View style={styles.progressRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.progressTitle}>Reasoning quality</Text>
            <Text style={styles.progressDesc}>Judged on clarity of your written explanation</Text>
          </View>
          <Text style={styles.progressPercent}>30%</Text>
        </View>

        {/* Info Boxes */}
        <View style={styles.infoBox}>
          <Icon name="clock-outline" size={16} color="#610B99" style={styles.infoIcon} />
          <Text style={styles.infoText}>
            <Text style={{ fontFamily: 'Inter-Bold', color: '#1e293b' }}>Votes only matter in a tie. </Text>
            If two or more faculties are exactly level on score, the vote count between them decides who wins.
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Icon name="shield-outline" size={16} color="#610B99" style={styles.infoIcon} />
          <Text style={styles.infoText}>
            Voting is <Text style={{ fontFamily: 'Inter-Bold', color: '#1e293b' }}>₦50 per vote</Text>, open <Text style={{ fontFamily: 'Inter-Bold', color: '#1e293b' }}>Sun 20 Sep – 4:00 PM on the main day</Text>. Vote money funds platform and event costs only — it never becomes the prize.
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>WHAT ARE YOU HERE TO DO?</Text>

        {/* Action Cards */}
        <TouchableOpacity 
          style={styles.actionCard} 
          activeOpacity={0.7}
          onPress={() => router.push('/register-faculty')}
        >
          <View style={styles.actionIconBox}>
            <Icon name="account-group-outline" size={20} color="#610B99" />
          </View>
          <Text style={styles.actionTitle}>I'm competing</Text>
          <Text style={styles.actionDesc}>
            Register your faculty's 3 representatives and take part in the hunt.
          </Text>
          <Text style={styles.actionLink}>Register your faculty →</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard} 
          activeOpacity={0.7}
          onPress={() => router.push('/leaderboard')}
        >
          <View style={styles.actionIconBox}>
            <Icon name="chart-bar" size={20} color="#610B99" />
          </View>
          <Text style={styles.actionTitle}>I'm here to watch and vote</Text>
          <Text style={styles.actionDesc}>
            Follow the live leaderboard and support your faculty.
          </Text>
          <Text style={styles.actionLink}>View leaderboard →</Text>
        </TouchableOpacity>

        {/* Footer Text */}
        <Text style={styles.footerText}>
          Voting opens 2 weeks before the main day and closes at 4:00 PM on the main day. Stages are solved on the main day only — once it begins, your team is locked in.
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  logoText: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#610B99',
    marginBottom: 16,
  },
  livePill: {
    backgroundColor: '#FAF5FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  livePillText: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    color: '#610B99',
    letterSpacing: 0.5,
  },
  mainTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#1e293b',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748b',
    lineHeight: 22,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#0f172a',
  },
  sectionTitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 4,
  },
  progressDesc: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748b',
  },
  progressPercent: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#610B99',
  },
  progressDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#FAF5FF',
    borderRadius: 8,
    padding: 16,
    marginTop: 12,
    alignItems: 'flex-start',
  },
  infoIcon: {
    marginTop: 2,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#610B99',
    marginBottom: 16,
  },
  actionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FAF5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  actionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#0f172a',
    marginBottom: 8,
  },
  actionDesc: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 16,
  },
  actionLink: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#610B99',
  },
  footerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 24,
  },
});
