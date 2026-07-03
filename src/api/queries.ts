// get slider images
import { AUTH_API_CLIENT, PUB_API_CLIENT } from "./apiClient";

export const getSliderImages = async () => {
  try {
    const res = await PUB_API_CLIENT.get("/slider");
    if (res.status === 200) {
      const responseData = res.data?.data;
      const slidesImages: string[] = [];
      console.log(res.data?.data, "slides");
      responseData.forEach((current: any) => {
        slidesImages.push(current.url);
      });

      return slidesImages;
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getUserSubscriptionStatus = async () => {
  try {
    const response = await AUTH_API_CLIENT.get("/sub/status");
    if (response.status === 200) {
      return response.data.isSubscribed;
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

// ─────────────────────────────────────────────────────────
// COMMUNITY API
// ─────────────────────────────────────────────────────────

/** Fetch all community posts (feed) */
export const fetchCommunityPosts = async () => {
  const response = await AUTH_API_CLIENT.get("/community");
  return response.data?.data ?? response.data ?? [];
};

/** Fetch a single post with its comments by ID */
export const fetchPostById = async (id: string) => {
  const response = await AUTH_API_CLIENT.get(`/community/${id}`);
  return response.data?.data ?? response.data ?? null;
};

/** Create a new community post (text + optional image) */
export const createCommunityPost = async (formData: FormData) => {
  const response = await AUTH_API_CLIENT.post("/community", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/** Toggle like on a post */
export const likePost = async (id: string) => {
  const response = await AUTH_API_CLIENT.post(`/community/like/${id}`);
  return response.data;
};

/** Add a comment to a post */
export const commentOnPost = async ({
  id,
  message,
}: {
  id: string;
  message: string;
}) => {
  const response = await AUTH_API_CLIENT.post(`/community/comment/${id}`, {
    message,
  });
  return response.data;
};

/** Toggle like on a comment */
export const likeComment = async (commentId: string) => {
  const response = await AUTH_API_CLIENT.post(
    `/community/comment/like/${commentId}`
  );
  return response.data;
};

/** Delete a post (own posts only) */
export const deletePost = async (id: string) => {
  const response = await AUTH_API_CLIENT.delete(`/community/${id}`);
  return response.data;
};

/** Fetch trending hashtags (server-ranked) */
export const fetchTrendingTopics = async () => {
  const response = await AUTH_API_CLIENT.get("/community/trending");
  return response.data?.data ?? response.data ?? [];
};

/** Fetch Course Academy courses from the admin repository */
export const fetchAcademyCourses = async () => {
  const response = await AUTH_API_CLIENT.get("/academy");
  return response.data?.data ?? response.data ?? [];
};

