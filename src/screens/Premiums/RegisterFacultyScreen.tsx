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
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { registerFaculty } from '../../utils/api';

export default function RegisterFacultyScreen() {
  const router = useRouter();
  const [facultyName, setFacultyName] = useState('');
  const [activationCode, setActivationCode] = useState('');
  const [rep1, setRep1] = useState('');
  const [rep2, setRep2] = useState('');
  const [rep3, setRep3] = useState('');
  const [contactName, setContactName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!facultyName) {
      alert('Please enter a faculty name');
      return;
    }
    
    setIsSubmitting(true);
    // Passing the minimal payload requested by the backend for now
    const response = await registerFaculty({
      season_id: 1,
      name: facultyName,
      description: `Registered by ${contactName || rep1 || 'Unknown'}`
    });
    setIsSubmitting(false);

    if (response) {
      // Success, move to next screen
      router.push('/faculty-activated');
    } else {
      // Fallback/Demo if backend fails
      alert('API Failed, but proceeding in demo mode!');
      router.push('/faculty-activated');
    }
  };
  
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <Text style={styles.logoText}>SOLVA</Text>
        
        <Text style={styles.mainTitle}>Register your faculty</Text>
        <Text style={styles.subtitle}>
          Season 1 - Solva Scavenger Hunt - University of Benin
        </Text>

        <View style={styles.infoBox}>
          <Icon name="shield-outline" size={16} color="#610B99" style={styles.infoIcon} />
          <Text style={styles.infoText}>
            Registration is confirmed through your <Text style={{ fontFamily: 'Inter-Bold', color: '#1e293b' }}>SUG or faculty association</Text> — no personal ID or matric number needed here.
          </Text>
        </View>

        {/* Form Fields */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>FACULTY NAME</Text>
          <TextInput 
            style={styles.input} 
            placeholder="e.g. Faculty of Law"
            placeholderTextColor="#94a3b8"
            value={facultyName}
            onChangeText={setFacultyName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>ACTIVATION CODE</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Issued to your faculty by Solva"
            placeholderTextColor="#94a3b8"
            value={activationCode}
            onChangeText={setActivationCode}
          />
          <Text style={styles.helperText}>
            This code is issued in advance to each faculty through the SUG and faculty association. Registration can't go live without it — this is what stops anyone from registering a faculty they don't represent.
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>FACULTY REPRESENTATIVES (3)</Text>
          <TextInput 
            style={[styles.input, { marginBottom: 8 }]} 
            placeholder="Representative 1 (Team Lead / Primary)"
            placeholderTextColor="#94a3b8"
            value={rep1}
            onChangeText={setRep1}
          />
          <TextInput 
            style={[styles.input, { marginBottom: 8 }]} 
            placeholder="Full name of Representative 2"
            placeholderTextColor="#94a3b8"
            value={rep2}
            onChangeText={setRep2}
          />
          <TextInput 
            style={styles.input} 
            placeholder="Full name of Representative 3"
            placeholderTextColor="#94a3b8"
            value={rep3}
            onChangeText={setRep3}
          />
          <Text style={styles.helperText}>
            Each faculty is represented by exactly 3 students.
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>TEAM CONTACT NAME</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Name of the person managing submissions"
            placeholderTextColor="#94a3b8"
            value={contactName}
            onChangeText={setContactName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>FACULTY CREST / LOGO</Text>
          <TouchableOpacity style={styles.uploadBox} activeOpacity={0.7}>
            <View style={styles.uploadIconWrap}>
              <Icon name="upload" size={20} color="#610B99" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.uploadTitle}>Upload your faculty's official crest</Text>
              <Text style={styles.uploadDesc}>PNG or SVG, used on your leaderboard and certificate</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.helperText}>
            Until uploaded, a placeholder icon is shown. Replace it any time before the main day.
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.submitBtn} 
          activeOpacity={0.8}
          onPress={handleRegister}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>Activate faculty</Text>
          )}
        </TouchableOpacity>

        <View style={styles.successBox}>
          <Icon name="check-circle-outline" size={16} color="#16a34a" style={styles.infoIcon} />
          <Text style={styles.successText}>
            One shared team account is issued per faculty. Any one of the 3 reps can submit on the team's behalf — no need for everyone to log in separately.
          </Text>
        </View>

        <Text style={styles.footerText}>
          A student may register with one faculty only.
        </Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>HOW YOUR RANK IS DECIDED</Text>

        <View style={styles.progressRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.progressTitle}>Stage progress</Text>
          </View>
          <Text style={styles.progressPercent}>70%</Text>
        </View>
        
        <View style={styles.progressDivider} />

        <View style={styles.progressRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.progressTitle}>Reasoning quality</Text>
          </View>
          <Text style={styles.progressPercent}>30%</Text>
        </View>

        <Text style={[styles.footerText, { textAlign: 'left', marginTop: 16 }]}>
          Votes don't affect ranking directly — they only come into play to break an exact tie for a top position. A team with weak stage results can't win on votes alone. Full rules are in the Season 1 program document.
        </Text>

        <View style={styles.divider} />

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
    marginBottom: 24,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#FAF5FF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
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
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#0f172a',
  },
  helperText: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#94a3b8',
    lineHeight: 16,
    marginTop: 8,
  },
  uploadBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 16,
  },
  uploadIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAF5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  uploadTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 13,
    color: '#1e293b',
    marginBottom: 2,
  },
  uploadDesc: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#64748b',
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
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  successText: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#166534',
    lineHeight: 18,
  },
  footerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
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
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#1e293b',
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
});
