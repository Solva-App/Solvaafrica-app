import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

export default function TeamProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <Text style={styles.logoText}>SOLVA</Text>

        <TouchableOpacity 
          style={styles.backLink} 
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <Icon name="arrow-left" size={14} color="#610B99" style={{ marginRight: 4 }} />
          <Text style={styles.backLinkText}>Back to leaderboard</Text>
        </TouchableOpacity>

        {/* Profile Card */}
        <View style={styles.centerContainer}>
          <View style={styles.crestCircle}>
            <Icon name="shield-half-full" size={24} color="#610B99" />
          </View>
          
          <Text style={styles.facultyName}>LAW</Text>
          <Text style={styles.facultyUni}>University of Benin</Text>
          
          <View style={styles.rankPill}>
            <Text style={styles.rankPillText}>Rank #1 • 97.4 pts</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Representatives */}
        <Text style={styles.sectionTitle}>REPRESENTATIVES</Text>

        <View style={styles.repRow}>
          <View style={[styles.avatarCircle, { backgroundColor: '#8b5cf6' }]}>
            <Text style={styles.avatarText}>TO</Text>
          </View>
          <Text style={styles.repName}>
            Tega O. <Text style={styles.repRole}>— team contact</Text>
          </Text>
        </View>

        <View style={styles.repRow}>
          <View style={[styles.avatarCircle, { backgroundColor: '#8b5cf6' }]}>
            <Text style={styles.avatarText}>CE</Text>
          </View>
          <Text style={styles.repName}>Chidinma E.</Text>
        </View>

        <View style={styles.repRow}>
          <View style={[styles.avatarCircle, { backgroundColor: '#8b5cf6' }]}>
            <Text style={styles.avatarText}>MK</Text>
          </View>
          <Text style={styles.repName}>Mohammed K.</Text>
        </View>
        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>STAGE PROGRESS</Text>

        <View style={styles.progressRow}>
          <View style={styles.progressIconWrap}>
            <Icon name="check-circle" size={20} color="#16a34a" />
          </View>
          <View style={styles.progressDetails}>
            <Text style={styles.progressTitle}>Stage 1</Text>
            <Text style={styles.progressSub}>Solved at 09:14</Text>
          </View>
          <Text style={styles.progressScore}>94 pts</Text>
        </View>
        <View style={styles.listDivider} />

        <View style={styles.progressRow}>
          <View style={styles.progressIconWrap}>
            <Icon name="check-circle" size={20} color="#16a34a" />
          </View>
          <View style={styles.progressDetails}>
            <Text style={styles.progressTitle}>Stage 2</Text>
            <Text style={styles.progressSub}>Solved at 10:42</Text>
          </View>
          <Text style={styles.progressScore}>89 pts</Text>
        </View>
        <View style={styles.listDivider} />

        <View style={styles.progressRow}>
          <View style={styles.progressIconWrap}>
            <Icon name="check-circle" size={20} color="#16a34a" />
          </View>
          <View style={styles.progressDetails}>
            <Text style={styles.progressTitle}>Stage 3</Text>
            <Text style={styles.progressSub}>Solved at 12:20</Text>
          </View>
          <Text style={styles.progressScore}>97 pts</Text>
        </View>
        <View style={styles.listDivider} />

        <View style={styles.progressRow}>
          <View style={styles.progressIconWrap}>
            <View style={styles.greyCircle}>
              <Text style={styles.greyCircleText}>4</Text>
            </View>
          </View>
          <View style={styles.progressDetails}>
            <Text style={styles.progressTitle}>Stage 4</Text>
            <Text style={styles.progressSub}>In progress</Text>
          </View>
          <Text style={styles.progressScoreNeutral}>—</Text>
        </View>
        <View style={styles.listDivider} />

        <View style={styles.progressRow}>
          <View style={styles.progressIconWrap}>
            <View style={styles.greyCircle}>
              <Text style={styles.greyCircleText}>5</Text>
            </View>
          </View>
          <View style={styles.progressDetails}>
            <Text style={styles.progressTitle}>Stage 5</Text>
            <Text style={styles.progressSub}>Not yet open</Text>
          </View>
          <Text style={styles.progressScoreNeutral}>—</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.voteBox}>
          <View style={{ flex: 1 }}>
            <Text style={styles.voteCountBig}>916</Text>
            <Text style={styles.voteSubtitle}>votes · tiebreaker only</Text>
          </View>
          <TouchableOpacity 
            style={styles.voteBtn} 
            activeOpacity={0.8}
            onPress={() => router.push('/vote')}
          >
            <Text style={styles.voteBtnText}>Vote</Text>
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
    marginBottom: 24,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  backLinkText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#610B99',
  },
  centerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  crestCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FAF5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  facultyName: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#1e293b',
    marginBottom: 4,
  },
  facultyUni: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  rankPill: {
    backgroundColor: '#FAF5FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  rankPillText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#610B99',
  },
  sectionTitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  repRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  repName: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#1e293b',
  },
  repRole: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748b',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 24,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  progressIconWrap: {
    marginRight: 12,
    width: 20,
    alignItems: 'center',
  },
  progressDetails: {
    flex: 1,
  },
  progressTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#1e293b',
    marginBottom: 4,
  },
  progressSub: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    color: '#64748b',
  },
  progressScore: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#610B99',
  },
  progressScoreNeutral: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#94a3b8',
  },
  listDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginLeft: 32,
  },
  greyCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greyCircleText: {
    fontFamily: 'Inter-Medium',
    fontSize: 8,
    color: '#94a3b8',
  },
  voteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5FF',
    borderRadius: 12,
    padding: 16,
  },
  voteCountBig: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#1e293b',
    marginBottom: 2,
  },
  voteSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    color: '#64748b',
  },
  voteBtn: {
    backgroundColor: '#610B99',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  voteBtnText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  }
});
