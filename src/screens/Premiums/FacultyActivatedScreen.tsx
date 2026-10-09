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

export default function FacultyActivatedScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <Text style={styles.logoText}>SOLVA</Text>

        <View style={styles.centerContainer}>
          <View style={styles.successCircle}>
            <Icon name="check" size={28} color="#16a34a" />
          </View>
          <Text style={styles.mainTitle}>Faculty activated</Text>
          <Text style={styles.subtitle}>
            Your faculty is now registered for Season 1.
          </Text>
        </View>

        {/* Faculty Card */}
        <View style={styles.facultyCard}>
          <Text style={styles.facultyName}>LAW</Text>
          <Text style={styles.facultyUni}>University of Benin</Text>
          <View style={styles.statusPill}>
            <Text style={styles.statusPillText}>Active · not yet ranked</Text>
          </View>
        </View>

        {/* Details List */}
        <View style={styles.listContainer}>
          <View style={styles.listRow}>
            <Text style={styles.listLabel}>Representatives</Text>
            <Text style={styles.listValue}>3</Text>
          </View>
          <View style={styles.divider} />
          
          <View style={styles.listRow}>
            <Text style={styles.listLabel}>Team contact</Text>
            <Text style={styles.listValue}>Tega O.</Text>
          </View>
          <View style={styles.divider} />
          
          <View style={styles.listRow}>
            <Text style={styles.listLabel}>Team access code</Text>
            <View style={styles.codePill}>
              <Text style={styles.codeText}>LAW-7F2K</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Icon name="shield-outline" size={16} color="#610B99" style={styles.infoIcon} />
          <Text style={styles.infoText}>
            Share this <Text style={{ fontFamily: 'Inter-Bold', color: '#1e293b' }}>team access code</Text> with your other 2 representatives. Any one of you can use it to open the team dashboard and submit on the main day — no separate logins needed.
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.primaryBtn} 
          activeOpacity={0.8}
          onPress={() => router.push('/team-dashboard')}
        >
          <Text style={styles.primaryBtnText}>Go to your team dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryBtn} 
          activeOpacity={0.8}
          onPress={() => router.push('/leaderboard')}
        >
          <Text style={styles.secondaryBtnText}>View leaderboard</Text>
        </TouchableOpacity>

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
    marginBottom: 40,
    textAlign: 'center',
  },
  centerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  mainTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748b',
  },
  facultyCard: {
    backgroundColor: '#FAF5FF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
  },
  facultyName: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#1e293b',
    marginBottom: 4,
  },
  facultyUni: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12,
  },
  statusPill: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusPillText: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: '#166534',
  },
  listContainer: {
    marginBottom: 24,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  listLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748b',
  },
  listValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#1e293b',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 4,
  },
  codePill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  codeText: {
    fontFamily: 'Courier',
    fontWeight: 'bold',
    fontSize: 13,
    color: '#1e293b',
    letterSpacing: 2,
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
  primaryBtn: {
    backgroundColor: '#610B99',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBtnText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  secondaryBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#610B99',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#610B99',
  },
});
