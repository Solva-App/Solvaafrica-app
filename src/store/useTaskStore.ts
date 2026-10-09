import { create } from 'zustand';

export type Campaign = {
  id: string;
  title: string;
  companyName: string; // Maps to sponsorName
  companyInitials: string;
  rewardAmount: number;
  poolAmount: number; // Maps to totalPool
  availableSlots: number; 
  totalSlots: number; // Maps to totalSpots
  deadline: string; // Keep for UI fallback
  category: string;
  requirements: string[];
  guidelines: string[];
  type: 'video' | 'data' | 'content';
  // New backend fields
  overview?: string;
  selectionCriteria?: string[];
  howToSubmit?: string[];
  startDate?: string;
  endDate?: string;
  sponsorLogoUri?: string;
  bannerImageUri?: string;
};

export type Submission = {
  id: string;
  campaignId: string;
  studentName: string;
  studentInitials: string;
  status: 'Pending' | 'Active' | 'Approved' | 'Rejected';
  submittedAt: string;
  videoUrl?: string; // For creator tasks
  accuracyScore?: number; // For AI tasks
};

type TaskStore = {
  campaigns: Campaign[];
  submissions: Submission[];
  draftCampaign: Partial<Campaign> | null;
  setDraftCampaign: (draft: Partial<Campaign>) => void;
  addCampaign: (campaign: Campaign) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  addSubmission: (submission: Submission) => void;
  updateSubmissionStatus: (id: string, status: Submission['status']) => void;
};

// Seed with some initial data matching the designs
const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'c1',
    title: 'Evaluate Yoruba & Pidgin LLM Chat Responses',
    companyName: 'Anthropic / LocalNLP Lab',
    companyInitials: 'NL',
    rewardAmount: 250,
    poolAmount: 250000,
    availableSlots: 64,
    totalSlots: 1000,
    deadline: 'Oct 12, 2026',
    category: 'AI / DATA',
    requirements: [
      'Fluency in Nigerian Pidgin or conversational Yoruba.',
      'Minimum 85% qualification accuracy score.',
      'Device: Smartphone or laptop with stable internet connection.',
      'Must complete all 20 evaluation pairs in a single session.'
    ],
    guidelines: [
      'Rate on a scale of 1-5 for cultural fluency, emotional tone, and relevance.',
      'Flag synthetic or robotic phrasings that sound unnatural to a native speaker.',
      'Do not use automated translation tools; provide authentic human feedback.'
    ],
    type: 'data',
  },
  {
    id: 'c2',
    title: 'Share Poster Links',
    companyName: 'Riplanet Solutions',
    companyInitials: 'R',
    rewardAmount: 150,
    poolAmount: 50000,
    availableSlots: 12,
    totalSlots: 50,
    deadline: 'Nov 1, 2026',
    category: 'MARKETING',
    requirements: ['Verified Student Network Badge', 'Minimum 500 followers'],
    guidelines: ['Do not delete post before 24h'],
    type: 'content',
  }
];

const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 's1',
    campaignId: 'c1',
    studentName: 'Chidinma Okafor',
    studentInitials: 'CO',
    status: 'Pending',
    submittedAt: '2m ago',
    videoUrl: 'https://instagram.com/reel/123',
    accuracyScore: 96.2,
  },
  {
    id: 's2',
    campaignId: 'c1',
    studentName: 'Tunde Bakare',
    studentInitials: 'TB',
    status: 'Active',
    submittedAt: '5m ago',
  }
];

export const useTaskStore = create<TaskStore>((set) => ({
  campaigns: INITIAL_CAMPAIGNS,
  submissions: INITIAL_SUBMISSIONS,
  draftCampaign: null,
  
  setDraftCampaign: (draft) => set({ draftCampaign: draft }),
  
  addCampaign: (campaign) => set((state) => ({ 
    campaigns: [campaign, ...state.campaigns] 
  })),

  updateCampaign: (id, updates) => set((state) => ({
    campaigns: state.campaigns.map(c => c.id === id ? { ...c, ...updates } : c)
  })),
  
  deleteCampaign: (id) => set((state) => ({
    campaigns: state.campaigns.filter(c => c.id !== id)
  })),
  
  addSubmission: (submission) => set((state) => ({
    submissions: [submission, ...state.submissions]
  })),
  
  updateSubmissionStatus: (id, status) => set((state) => ({
    submissions: state.submissions.map(s => s.id === id ? { ...s, status } : s)
  }))
}));
