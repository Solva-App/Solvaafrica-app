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
  type: 'video' | 'data' | 'content' | string;
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
  setCampaigns: (campaigns: Campaign[]) => void;
  addCampaign: (campaign: Campaign) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  addSubmission: (submission: Submission) => void;
  updateSubmissionStatus: (id: string, status: Submission['status']) => void;
};

const INITIAL_CAMPAIGNS: Campaign[] = [];
const INITIAL_SUBMISSIONS: Submission[] = [];

export const useTaskStore = create<TaskStore>((set) => ({
  campaigns: INITIAL_CAMPAIGNS,
  submissions: INITIAL_SUBMISSIONS,
  draftCampaign: null,
  
  setDraftCampaign: (draft) => set({ draftCampaign: draft }),
  setCampaigns: (campaigns) => set({ campaigns }),
  
  addCampaign: (campaign) => set((state) => ({ 
    campaigns: [campaign, ...state.campaigns.filter(c => c.id !== campaign.id)] 
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
