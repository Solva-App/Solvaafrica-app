import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  Image,
  Modal,
  Animated,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useTaskStore } from '../../store/useTaskStore';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PickedAsset {
  uri: string;
  name: string;
  size?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateTaskScreen() {
  const router = useRouter();
  const setDraftCampaign = useTaskStore(state => state.setDraftCampaign);
  const [validationModal, setValidationModal] = useState<{ visible: boolean; fields: string[] }>({ visible: false, fields: [] });

  // ── Basic Detail Fields ──────────────────────────────────────────────────
  const [taskTitle, setTaskTitle] = useState('');
  const [taskType, setTaskType] = useState('');
  const [taskOverview, setTaskOverview] = useState('');
  const [sponsorName, setSponsorName] = useState('');
  const [rewardPool, setRewardPool] = useState('');
  const [totalSpots, setTotalSpots] = useState('');
  const [minAccuracy, setMinAccuracy] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // ── Tag Section States ───────────────────────────────────────────────────
  const [requirements, setRequirements] = useState<string[]>([]);
  const [requirementInput, setRequirementInput] = useState('');

  const [guidelines, setGuidelines] = useState<string[]>([]);
  const [guidelineInput, setGuidelineInput] = useState('');

  const [selectionCriteria, setSelectionCriteria] = useState<string[]>([]);
  const [selectionInput, setSelectionInput] = useState('');

  const [howToSubmit, setHowToSubmit] = useState<string[]>([]);
  const [submitInput, setSubmitInput] = useState('');

  // ── Asset States ─────────────────────────────────────────────────────────
  const [sponsorLogo, setSponsorLogo] = useState<PickedAsset | null>(null);
  const [bannerImage, setBannerImage] = useState<PickedAsset | null>(null);
  const [dataset, setDataset] = useState<PickedAsset | null>(null);

  // ── Tag Helpers ──────────────────────────────────────────────────────────

  const addTag = (
    value: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    setInput: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setList([...list, trimmed]);
    setInput('');
  };

  const removeTag = (
    index: number,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setList(list.filter((_, i) => i !== index));
  };

  // ── Asset Pickers ────────────────────────────────────────────────────────

  const pickSponsorLogo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      const fileName = asset.uri.split('/').pop() ?? 'logo.png';
      setSponsorLogo({ uri: asset.uri, name: fileName, size: asset.fileSize });
    }
  };

  const pickBannerImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      const fileName = asset.uri.split('/').pop() ?? 'banner.png';
      setBannerImage({ uri: asset.uri, name: fileName, size: asset.fileSize });
    }
  };

  const pickDataset = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
    // expo-document-picker v11+ returns { canceled, assets }
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setDataset({ uri: asset.uri, name: asset.name, size: asset.size });
    }
  };

  // ── Validation & Submit ──────────────────────────────────────────────────

  const handleProceed = () => {
    const missing: string[] = [];
    if (!taskTitle.trim()) missing.push('Task Title');
    if (!sponsorName.trim()) missing.push('Sponsor / Company Name');
    if (!rewardPool.trim()) missing.push('Reward Pool / Pay');
    if (!totalSpots.trim()) missing.push('Total Spots / Workers Needed');

    if (missing.length > 0) {
      setValidationModal({ visible: true, fields: missing });
      return;
    }

    const spotsNum = parseInt(totalSpots, 10) || 0;
    const rewardNum = parseFloat(rewardPool) || 0;

    const draft = {
      title: taskTitle.trim(),
      companyName: sponsorName.trim(),
      companyInitials: sponsorName.trim().slice(0, 2).toUpperCase(),
      rewardAmount: rewardNum,
      poolAmount: spotsNum * rewardNum,
      availableSlots: spotsNum,
      totalSlots: spotsNum,
      deadline: endDate.trim() || 'TBD',
      category: taskType.trim() || 'General',
      requirements,
      guidelines,
      type: 'data',
      overview: taskOverview.trim(),
      selectionCriteria: selectionCriteria,
      howToSubmit: howToSubmit,
      startDate: startDate.trim(),
      endDate: endDate.trim(),
      sponsorLogoUri: sponsorLogo?.uri,
      bannerImageUri: bannerImage?.uri,
    };

    setDraftCampaign(draft);

    // On web, Zustand can reset between routes — persist to sessionStorage as backup
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        // Strip out massive base64 image URIs so we don't blow up the 5MB browser quota
        const lightDraft = { ...draft };
        if (lightDraft.sponsorLogoUri?.startsWith('data:')) lightDraft.sponsorLogoUri = '';
        if (lightDraft.bannerImageUri?.startsWith('data:')) lightDraft.bannerImageUri = '';
        window.sessionStorage.setItem('solva_draft_campaign', JSON.stringify(lightDraft));
      } catch (e) {
        console.warn('Session storage quota exceeded. Draft will rely solely on memory store.', e);
      }
    }

    router.push('/review-fund');
  };

  // ── Render Helpers ───────────────────────────────────────────────────────

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (t: string) => void,
    multiline = false,
    placeholder = '',
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );

  const renderTag = (
    text: string,
    index: number,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
  ) => (
    <View style={styles.tagItem} key={index}>
      <Text style={styles.tagText} numberOfLines={1} ellipsizeMode="tail">
        {text}
      </Text>
      <TouchableOpacity style={styles.trashBtn} onPress={() => removeTag(index, list, setList)}>
        <Feather name="trash-2" size={14} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );

  const renderSectionTags = (
    label: string,
    sublabel: string,
    tags: string[],
    setTags: React.Dispatch<React.SetStateAction<string[]>>,
    inputValue: string,
    setInputValue: React.Dispatch<React.SetStateAction<string>>,
  ) => (
    <View style={styles.sectionInputGroup}>
      <View style={styles.sectionHeaderRow}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.subLabel}>{sublabel}</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => addTag(inputValue, tags, setTags, setInputValue)}
        >
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>
      {/* Input for new tag */}
      <TextInput
        style={[styles.input, { marginBottom: 10 }]}
        value={inputValue}
        onChangeText={setInputValue}
        placeholder={`Type a ${label.toLowerCase()} item…`}
        placeholderTextColor="#94a3b8"
        returnKeyType="done"
        onSubmitEditing={() => addTag(inputValue, tags, setTags, setInputValue)}
      />
      <View style={styles.tagsContainer}>
        {tags.map((t, i) => renderTag(t, i, tags, setTags))}
      </View>
    </View>
  );

  // ── Asset Upload Rows ────────────────────────────────────────────────────

  const renderLogoSection = () => {
    if (sponsorLogo) {
      return (
        <TouchableOpacity style={styles.uploadedBox} onPress={pickSponsorLogo} activeOpacity={0.8}>
          <View style={styles.uploadedIconSquareP}>
            <Image
              source={{ uri: sponsorLogo.uri }}
              style={{ width: 40, height: 40, borderRadius: 8 }}
              resizeMode="cover"
            />
          </View>
          <View style={styles.uploadedTextCol}>
            <Text style={styles.uploadedTitle} numberOfLines={1}>
              {sponsorLogo.name}
            </Text>
            <Text style={styles.uploadedSub}>
              {sponsorLogo.size ? `${(sponsorLogo.size / 1024).toFixed(0)} KB • ` : ''}Uploaded
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Feather name="check" size={12} color="#10b981" />
            <Text style={styles.statusText}>Ready</Text>
          </View>
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity style={styles.uploadPlaceholder} onPress={pickSponsorLogo} activeOpacity={0.8}>
        <Feather name="upload" size={20} color="#610B99" />
        <Text style={styles.uploadPlaceholderText}>Tap to select sponsor logo</Text>
      </TouchableOpacity>
    );
  };

  const renderBannerSection = () => {
    if (bannerImage) {
      return (
        <TouchableOpacity style={styles.uploadedBoxCol} onPress={pickBannerImage} activeOpacity={0.8}>
          <Image
            source={{ uri: bannerImage.uri }}
            style={styles.bannerPreviewImage}
            resizeMode="cover"
          />
          <View style={styles.bannerBottomRow}>
            <View style={styles.uploadedTextCol}>
              <Text style={styles.uploadedTitle} numberOfLines={1}>
                {bannerImage.name}
              </Text>
              <Text style={styles.uploadedSub}>
                {bannerImage.size ? `${(bannerImage.size / 1024 / 1024).toFixed(1)} MB • ` : ''}Ready
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Feather name="check" size={12} color="#10b981" />
              <Text style={styles.statusText}>Active</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity style={styles.uploadPlaceholder} onPress={pickBannerImage} activeOpacity={0.8}>
        <MaterialCommunityIcons name="image-outline" size={24} color="#610B99" />
        <Text style={styles.uploadPlaceholderText}>Tap to select banner image</Text>
      </TouchableOpacity>
    );
  };

  const renderDatasetSection = () => {
    if (dataset) {
      return (
        <TouchableOpacity style={styles.uploadedBox} onPress={pickDataset} activeOpacity={0.8}>
          <View style={styles.uploadedIconSquareB}>
            <Feather name="bar-chart-2" size={16} color="#3b82f6" />
          </View>
          <View style={styles.uploadedTextCol}>
            <Text style={styles.uploadedTitle} numberOfLines={1}>
              {dataset.name}
            </Text>
            <Text style={styles.uploadedSub}>
              {dataset.size ? `${(dataset.size / 1024 / 1024).toFixed(1)} MB • ` : ''}Loaded
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Feather name="check" size={12} color="#10b981" />
            <Text style={styles.statusText}>Loaded</Text>
          </View>
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity style={styles.uploadPlaceholder} onPress={pickDataset} activeOpacity={0.8}>
        <Feather name="file-text" size={20} color="#610B99" />
        <Text style={styles.uploadPlaceholderText}>Tap to select dataset file</Text>
      </TouchableOpacity>
    );
  };

  // ── Computed Budget ──────────────────────────────────────────────────────
  const spotsNum = parseInt(totalSpots, 10) || 0;
  const rewardNum = parseFloat(rewardPool) || 0;
  const budget = spotsNum * rewardNum;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Top Header */}
        <View style={styles.topNav}>
          <View style={styles.companyFlowPill}>
            <Text style={styles.companyFlowText}>Company Flow</Text>
          </View>
          <View style={styles.breadcrumbRow}>
            <TouchableOpacity style={styles.breadcrumbItem} onPress={() => router.back()}>
              <View style={styles.purpleDiamond} />
              <Text style={styles.breadcrumbTextActive}>CREATE TASK</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.breadcrumbItem}>
              <View style={styles.purpleDiamond} />
              <Text style={styles.breadcrumbText}>MANAGE TASK</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.mainTitle}>
          Build and launch a <Text style={styles.purpleText}>task</Text>
        </Text>
        <Text style={styles.subtitle}>
          Manage task details, assets, timelines, submission rules, rewards, and participant requirements from one modern dashboard.
        </Text>

        {/* Basic Details Box */}
        <View style={styles.card}>
          {renderInput('Task Title', taskTitle, setTaskTitle, false, 'e.g. Evaluate AI responses')}
          {renderInput('Task Type', taskType, setTaskType, false, 'e.g. AI / Data Evaluation')}
          {renderInput(
            'Task Overview',
            taskOverview,
            setTaskOverview,
            true,
            'Describe what participants will do…',
          )}
          {renderInput('Sponsor / Company Name', sponsorName, setSponsorName, false, 'e.g. Anthropic & Lagos Tech Lab')}
          {renderInput('Reward Pool / Pay (₦)', rewardPool, setRewardPool, false, 'e.g. 150')}
          {renderInput('Total Spots / Workers Needed', totalSpots, setTotalSpots, false, 'e.g. 500')}
          {renderInput('Minimum Accuracy Required', minAccuracy, setMinAccuracy, false, 'e.g. 85%')}
          {renderInput('Start Date', startDate, setStartDate, false, 'e.g. Sept 01, 2026')}
          {renderInput('End Date', endDate, setEndDate, false, 'e.g. Sept 20, 2026')}
        </View>

        {/* Requirements & Rules Box */}
        <View style={styles.card}>
          {renderSectionTags(
            'Requirements',
            'Add all necessary requirements',
            requirements,
            setRequirements,
            requirementInput,
            setRequirementInput,
          )}
          {renderSectionTags(
            'Guidelines',
            'Add all necessary guidelines',
            guidelines,
            setGuidelines,
            guidelineInput,
            setGuidelineInput,
          )}
          {renderSectionTags(
            'Selection Criteria',
            'Add all necessary selection criteria',
            selectionCriteria,
            setSelectionCriteria,
            selectionInput,
            setSelectionInput,
          )}
          {renderSectionTags(
            'How To Submit',
            'Add all necessary how to submit',
            howToSubmit,
            setHowToSubmit,
            submitInput,
            setSubmitInput,
          )}
        </View>

        {/* Assets & Finalize Box */}
        <View style={styles.card}>
          <View style={{ marginBottom: 20 }}>
            <Text style={[styles.label, { fontSize: 14 }]}>Upload Assets</Text>
            <Text style={styles.subLabel}>
              Add branding, banners, or a dataset — whatever applies to this task
            </Text>
          </View>

          {/* Sponsor Logo */}
          <Text style={styles.label}>Sponsor Logo</Text>
          {renderLogoSection()}

          {/* Banner Image */}
          <Text style={styles.label}>Banner Image</Text>
          {renderBannerSection()}

          {/* Dataset */}
          <Text style={styles.label}>Dataset (for AI / Data tasks)</Text>
          {renderDatasetSection()}

          {/* Confidentiality */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confidentiality</Text>
            <View style={styles.confidentialityBox}>
              <Text style={styles.confidentialityTextMain}>
                Confidential — auto-delete after review window
              </Text>
            </View>
          </View>

          {/* Budget Summary */}
          <View style={styles.budgetBox}>
            <View>
              <Text style={styles.budgetLabel}>Total budget</Text>
              <Text style={styles.budgetSub}>
                {spotsNum > 0 && rewardNum > 0
                  ? `${spotsNum} workers × ₦${rewardNum}`
                  : 'Fill spots & reward above'}
              </Text>
            </View>
            <Text style={styles.budgetValue}>
              {budget > 0 ? `₦${budget.toLocaleString()}` : '₦0'}
            </Text>
          </View>

          <TouchableOpacity style={styles.createBtn} activeOpacity={0.8} onPress={handleProceed}>
            <Text style={styles.createBtnText}>Create Task</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Validation Modal ──────────────────────────────────────────── */}
      <Modal
        visible={validationModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setValidationModal({ visible: false, fields: [] })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Icon Header */}
            <View style={styles.modalIconWrap}>
              <Feather name="alert-circle" size={28} color="#fff" />
            </View>

            <Text style={styles.modalTitle}>Missing Required Fields</Text>
            <Text style={styles.modalSubtitle}>Please complete the following before proceeding:</Text>

            {/* Field list */}
            <View style={styles.modalFieldList}>
              {validationModal.fields.map((field, i) => (
                <View key={i} style={styles.modalFieldRow}>
                  <View style={styles.modalBullet} />
                  <Text style={styles.modalFieldText}>{field}</Text>
                </View>
              ))}
            </View>

            {/* CTA */}
            <TouchableOpacity
              style={styles.modalBtn}
              activeOpacity={0.85}
              onPress={() => setValidationModal({ visible: false, fields: [] })}
            >
              <Text style={styles.modalBtnText}>Got it, I'll fix it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  topNav: {
    marginBottom: 24,
  },
  companyFlowPill: {
    backgroundColor: '#610B99',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
    alignSelf: 'center',
  },
  companyFlowText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    fontSize: 11,
  },
  breadcrumbRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  purpleDiamond: {
    width: 6,
    height: 6,
    backgroundColor: '#610B99',
    transform: [{ rotate: '45deg' }],
    marginRight: 6,
  },
  breadcrumbTextActive: {
    color: '#610B99',
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  breadcrumbText: {
    color: '#610B99',
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
    color: '#610B99',
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#0f172a',
    marginBottom: 8,
  },
  subLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#0f172a',
  },
  textArea: {
    height: 100,
    paddingTop: 16,
  },
  sectionInputGroup: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  addBtn: {
    backgroundColor: '#610B99',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addBtnText: {
    color: '#fff',
    fontFamily: 'Inter-Medium',
    fontSize: 11,
  },
  tagsContainer: {
    gap: 8,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 8,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 8,
  },
  tagText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#0f172a',
    flex: 1,
    marginRight: 8,
  },
  trashBtn: {
    backgroundColor: '#fee2e2',
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Upload placeholder (no file selected yet)
  uploadPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F0FF',
    borderWidth: 1,
    borderColor: '#D8B4FE',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    gap: 10,
  },
  uploadPlaceholderText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#610B99',
  },

  // Uploaded States
  uploadedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  uploadedBoxCol: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  bannerPreviewPlaceholder: {
    height: 120,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  bannerPreviewImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 12,
  },
  bannerBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  uploadedIconSquareP: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#E9D5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  uploadedIconSquareB: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  uploadedTextCol: {
    flex: 1,
  },
  uploadedTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#0f172a',
    marginBottom: 2,
  },
  uploadedSub: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    color: '#64748b',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontFamily: 'Inter-Bold',
    fontSize: 11,
    color: '#10b981',
    marginLeft: 4,
  },

  confidentialityBox: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  confidentialityTextMain: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#0f172a',
  },
  budgetBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 20,
  },
  budgetLabel: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#0f172a',
    marginBottom: 4,
  },
  budgetSub: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#94a3b8',
  },
  budgetValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#610B99',
  },
  createBtn: {
    backgroundColor: '#610B99',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBtnText: {
    color: '#fff',
    fontFamily: 'Inter-Bold',
    fontSize: 14,
  },
  // ── Validation Modal ────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: '#1a0533',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(147,51,234,0.3)',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  modalIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#fff',
    marginBottom: 6,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#a78bfa',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalFieldList: {
    width: '100%',
    backgroundColor: 'rgba(124,58,237,0.12)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    gap: 10,
  },
  modalFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalBullet: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#a855f7',
  },
  modalFieldText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    color: '#e9d5ff',
  },
  modalBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
  },
  modalBtnText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#fff',
    letterSpacing: 0.3,
  },
});
