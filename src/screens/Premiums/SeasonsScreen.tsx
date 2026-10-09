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
import { fetchSeasons } from '../../utils/api';

export default function SeasonsScreen() {
  const router = useRouter();
  const [seasons, setSeasons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await fetchSeasons();
      // For now, if the API fails, fallback to dummy data so UI doesn't break
      if (data && data.length > 0) {
        setSeasons(data);
      } else {
        setSeasons([
          { id: 1, title: 'Season 1 — The Uniben Faculty Challenge', isLive: true },
          { id: 2, title: 'Season 2 — TBA', isLive: false },
          { id: 3, title: 'Season 3 — TBA', isLive: false },
          { id: 4, title: 'Season 4 — TBA', isLive: false }
        ]);
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
        
        <Text style={styles.mainTitle}>
          An educational scavenger hunt, built for Africans.
        </Text>
        <Text style={styles.subtitle}>
          Each season is a themed academic challenge — university students compete by solving, reasoning, and ranking up. Think of it as an educational Big Brother Naija: real competition, real school pride, built around learning.
        </Text>

        <Text style={styles.sectionTitle}>SEASONS</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#610B99" style={{ marginVertical: 40 }} />
        ) : (
          seasons.map((season) => (
            season.isLive ? (
              <View key={season.id} style={[styles.card, styles.cardLive]}>
                <View style={styles.livePill}>
                  <Text style={styles.livePillText}>LIVE NOW</Text>
                </View>
                <Text style={styles.cardTitle}>{season.title || season.name}</Text>
                <Text style={styles.cardDesc}>
                  {season.description || "University students compete in teams of 3 to solve staged, curriculum-linked challenges. the goal is learning and reasoning, not decoration."}
                </Text>
                <Text style={styles.poolText}>₦10,000,000 pool • sponsor-funded</Text>
                <TouchableOpacity activeOpacity={0.7} style={styles.enterLink} onPress={() => router.push('/season-details')}>
                  <Text style={styles.enterLinkText}>Enter season {season.id} →</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View key={season.id} style={styles.card}>
                <Text style={styles.comingSoonText}>COMING SOON</Text>
                <Text style={styles.cardTitleGrey}>{season.title || season.name || `Season ${season.id} — TBA`}</Text>
                <Text style={styles.cardDescGrey}>Unlocks once Season {season.id - 1} closes.</Text>
                <Text style={styles.lockedText}>Locked</Text>
              </View>
            )
          ))
        )}

        {/* Why Solva */}
        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>WHY SOLVA</Text>

        <View style={styles.bulletItem}>
          <View style={styles.bulletDot} />
          <Text style={styles.bulletText}>
            Every season is built around a real academic or institutional theme — solving requires genuine reasoning, not luck.
          </Text>
        </View>

        <View style={styles.bulletItem}>
          <View style={styles.bulletDot} />
          <Text style={styles.bulletText}>
            Africans compete as teams, backed by their peers, like an academic house competition.
          </Text>
        </View>

        <View style={styles.bulletItem}>
          <View style={styles.bulletDot} />
          <Text style={styles.bulletText}>
            Clues drop for everyone at once. Rank is earned through accuracy and reasoning, not who submits first.
          </Text>
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
  mainTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#1e293b',
    marginBottom: 16,
    lineHeight: 34,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748b',
    lineHeight: 22,
    marginBottom: 40,
  },
  sectionTitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  
  // Cards
  card: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  cardLive: {
    backgroundColor: '#FAF5FF',
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  livePill: {
    backgroundColor: '#E9D5FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 12,
  },
  livePillText: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    color: '#610B99',
    letterSpacing: 0.5,
  },
  comingSoonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    color: '#94a3b8',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  cardTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#0f172a',
    marginBottom: 8,
  },
  cardTitleGrey: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#64748b',
    marginBottom: 8,
  },
  cardDesc: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 16,
  },
  cardDescGrey: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 16,
  },
  poolText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#610B99',
    marginBottom: 12,
  },
  enterLinkText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#610B99',
  },
  lockedText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#94a3b8',
  },

  // Bullets
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#610B99',
    marginTop: 6,
    marginRight: 12,
  },
  bulletText: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
  },
});
