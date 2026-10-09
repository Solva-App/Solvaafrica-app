// Force hot-reload trigger
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
import { fetchSeasonLeaderboard } from '../../utils/api';

export default function LeaderboardScreen() {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await fetchSeasonLeaderboard(1);
      if (data && data.length > 0) {
        setLeaderboard(data);
      } else {
        // Fallback dummy data
        setLeaderboard([
          { rank: 1, name: 'LAW', uni: 'UNIBEN', votes: 916 },
          { rank: 2, name: 'ENGINEERING', uni: 'UNIBEN', votes: 751 },
          { rank: 3, name: 'PHARMACY', uni: 'UNIBEN', votes: 750 },
          { rank: 4, name: 'Medicine', stage: 3, votes: 612 },
          { rank: 5, name: 'Social Sciences', stage: 2, votes: 588 },
          { rank: 6, name: 'Arts', stage: 2, votes: 540 },
          { rank: 7, name: 'Agriculture', stage: 2, votes: 497 },
        ]);
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleVote = () => {
    router.push('/vote');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <Text style={styles.logoText}>SOLVA</Text>
        
        <View style={styles.titleRow}>
          <Icon name="medal-outline" size={16} color="#610B99" />
          <Text style={styles.mainTitle}>Leaderboard</Text>
          <Icon name="medal-outline" size={16} color="#610B99" />
        </View>

        <Text style={styles.subtitle}>
          Voting open · closes <Text style={{ fontFamily: 'Inter-Bold', color: '#1e293b' }}>4:00 PM</Text> on the main day (Sat 4 Oct)
        </Text>

        {/* Podiums */}
        <View style={styles.podiumContainer}>
          
          {/* 2nd Place */}
          <View style={[styles.podiumCol, { marginTop: 40 }]}>
            <View style={[styles.podiumHeader, { backgroundColor: '#8b5cf6' }]}>
              <Text style={styles.podiumRank}>2ND</Text>
              <Text style={styles.podiumDesc}>SOLVA SCAVENGER HUNT</Text>
            </View>
            <View style={styles.podiumBody}>
              <TouchableOpacity style={styles.podiumIconBox} onPress={() => router.push('/team-profile')}>
                <Icon name="cog-outline" size={32} color="#8b5cf6" />
              </TouchableOpacity>
              <Text style={styles.podiumName}>ENGINEERING</Text>
              <Text style={styles.podiumUni}>UNIBEN</Text>
              
              <View style={styles.podiumVoteRow}>
                <TouchableOpacity style={styles.voteBtnOutline} onPress={handleVote}>
                  <Text style={styles.voteBtnOutlineText}>Vote</Text>
                </TouchableOpacity>
                <View style={styles.voteCountBox}>
                  <Text style={styles.voteCountValue}>751</Text>
                  <Text style={styles.voteCountLabel}>votes</Text>
                </View>
              </View>
            </View>
          </View>

          {/* 1st Place */}
          <View style={[styles.podiumCol, { marginHorizontal: 8 }]}>
            <View style={[styles.podiumHeader, { backgroundColor: '#7c3aed', paddingVertical: 16 }]}>
              <Text style={styles.podiumRank}>1ST</Text>
              <Text style={styles.podiumDesc}>SOLVA SCAVENGER HUNT</Text>
            </View>
            <View style={styles.podiumBody}>
              <TouchableOpacity style={styles.podiumIconBox} onPress={() => router.push('/team-profile')}>
                <Icon name="scale-balance" size={32} color="#7c3aed" />
              </TouchableOpacity>
              <Text style={styles.podiumName}>LAW</Text>
              <Text style={styles.podiumUni}>UNIBEN</Text>
              
              <View style={styles.podiumVoteRow}>
                <TouchableOpacity style={styles.voteBtnSolid} onPress={handleVote}>
                  <Text style={styles.voteBtnSolidText}>Vote</Text>
                </TouchableOpacity>
                <View style={styles.voteCountBox}>
                  <Text style={styles.voteCountValue}>916</Text>
                  <Text style={styles.voteCountLabel}>votes</Text>
                </View>
              </View>
            </View>
          </View>

          {/* 3rd Place */}
          <View style={[styles.podiumCol, { marginTop: 40 }]}>
            <View style={[styles.podiumHeader, { backgroundColor: '#8b5cf6' }]}>
              <Text style={styles.podiumRank}>3RD</Text>
              <Text style={styles.podiumDesc}>SOLVA SCAVENGER HUNT</Text>
            </View>
            <View style={styles.podiumBody}>
              <TouchableOpacity style={styles.podiumIconBox} onPress={() => router.push('/team-profile')}>
                <Icon name="pill" size={32} color="#8b5cf6" />
              </TouchableOpacity>
              <Text style={styles.podiumName}>PHARMACY</Text>
              <Text style={styles.podiumUni}>UNIBEN</Text>
              
              <View style={styles.podiumVoteRow}>
                <TouchableOpacity style={styles.voteBtnOutline} onPress={handleVote}>
                  <Text style={styles.voteBtnOutlineText}>Vote</Text>
                </TouchableOpacity>
                <View style={styles.voteCountBox}>
                  <Text style={styles.voteCountValue}>750</Text>
                  <Text style={styles.voteCountLabel}>votes</Text>
                </View>
              </View>
            </View>
          </View>

        </View>

        <Text style={styles.infoText}>
          Rank is decided by stage progress and reasoning. Votes only break an exact tie for a top position and cannot fund the prize.
        </Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>FULL LEADERBOARD</Text>

        {/* Full Leaderboard List */}
        <View style={styles.listRow}>
          <Text style={styles.listRank}>4</Text>
          <View style={styles.listDetails}>
            <Text style={styles.listName}>Medicine</Text>
            <Text style={styles.listMeta}>UNIBEN · Stage 3 of 5</Text>
          </View>
          <View style={styles.listAction}>
            <TouchableOpacity style={styles.listVoteBtn} onPress={handleVote}>
              <Text style={styles.listVoteBtnText}>Vote</Text>
            </TouchableOpacity>
            <Text style={styles.listVoteCount}>612 votes</Text>
          </View>
        </View>
        <View style={styles.listDivider} />

        <View style={styles.listRow}>
          <Text style={styles.listRank}>5</Text>
          <View style={styles.listDetails}>
            <Text style={styles.listName}>Social Sciences</Text>
            <Text style={styles.listMeta}>UNIBEN · Stage 2 of 5</Text>
          </View>
          <View style={styles.listAction}>
            <TouchableOpacity style={styles.listVoteBtn} onPress={handleVote}>
              <Text style={styles.listVoteBtnText}>Vote</Text>
            </TouchableOpacity>
            <Text style={styles.listVoteCount}>588 votes</Text>
          </View>
        </View>
        <View style={styles.listDivider} />

        <View style={styles.listRow}>
          <Text style={styles.listRank}>6</Text>
          <View style={styles.listDetails}>
            <Text style={styles.listName}>Arts</Text>
            <Text style={styles.listMeta}>UNIBEN · Stage 2 of 5</Text>
          </View>
          <View style={styles.listAction}>
            <TouchableOpacity style={styles.listVoteBtn} onPress={handleVote}>
              <Text style={styles.listVoteBtnText}>Vote</Text>
            </TouchableOpacity>
            <Text style={styles.listVoteCount}>540 votes</Text>
          </View>
        </View>
        <View style={styles.listDivider} />

        <View style={styles.listRow}>
          <Text style={styles.listRank}>7</Text>
          <View style={styles.listDetails}>
            <Text style={styles.listName}>Agriculture</Text>
            <Text style={styles.listMeta}>UNIBEN · Stage 2 of 5</Text>
          </View>
          <View style={styles.listAction}>
            <TouchableOpacity style={styles.listVoteBtn} onPress={handleVote}>
              <Text style={styles.listVoteBtnText}>Vote</Text>
            </TouchableOpacity>
            <Text style={styles.listVoteCount}>497 votes</Text>
          </View>
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
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  logoText: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#610B99',
    textAlign: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  mainTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#1e293b',
    marginHorizontal: 12,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
  },
  
  // Podiums
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
    marginBottom: 24,
  },
  podiumCol: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e9d5ff',
    overflow: 'hidden',
    backgroundColor: '#FAF5FF',
  },
  podiumHeader: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  podiumRank: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  podiumDesc: {
    fontFamily: 'Inter-Medium',
    fontSize: 7,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  podiumBody: {
    padding: 12,
    alignItems: 'center',
  },
  podiumIconBox: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  podiumName: {
    fontFamily: 'Inter-Bold',
    fontSize: 11,
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 2,
  },
  podiumUni: {
    fontFamily: 'Inter-Regular',
    fontSize: 9,
    color: '#64748b',
    marginBottom: 12,
  },
  podiumVoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  voteBtnOutline: {
    borderWidth: 1,
    borderColor: '#8b5cf6',
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    flex: 1,
    marginRight: 4,
    alignItems: 'center',
  },
  voteBtnOutlineText: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: '#8b5cf6',
  },
  voteBtnSolid: {
    backgroundColor: '#7c3aed',
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
    flex: 1,
    marginRight: 4,
    alignItems: 'center',
  },
  voteBtnSolidText: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: '#FFFFFF',
  },
  voteCountBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  voteCountValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 11,
    color: '#1e293b',
  },
  voteCountLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 8,
    color: '#64748b',
  },

  infoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 16,
    marginLeft: 8,
  },
  
  // List
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  listRank: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#64748b',
    width: 24,
  },
  listDetails: {
    flex: 1,
  },
  listName: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 4,
  },
  listMeta: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#64748b',
  },
  listAction: {
    alignItems: 'flex-end',
  },
  listVoteBtn: {
    borderWidth: 1,
    borderColor: '#8b5cf6',
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  listVoteBtnText: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: '#8b5cf6',
  },
  listVoteCount: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    color: '#64748b',
  },
  listDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginLeft: 32,
  },
});
