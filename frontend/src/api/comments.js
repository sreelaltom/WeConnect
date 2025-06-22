import api from "./auth"; // Axios instance

export const getComments = async (postId) => {
  const token = localStorage.getItem("token");
  const res = await api.get(`/comments/${postId}`, {
    // ✅ Matches FastAPI route
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const addComment = async (postId, content) => {
  const token = localStorage.getItem("token");
  await api.post(
    `/comments/${postId}`, // ✅ Matches FastAPI route
    { content },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};
