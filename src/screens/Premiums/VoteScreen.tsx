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

export default function VoteScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <Text style={styles.logoText}>SOLVA</Text>
        
        <View style={styles.centerContainer}>
          <View style={styles.iconCircle}>
            <Icon name="scale-balance" size={24} color="#610B99" />
          </View>
          <Text style={styles.mainTitle}>Vote for Law</Text>
          <Text style={styles.subtitle}>
            University of Benin · Rank #1
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.voteCounterRow}>
          <Text style={styles.rowLabel}>Number of votes</Text>
          <View style={styles.counterBox}>
            <TouchableOpacity style={styles.counterBtn}>
              <Icon name="minus" size={16} color="#610B99" />
            </TouchableOpacity>
            <Text style={styles.counterText}>1</Text>
            <TouchableOpacity style={styles.counterBtn}>
              <Icon name="plus" size={16} color="#610B99" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.voteTotalRow}>
          <Text style={styles.rowLabel}>Total</Text>
          <Text style={styles.totalAmount}>₦50</Text>
        </View>

        <Text style={styles.infoText}>
          Voting is ₦50 per vote. Votes don't affect ranking directly — they only decide a winner if two or more faculties are exactly tied after stage results.
        </Text>

        <TouchableOpacity 
          style={styles.payBtn} 
          activeOpacity={0.8}
          onPress={() => router.back()}
        >
          <Text style={styles.payBtnText}>Pay with <Text style={{ fontFamily: 'Inter-Bold' }}>Paystack</Text></Text>
        </TouchableOpacity>

        <View style={styles.secureFooter}>
          <Icon name="lock-outline" size={12} color="#94a3b8" style={{ marginRight: 4 }} />
          <Text style={styles.secureText}>Payment is handled securely by Paystack</Text>
        </View>

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
  },
  centerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FAF5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  mainTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748b',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 24,
  },
  voteCounterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  rowLabel: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#1e293b',
  },
  counterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 4,
  },
  counterBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF5FF',
    borderRadius: 4,
  },
  counterText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#1e293b',
    marginHorizontal: 16,
    width: 20,
    textAlign: 'center',
  },
  voteTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  totalAmount: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#610B99',
  },
  infoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 40,
  },
  payBtn: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  payBtnText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#FFFFFF',
  },
  secureFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secureText: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#94a3b8',
  },
});
