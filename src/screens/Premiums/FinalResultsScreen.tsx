import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

export default function FinalResultsScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <Text style={styles.logoText}>SOLVA</Text>
        <Text style={styles.subtitleText}>SEASON 1 · FINAL RESULTS</Text>
        
        <View style={styles.centerContainer}>
          <View style={styles.crownCircle}>
            <Icon name="crown" size={32} color="#b45309" />
          </View>
          
          <Text style={styles.championLabel}>SEASON 1 CHAMPION</Text>
          <Text style={styles.championName}>LAW</Text>
          <Text style={styles.championUni}>University of Benin</Text>
          
          <View style={styles.prizePill}>
            <Text style={styles.prizePillText}>98.4 pts · ₦5,000,000</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>PRIZE WINNERS</Text>

        {/* 1st Place */}
        <View style={styles.listRow}>
          <Text style={styles.listRank}>1</Text>
          <View style={styles.listDetails}>
            <Text style={styles.listName}>Law</Text>
            <Text style={styles.listMeta}>50% · 98.4 pts</Text>
          </View>
          <Text style={styles.listAmount}>₦5,000,000</Text>
        </View>
        <View style={styles.listDivider} />

        {/* 2nd Place */}
        <View style={styles.listRow}>
          <Text style={styles.listRank}>2</Text>
          <View style={styles.listDetails}>
            <Text style={styles.listName}>Engineering</Text>
            <Text style={styles.listMeta}>30% · 95.1 pts</Text>
          </View>
          <Text style={styles.listAmount}>₦3,000,000</Text>
        </View>
        <View style={styles.listDivider} />

        {/* 3rd Place */}
        <View style={styles.listRow}>
          <Text style={styles.listRank}>3</Text>
          <View style={styles.listDetails}>
            <Text style={styles.listName}>Pharmacy</Text>
            <Text style={styles.listMeta}>20% · 93.8 pts</Text>
          </View>
          <Text style={styles.listAmount}>₦2,000,000</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoBox}>
          <Icon name="shield-outline" size={16} color="#610B99" style={styles.infoIcon} />
          <Text style={styles.infoText}>
            <Text style={{ fontFamily: 'Inter-Bold', color: '#1e293b' }}>₦10,000,000</Text> total, split <Text style={{ fontFamily: 'Inter-Bold', color: '#1e293b' }}>50% / 30% / 20%</Text> across 1st, 2nd, and 3rd place, from Season 1's sponsor-funded prize pool.
          </Text>
        </View>

        <Text style={styles.footerText}>
          Thank you to every faculty, representative, and voter who made Season 1 happen. Season 2 is coming soon.
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
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitleText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
    letterSpacing: 0.5,
  },
  centerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  crownCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  championLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  championName: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#1e293b',
    marginBottom: 8,
  },
  championUni: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  prizePill: {
    backgroundColor: '#FAF5FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  prizePillText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#610B99',
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
  },
  
  // List
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  listRank: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#64748b',
    width: 32,
  },
  listDetails: {
    flex: 1,
  },
  listName: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 4,
  },
  listMeta: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748b',
  },
  listAmount: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#610B99',
  },
  listDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginLeft: 32,
  },
  
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#FAF5FF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 32,
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
  footerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
  },
});
