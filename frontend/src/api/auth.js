import axios from "axios";

// Axios instance with base URL
const api = axios.create({
  baseURL: "http://127.0.0.1:8000", // Change if backend URL changes
});

// ---------------- LOGIN ----------------
export const login = async (username, password) => {
  const params = new URLSearchParams();
  params.append("username", username);
  params.append("password", password);

  const response = await api.post("/token", params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  const token = response.data.access_token;
  localStorage.setItem("token", token); // store token for auth
  return token; // return token string (not object)
};

// ---------------- REGISTER ----------------
export const registerUser = async (username, email, password) => {
  const response = await api.post("/users/", { username, email, password });
  return response.data; // user data from backend
};

// ---------------- LOGOUT ----------------
export const logout = () => {
  localStorage.removeItem("token"); // remove token
};

// ---------------- AUTH CHECK ----------------
export const isAuthenticated = () => {
  return !!localStorage.getItem("token"); // returns true/false
};

export default api;
