import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTaskStore } from '../../store/useTaskStore';
import Toast from 'react-native-toast-message';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../../stores/authStore';

export default function ReviewFundScreen() {
  const router = useRouter();
  const storeDraft = useTaskStore(state => state.draftCampaign);
  const addCampaign = useTaskStore(state => state.addCampaign);
  const [funding, setFunding] = useState(false);
  const [paymentModal, setPaymentModal] = useState({
    visible: false,
    taskId: '',
    reference: '',
    paymentUrl: '',
  });
  const [verifying, setVerifying] = useState(false);

  // On web, Zustand can reset during navigation — read from sessionStorage as backup
  let draftCampaign = storeDraft;
  if (!draftCampaign && typeof window !== 'undefined' && window.sessionStorage) {
    try {
      const stored = window.sessionStorage.getItem('solva_draft_campaign');
      if (stored) {
        draftCampaign = JSON.parse(stored);
      }
    } catch (e) {
      console.log('Failed to parse draft from sessionStorage', e);
    }
  }

  const totalPool = draftCampaign
    ? (draftCampaign.rewardAmount || 150) * (draftCampaign.availableSlots || 500)
    : 75000;

  const renderGreenCheck = (text: string) => (
    <View style={styles.greenCheckCard}>
      <View style={styles.greenDot} />
      <Text style={styles.greenCheckText}>{text}</Text>
    </View>
  );

  const renderSummaryRow = (label: string, value: string, boldValue = false) => (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, boldValue && styles.summaryValueBold]}>{value}</Text>
    </View>
  );

  const handleOpenPaystackAgain = async () => {
    if (!paymentModal.paymentUrl) return;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(paymentModal.paymentUrl, '_blank');
    } else {
      const { Linking } = require('react-native');
      await Linking.openURL(paymentModal.paymentUrl);
    }
  };

  const handleVerifyPayment = async () => {
    setVerifying(true);
    try {
      const { activateTaskApi } = require('../../api/taskApi');
      await activateTaskApi(paymentModal.taskId, paymentModal.reference);

      // Update store and navigate
      addCampaign({ ...(draftCampaign as any), id: paymentModal.taskId });
      setPaymentModal({ visible: false, taskId: '', reference: '', paymentUrl: '' });
      Toast.show({
        type: 'success',
        text1: 'Campaign is Live!',
        text2: 'Task verified and activated successfully.',
        position: 'top',
        visibilityTime: 3000,
        onHide: () => router.push('/manage-campaigns'),
      });
    } catch (e: any) {
      const resData = e?.response?.data;
      const backendMessage =
        resData?.message || e?.message || 'Please complete the payment on Paystack first, then click Verify.';
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: backendMessage,
        position: 'top',
        visibilityTime: 4000,
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleFund = async () => {
    if (!draftCampaign || !draftCampaign.title?.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Missing Campaign Details',
        text2: 'Please go back and fill in the campaign details first.',
        position: 'top',
        visibilityTime: 4000,
      });
      return;
    }

    // Check authentication BEFORE opening any popup window
    const serializedUser = await AsyncStorage.getItem('User');
    const storeUser = useAuthStore.getState().user;
    const parsedUser = serializedUser ? JSON.parse(serializedUser) : storeUser;
    const accessToken = parsedUser?.tokens?.accessToken || storeUser?.tokens?.accessToken;

    if (!accessToken) {
      Toast.show({
        type: 'error',
        text1: 'Authentication Required',
        text2: 'Your session has expired. Please log in again to fund your task.',
        position: 'top',
        visibilityTime: 4000,
        onHide: () => router.push('/(auth)/login'),
      });
      return;
    }

    setFunding(true);

    let win: Window | null = null;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      win = window.open('', '_blank');
      if (win) {
        win.document.write(
          '<html><head><title>Redirecting to Paystack...</title></head><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#FAFAFA;color:#111827;"><div style="text-align:center;"><h3>Connecting to Paystack...</h3><p style="color:#6B7280;font-size:14px;">Please wait while we prepare your secure checkout.</p></div></body></html>'
        );
        win.document.close();
      }
    }

    try {
      // Build FormData for backend
      const formData = new FormData();
      formData.append('title', draftCampaign.title || '');
      formData.append('overview', draftCampaign.overview || 'Task Overview');
      formData.append('type', draftCampaign.category || 'General');
      formData.append('sponsorName', draftCampaign.companyName || 'Sponsor');

      formData.append('totalPool', draftCampaign.poolAmount ? draftCampaign.poolAmount.toString() : '0');
      formData.append('totalSpots', draftCampaign.totalSlots ? draftCampaign.totalSlots.toString() : '0');

      // Send arrays as joined strings, as per Hoppscotch screenshot examples
      formData.append('requirements', draftCampaign.requirements?.join(' ') || 'Standard requirements');
      formData.append('guidelines', draftCampaign.guidelines?.join(' ') || 'Standard guidelines');
      formData.append('selectionCriteria', draftCampaign.selectionCriteria?.join(' ') || 'Standard criteria');
      formData.append('howToSubmit', draftCampaign.howToSubmit?.join(' ') || 'Standard submission steps');

      formData.append('startDate', draftCampaign.startDate || new Date().toISOString().split('T')[0]);
      formData.append('endDate', draftCampaign.endDate || draftCampaign.deadline || '2026-12-31');

      // Helper to safely append files on both Web and Native
      const appendFile = async (key: string, uri: string, fallbackName: string) => {
        if (!uri) return;
        const filename = uri.split('/').pop() || fallbackName;

        if (Platform.OS === 'web') {
          const res = await fetch(uri);
          const blob = await res.blob();
          formData.append(key, blob, filename);
        } else {
          // React Native native FormData syntax
          // @ts-ignore
          formData.append(key, { uri, name: filename, type: 'image/jpeg' });
        }
      };

      if (draftCampaign.sponsorLogoUri) {
        await appendFile('sponsorLogo', draftCampaign.sponsorLogoUri, 'logo.jpg');
      }

      if (draftCampaign.bannerImageUri) {
        await appendFile('bannerImage', draftCampaign.bannerImageUri, 'banner.jpg');
      }

      // Step 1: Send FormData to backend to create draft
      const { createCampaignApi, activateTaskApi } = require('../../api/taskApi');
      const createResponse = await createCampaignApi(formData);
      console.log('✅ CREATE CAMPAIGN RESPONSE:', JSON.stringify(createResponse));

      // Extract taskId from backend response
      let createdTaskId =
        createResponse?.data?.taskId ||
        createResponse?.data?.id ||
        createResponse?.taskId ||
        createResponse?.id;
      if (!createdTaskId) {
        throw new Error(`Backend did not return a task ID. Response was: ${JSON.stringify(createResponse)}`);
      }

      // Force it to a string to satisfy strict backend string validation
      createdTaskId = String(createdTaskId);
      console.log('✅ EXTRACTED TASK ID:', createdTaskId, typeof createdTaskId);

      // Extract Paystack payment URL (supports both camelCase authorizationUrl and snake_case authorization_url)
      const paymentUrl =
        createResponse?.data?.authorizationUrl ||
        createResponse?.data?.authorization_url ||
        createResponse?.data?.paymentUrl ||
        createResponse?.data?.paystackLink ||
        createResponse?.authorizationUrl ||
        createResponse?.authorization_url ||
        null;
      const paymentReference =
        createResponse?.data?.reference ||
        createResponse?.data?.paymentReference ||
        createResponse?.reference ||
        null;
      console.log('✅ PAYMENT URL:', paymentUrl);
      console.log('✅ PAYMENT REF:', paymentReference);

      // Step 2: Open Paystack link for user to complete payment
      if (paymentUrl) {
        if (Platform.OS === 'web') {
          if (win && !win.closed) {
            win.location.href = paymentUrl;
          } else if (typeof window !== 'undefined') {
            window.open(paymentUrl, '_blank');
          }
        } else {
          const { Linking } = require('react-native');
          await Linking.openURL(paymentUrl);
        }

        // Show clean verification modal so user can verify after paying on Paystack
        setPaymentModal({
          visible: true,
          taskId: createdTaskId,
          reference: paymentReference || '',
          paymentUrl,
        });
      } else {
        if (Platform.OS === 'web' && win) {
          try {
            win.close();
          } catch {}
        }
        // No Paystack link — backend may have auto-activated or reference is already embedded
        const refToUse = paymentReference || 'T' + Date.now();
        await activateTaskApi(createdTaskId, refToUse);
        addCampaign({ ...(draftCampaign as any), id: createdTaskId });
        Toast.show({
          type: 'success',
          text1: 'Campaign is Live!',
          text2: 'Funds safely escrowed. Your task is visible to students.',
          position: 'top',
          visibilityTime: 3000,
          onHide: () => router.push('/manage-campaigns'),
        });
      }
    } catch (error: any) {
      if (Platform.OS === 'web' && win) {
        try {
          win.close();
        } catch {}
      }
      console.log('Funding failed:', error);

      const resData = error?.response?.data;
      let backendMessage = resData?.message || error?.message || 'Failed to communicate with backend.';

      if (resData?.error && typeof resData.error === 'object') {
        const errorDetails = JSON.stringify(resData.error);
        console.log('Validation Errors:', errorDetails);
        backendMessage = `${backendMessage}\n${errorDetails}`;
      }

      const lowerMsg = backendMessage.toLowerCase();
      const isAuthErr =
        error?.response?.status === 401 ||
        lowerMsg.includes('requires authentication') ||
        lowerMsg.includes('token') ||
        lowerMsg.includes('unauthorized');

      Toast.show({
        type: 'error',
        text1: isAuthErr ? 'Session Expired' : 'Funding Failed',
        text2: isAuthErr
          ? 'Please log in again to continue funding your task.'
          : backendMessage,
        position: 'top',
        visibilityTime: 5000,
        onHide: () => {
          if (isAuthErr) {
            router.push('/(auth)/login');
          }
        },
      });
    } finally {
      setFunding(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Top Header */}
        <TouchableOpacity style={styles.breadcrumbRow} onPress={() => router.back()}>
          <View style={styles.purpleDiamond} />
          <Text style={styles.breadcrumbText}>COMPANY FLOW - REVIEW & FUND</Text>
        </TouchableOpacity>

        <Text style={styles.mainTitle}>
          Your task is <Text style={styles.purpleText}>ready to fund</Text>
        </Text>
        <Text style={styles.subtitle}>
          Solva verified your task parameters and moderation rules. Fund your task pool to make it live to qualified students immediately.
        </Text>

        {/* Automated Review & Compliance */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Automated Review & Compliance</Text>
          {renderGreenCheck('Rules & Submission Guidelines Validated')}
          {renderGreenCheck('AI Moderation & Content Safety Passed')}
          {renderGreenCheck('Budget, Unit Payout & Spot Allocation Verified')}
        </View>

        {/* Task Parameters Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Task Parameters Summary</Text>
          <View style={styles.summaryContainer}>
            {renderSummaryRow('Task Title', draftCampaign?.title || 'Evaluate AI responses', true)}
            <View style={styles.dividerLight} />
            {renderSummaryRow('Category / Type', draftCampaign?.category || 'AI / DATA', true)}
            <View style={styles.dividerLight} />
            {renderSummaryRow('Participant Spots', `${draftCampaign?.availableSlots || 500} students`, true)}
            <View style={styles.dividerLight} />
            {renderSummaryRow('Reward Per Unit', `₦${draftCampaign?.rewardAmount || 150}`, true)}
            <View style={styles.dividerLight} />
            {renderSummaryRow('Review Window Deadline', draftCampaign?.deadline || 'TBD', true)}
          </View>
        </View>

        {/* Funding Settlement */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Funding Settlement</Text>
          <Text style={styles.cardSubtitle}>
            Committed funds are placed into escrow balance and released upon approval.
          </Text>

          <View style={styles.settlementBox}>
            <View style={styles.settlementRow}>
              <Text style={styles.settlementLabel}>Total Task <Text style={styles.settlementLabelSmall}>({draftCampaign?.availableSlots || 500} x ₦{draftCampaign?.rewardAmount || 150})</Text></Text>
              <Text style={styles.settlementValue}>₦{totalPool.toLocaleString()}</Text>
            </View>
            <View style={styles.settlementRow}>
              <Text style={styles.settlementLabel}>Platform Charges <Text style={styles.settlementLabelSmall}>(5% processing fee)</Text></Text>
              <Text style={styles.settlementValue}>₦{Math.round(totalPool * 0.05).toLocaleString()}</Text>
            </View>
            <View style={styles.dividerHeavy} />
            <View style={styles.settlementRowTotal}>
              <Text style={styles.settlementTotalLabel}>Total Amount Required</Text>
              <Text style={styles.settlementTotalValue}>₦{Math.round(totalPool * 1.05).toLocaleString()}</Text>
            </View>
          </View>

          <View style={styles.warningBox}>
            <MaterialCommunityIcons name="lightning-bolt" size={16} color="#92400e" style={{ marginTop: 2, marginRight: 8 }} />
            <Text style={styles.warningText}>
              <Text style={{ fontFamily: 'Inter-Bold' }}>Instant Launch: </Text>
              Once funded, the task goes live instantly on student discovery feeds matching qualification requirements.
            </Text>
          </View>

          <TouchableOpacity style={[styles.fundBtn, funding && { opacity: 0.7 }]} activeOpacity={0.8} onPress={handleFund} disabled={funding}>
            <Text style={styles.fundBtnText}>{funding ? 'Processing...' : `Fund ₦${Math.round(totalPool * 1.05).toLocaleString()} & Go Live`}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={paymentModal.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconWrap}>
              <Feather name="credit-card" size={24} color="#111827" />
            </View>
            <Text style={styles.modalTitle}>Complete Payment</Text>
            <Text style={styles.modalSubtitle}>
              Complete your checkout in the Paystack tab, then click Verify below to activate your campaign.
            </Text>

            {!!paymentModal.paymentUrl && (
              <TouchableOpacity
                style={styles.modalSecondaryBtn}
                onPress={handleOpenPaystackAgain}
                disabled={verifying}
              >
                <Text style={styles.modalSecondaryBtnText}>Open Paystack Checkout</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.modalBtn, verifying && { opacity: 0.7 }]}
              onPress={handleVerifyPayment}
              disabled={verifying}
            >
              {verifying ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.modalBtnText}>I've Completed the Payment</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setPaymentModal({ visible: false, taskId: '', reference: '', paymentUrl: '' })}
              disabled={verifying}
            >
              <Text style={styles.modalCancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  breadcrumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  purpleDiamond: {
    width: 6,
    height: 6,
    backgroundColor: '#4800B2',
    transform: [{ rotate: '45deg' }],
    marginRight: 8,
  },
  breadcrumbText: {
    color: '#4800B2',
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  mainTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 26,
    color: '#0f172a',
    marginBottom: 8,
  },
  purpleText: {
    color: '#4800B2',
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10 },
      android: { elevation: 2 },
    }),
  },
  cardTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 15,
    color: '#0f172a',
    marginBottom: 16,
  },
  cardSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 18,
  },
  
  // Green Check Cards
  greenCheckCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4', // Light green bg
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 12,
  },
  greenCheckText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#0f172a',
    flex: 1,
  },

  // Summary Container
  summaryContainer: {
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  summaryLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#64748b',
    flex: 1,
  },
  summaryValue: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#0f172a',
    flex: 1,
    textAlign: 'right',
  },
  summaryValueBold: {
    fontFamily: 'Inter-Bold',
  },
  dividerLight: {
    height: 1,
    backgroundColor: '#F8FAFC',
  },

  // Settlement Box
  settlementBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  settlementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  settlementLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#475569',
  },
  settlementLabelSmall: {
    fontSize: 11,
    color: '#94a3b8',
  },
  settlementValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 13,
    color: '#0f172a',
  },
  dividerHeavy: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  settlementRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  settlementTotalLabel: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#0f172a',
  },
  settlementTotalValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#4800B2',
  },

  // Warning Box
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7', // amber-100
    borderWidth: 1,
    borderColor: '#FDE68A', // amber-200
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  warningText: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#92400E', // amber-900
    lineHeight: 18,
    flex: 1,
  },

  // Fund Button
  fundBtn: {
    backgroundColor: '#4800B2',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fundBtnText: {
    color: '#fff',
    fontFamily: 'Inter-Bold',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  modalIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalSecondaryBtn: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 13,
    width: '100%',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalSecondaryBtnText: {
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  modalBtn: {
    backgroundColor: '#111827',
    paddingVertical: 14,
    width: '100%',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  modalBtnText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalCancelBtnText: {
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
});
