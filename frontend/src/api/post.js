import axios from "axios";

// Axios instance (with token if needed)
const api = axios.create({
  baseURL: "http://127.0.0.1:8000", // Adjust to your FastAPI server URL
});

// Fetch posts with like/comment counts
export const getPostsWithCounts = async () => {
  const token = localStorage.getItem("token"); // JWT Token from localStorage
  const response = await api.get("/posts/with_counts/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Like a post
export const likePost = async (postId) => {
  const token = localStorage.getItem("token");
  await api.post(
    `/posts/${postId}/like`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

// Unlike a post
export const unlikePost = async (postId) => {
  const token = localStorage.getItem("token");
  await api.post(
    `/posts/${postId}/unlike`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

// Create comment
export const createComment = async (postId, content) => {
  const token = localStorage.getItem("token");
  const response = await api.post(
    `/comments/post/${postId}`,
    { content },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// Get comments for post
export const getComments = async (postId) => {
  const token = localStorage.getItem("token");
  const response = await api.get(`/comments/post/${postId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const createPost = async (postData) => {
  const token = localStorage.getItem("token");
  const res = await api.post("/posts/", postData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
