import { create } from "zustand";

export interface Post {
  id: string;
  author: string;
  campus: string;
  avatar: string;
  badge: "blue-check" | "pink-star" | "none";
  date: string;
  content: string;
  highlight?: string;
  views: string | null;
  image?: string;
}

interface CommunityStore {
  posts: Post[];
  addPost: (post: Post) => void;
}

// Initial mock data
const INITIAL_POSTS: Post[] = [
  {
    id: "p1",
    author: "Tunde",
    campus: "UNILAG",
    avatar: "https://i.pravatar.cc/150?img=11",
    badge: "blue-check",
    date: "Mar 12, 2024",
    content: "Just cashed out my N15,000 withdrawal from Solva Wallet! Hustle pays, we move! 💸🔥",
    highlight: "N15,000",
    views: "12.3K",
  },
  {
    id: "p2",
    author: "Blessing",
    campus: "OAU",
    avatar: "https://i.pravatar.cc/150?img=5",
    badge: "pink-star",
    date: "Mar 12, 2024",
    content: "Who's ready for the #ExamPrep2026 session tonight? I've got the Economics packs ready for everyone! 📚✨",
    highlight: "#ExamPrep2026",
    views: null,
  },
];

export const useCommunityStore = create<CommunityStore>((set) => ({
  posts: INITIAL_POSTS,
  addPost: (newPost) => set((state) => ({ posts: [newPost, ...state.posts] })),
}));
