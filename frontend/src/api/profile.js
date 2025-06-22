import api from "./auth"; // Axios instance from auth.js

// Get own profile data (followers, following count)
export const getMyProfile = async () => {
  const token = localStorage.getItem("token");
  const res = await api.get("/users/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// ✅ Get only posts by the logged-in user
export const getMyPosts = async () => {
  const token = localStorage.getItem("token");
  const res = await api.get("/posts/mine", {
    // ✅ changed here
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Delete a post
export const deletePost = async (postId) => {
  const token = localStorage.getItem("token");
  await api.delete(`/posts/${postId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Delete account
export const deleteMyAccount = async () => {
  const token = localStorage.getItem("token");
  await api.delete("/users/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
};
