import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { submitStageAnswer } from '../../utils/api';

export default function TeamDashboardScreen() {
  const router = useRouter();
  const [answer, setAnswer] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!answer) {
      alert('Please enter an answer');
      return;
    }
    
    setIsSubmitting(true);
    // Payload from Hoppscotch snippet
    const response = await submitStageAnswer(1, {
      challenge_id: 1,
      answer_provided: answer,
      reasoning: reasoning // Adding reasoning just in case backend takes it later
    });
    setIsSubmitting(false);

    if (response) {
      alert('Stage 4 Answer Submitted!');
    } else {
      alert('API Failed, but form state captured!');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.logoText}>SOLVA</Text>
          <View style={styles.rankPill}>
            <Text style={styles.rankPillText}>Rank #1</Text>
          </View>
        </View>

        <Text style={styles.facultyTitle}>Law · UNIBEN · Team of 3</Text>

        {/* Stage Progress Tracker */}
        <View style={styles.trackerContainer}>
          <View style={[styles.trackerLineSegment, { left: 24, width: '20%', backgroundColor: '#16a34a' }]} />
          <View style={[styles.trackerLineSegment, { left: '25%', width: '20%', backgroundColor: '#16a34a' }]} />
          <View style={[styles.trackerLineSegment, { left: '50%', width: '20%', backgroundColor: '#e9d5ff' }]} />
          <View style={[styles.trackerLineSegment, { left: '75%', width: '20%', backgroundColor: '#f1f5f9' }]} />
          
          <View style={styles.trackerStep}>
            <View style={[styles.trackerCircle, { backgroundColor: '#16a34a', borderColor: '#16a34a' }]}>
              <Icon name="check" size={12} color="#FFF" />
            </View>
          </View>
          
          <View style={styles.trackerStep}>
            <View style={[styles.trackerCircle, { backgroundColor: '#16a34a', borderColor: '#16a34a' }]}>
              <Icon name="check" size={12} color="#FFF" />
            </View>
          </View>
          
          <View style={styles.trackerStep}>
            <View style={[styles.trackerCircle, { backgroundColor: '#16a34a', borderColor: '#16a34a' }]}>
              <Icon name="check" size={12} color="#FFF" />
            </View>
          </View>
          
          <View style={styles.trackerStep}>
            <View style={[styles.trackerCircle, { backgroundColor: '#610B99', borderColor: '#610B99' }]}>
              <Text style={styles.trackerTextActive}>4</Text>
            </View>
          </View>
          
          <View style={styles.trackerStep}>
            <View style={styles.trackerCircleInactive}>
              <Text style={styles.trackerTextInactive}>5</Text>
            </View>
          </View>
        </View>

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

        {/* Current Stage */}
        <View style={styles.stagePill}>
          <Text style={styles.stagePillText}>STAGE 4 · DROPPED FOR EVERY TEAM AT 09:00</Text>
        </View>

        <Text style={styles.clueText}>
          A pattern is hidden across the last three panels of the mural sequence outside the Faculty of Environmental Studies — not just one panel. Read them in order.
        </Text>
        <Text style={styles.clueSubtext}>
          Every team received this clue at the same time. Your rank depends on how well you solve it, not how fast you saw it.
        </Text>

        {/* Answer Form */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>YOUR ANSWER</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Enter the deciphered code"
            placeholderTextColor="#94a3b8"
            value={answer}
            onChangeText={setAnswer}
          />
          <Text style={styles.helperText}>
            Not case-sensitive. Spacing and punctuation are ignored automatically.
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>YOUR REASONING (THIS IS WHAT'S SCORED)</Text>
          <TextInput 
            style={styles.textarea} 
            placeholder="Explain how your team found it, in your own words."
            placeholderTextColor="#94a3b8"
            multiline={true}
            numberOfLines={4}
            textAlignVertical="top"
            value={reasoning}
            onChangeText={setReasoning}
          />
          <Text style={styles.helperText}>
            Judged on clarity and accuracy of reasoning — spelling and phrasing don't affect your score.
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.submitBtn} 
          activeOpacity={0.8}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>Submit for Stage 4</Text>
          )}
        </TouchableOpacity>

        <View style={styles.successBox}>
          <Icon name="check-circle-outline" size={16} color="#16a34a" style={styles.infoIcon} />
          <Text style={styles.successText}>
            You can edit and resubmit as many times as you like until Stage 4 closes. Only your last submission before close is scored.
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Team History */}
        <Text style={styles.sectionTitle}>YOUR TEAM'S HISTORY</Text>

        <View style={styles.historyRow}>
          <Text style={styles.historyStage}>Stage 1</Text>
          <Text style={styles.historyStatus}>Solved · 94 pts</Text>
        </View>
        <View style={styles.historyDivider} />
        
        <View style={styles.historyRow}>
          <Text style={styles.historyStage}>Stage 2</Text>
          <Text style={styles.historyStatus}>Solved · 89 pts</Text>
        </View>
        <View style={styles.historyDivider} />
        
        <View style={styles.historyRow}>
          <Text style={styles.historyStage}>Stage 3</Text>
          <Text style={styles.historyStatus}>Solved · 97 pts</Text>
        </View>

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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoText: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#610B99',
  },
  rankPill: {
    backgroundColor: '#FAF5FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  rankPillText: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    color: '#610B99',
  },
  facultyTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 24,
  },
  
  // Tracker
  trackerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
    paddingHorizontal: 8,
  },
  trackerLineSegment: {
    position: 'absolute',
    top: 11,
    height: 2,
    zIndex: 1,
  },
  trackerStep: {
    zIndex: 2,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 2,
  },
  trackerCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackerCircleInactive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackerTextActive: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    color: '#FFFFFF',
  },
  trackerTextInactive: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: '#94a3b8',
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
  stagePill: {
    backgroundColor: '#FAF5FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  stagePillText: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    color: '#610B99',
    letterSpacing: 0.5,
  },
  clueText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 22,
    marginBottom: 12,
  },
  clueSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 32,
  },
  
  // Form
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FAF5FF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  textarea: {
    backgroundColor: '#FAF5FF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#e9d5ff',
    minHeight: 100,
  },
  helperText: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#94a3b8',
    lineHeight: 16,
    marginTop: 8,
  },
  submitBtn: {
    backgroundColor: '#610B99',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitBtnText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  successBox: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 16,
    alignItems: 'flex-start',
  },
  infoIcon: {
    marginTop: 2,
    marginRight: 12,
  },
  successText: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#166534',
    lineHeight: 18,
  },

  // History
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  historyStage: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#1e293b',
  },
  historyStatus: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#16a34a',
  },
  historyDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 4,
  },
  
  secondaryBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#610B99',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  secondaryBtnText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#610B99',
  },
});
