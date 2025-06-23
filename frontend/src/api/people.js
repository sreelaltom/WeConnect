import api from "./auth";

export const getAllUsers = async () => {
  // 🔍 Changed from getAllPeople to getAllUsers
  const token = localStorage.getItem("token");
  const res = await api.get("/users/", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const followUser = async (userId) => {
  const token = localStorage.getItem("token");
  await api.post(`/users/${userId}/follow`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const unfollowUser = async (userId) => {
  const token = localStorage.getItem("token");
  await api.post(`/users/${userId}/unfollow`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
export const getUserProfile = async (userId) => {
  const token = localStorage.getItem("token");
  const res = await api.get(`/users/${userId}/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
