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
  const response = await AUTH_API_CLIENT.get("/community/posts");
  const data = response.data?.data ?? response.data ?? [];
  return data;
};

/** Fetch a single post with its comments by ID */
export const fetchPostById = async (id: string) => {
  const [postResponse, commentsResponse] = await Promise.all([
    AUTH_API_CLIENT.get(`/community/posts/${id}`).catch(() => null),
    AUTH_API_CLIENT.get(`/community/posts/${id}/comments`).catch(() => null),
  ]);

  if (!postResponse) return null;

  const raw = postResponse.data?.data ?? postResponse.data ?? null;
  const rawComments = commentsResponse?.data?.data ?? commentsResponse?.data ?? [];

  if (raw && raw.post) {
    return { 
      ...raw.post, 
      liked: raw.liked ?? false, 
      comments: Array.isArray(rawComments) ? rawComments : (rawComments.comments || [])
    };
  }
  return { ...raw, comments: Array.isArray(rawComments) ? rawComments : (rawComments.comments || []) };
};

/** Create a new community post (text + optional image) */
export const createCommunityPost = async (formData: FormData) => {
  const response = await AUTH_API_CLIENT.post("/community/posts", formData);
  return response.data;
};

/** Like a post — POST */
export const likePost = async (id: string) => {
  const response = await AUTH_API_CLIENT.post(`/community/posts/${id}/like`);
  return response.data;
};

/** Unlike a post — DELETE */
export const unlikePost = async (id: string) => {
  const response = await AUTH_API_CLIENT.delete(`/community/posts/${id}/like`);
  return response.data;
};

/** Increment view count for a post */
export const viewPost = async (id: string) => {
  const response = await AUTH_API_CLIENT.post(`/community/posts/${id}/view`);
  return response.data;
};

/** Vote on a poll */
export const voteOnPoll = async ({ postId, optionIndex }: { postId: string; optionIndex: number }) => {
  const response = await AUTH_API_CLIENT.post(`/community/posts/poll/${postId}/vote`, { optionIndex });
  return response.data;
};

/** Add a comment to a post */
export const commentOnPost = async ({
  id,
  message,
  parentid,
}: {
  id: string;
  message: string;
  parentid?: string;
}) => {
  const payload: any = { content: message };
  if (parentid) {
    payload.parentId = parentid;
  }
  const response = await AUTH_API_CLIENT.post(`/community/posts/${id}/comments`, payload);
  return response.data;
};

/** Like a comment — POST */
export const likeComment = async (commentId: string) => {
  const response = await AUTH_API_CLIENT.post(
    `/community/posts/comments/${commentId}/like`
  );
  return response.data;
};

/** Unlike a comment — DELETE */
export const unlikeComment = async (commentId: string) => {
  const response = await AUTH_API_CLIENT.delete(
    `/community/posts/comments/${commentId}/like`
  );
  return response.data;
};

/** Delete a comment */
export const deleteComment = async (commentId: string) => {
  const response = await AUTH_API_CLIENT.delete(`/community/posts/comments/${commentId}`);
  return response.data;
};

/** Delete a post (own posts only) */
export const deletePost = async (id: string) => {
  const response = await AUTH_API_CLIENT.delete(`/community/posts/${id}`);
  return response.data;
};

/** Fetch trending hashtags (server-ranked) */
export const fetchTrendingTopics = async () => {
  const response = await AUTH_API_CLIENT.get("/community/hashtags/trending");
  return response.data?.data ?? response.data ?? [];
};

/** Fetch Course Academy courses from the admin repository */
export const fetchAcademyCourses = async () => {
  const response = await AUTH_API_CLIENT.get("/courses");
  return response.data?.data ?? response.data ?? [];
};

