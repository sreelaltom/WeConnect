import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext"; // ✅ Import theme context
import {
  getMyProfile,
  getMyPosts,
  deletePost,
  deleteMyAccount,
} from "../api/profile";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { theme } = useTheme(); // ✅ Global theme
  const isNavbarDark = theme === "dark"; // ✅ Navbar theme
  const isDarkMode = !isNavbarDark; // ✅ ProfileCard opposite to Navbar

  useEffect(() => {
    async function fetchData() {
      try {
        const profileData = await getMyProfile();
        const postData = await getMyPosts();
        setProfile(profileData);
        setPosts(postData);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleDeletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deletePost(postId);
        setPosts(posts.filter((post) => post.id !== postId));
      } catch (err) {
        console.error("Failed to delete post:", err);
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "⚠️ Are you sure you want to permanently delete your account? This cannot be undone."
      )
    ) {
      try {
        await deleteMyAccount();
        localStorage.removeItem("token");
        navigate("/");
      } catch (err) {
        console.error("Failed to delete account:", err);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (loading)
    return (
      <p className="text-center mt-10 text-xl font-semibold text-gray-700">
        Loading Profile...
      </p>
    );

  return (
    <div
      className={`min-h-screen p-6 pt-24 transition-colors duration-500 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white"
          : "bg-gradient-to-br from-pink-100 via-purple-200 to-indigo-300 text-gray-800"
      }`}
    >
      <div
        className={`max-w-3xl mx-auto rounded-3xl shadow-xl p-8 space-y-8 transition-all duration-500 border ${
          isDarkMode
            ? "bg-gray-900/70 backdrop-blur-md border-gray-700"
            : "bg-white/30 backdrop-blur-md border-white/40"
        }`}
      >
        {/* Profile Info */}
        <div className="flex flex-col items-center space-y-3">
          <h2
            className={`text-4xl font-extrabold drop-shadow-md ${
              isDarkMode ? "text-white" : "text-purple-700"
            }`}
          >
            @{profile.username}
          </h2>
          <div className="flex space-x-8 text-center">
            <div>
              <p
                className={`text-2xl font-bold ${
                  isDarkMode ? "text-white" : "text-purple-700"
                }`}
              >
                {profile.followers_count}
              </p>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Followers
              </p>
            </div>
            <div>
              <p
                className={`text-2xl font-bold ${
                  isDarkMode ? "text-white" : "text-purple-700"
                }`}
              >
                {profile.following_count}
              </p>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Following
              </p>
            </div>
          </div>
        </div>

        {/* My Posts */}
        <div>
          <h3
            className={`text-2xl font-semibold text-center border-b pb-2 ${
              isDarkMode
                ? "text-white border-gray-600"
                : "text-purple-700 border-purple-300"
            }`}
          >
            My Posts 📝
          </h3>

          {posts.length > 0 ? (
            <div className="space-y-4 mt-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className={`rounded-xl p-4 shadow-lg hover:shadow-2xl transition duration-300 space-y-2 border ${
                    isDarkMode
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "bg-white/60 border-white/40 text-gray-800 backdrop-blur-sm"
                  }`}
                >
                  <h4
                    className={`text-lg font-semibold ${
                      isDarkMode ? "text-purple-300" : "text-purple-800"
                    }`}
                  >
                    {post.title}
                  </h4>
                  <p>{post.content}</p>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="mt-2 bg-red-500 text-white px-4 py-1 rounded-full hover:bg-red-600 transition duration-300"
                  >
                    Delete Post
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center mt-4">You have no posts yet.</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 mt-6">
          <button
            onClick={handleLogout}
            className="bg-green-500 text-white px-6 py-2 rounded-full shadow-md hover:bg-green-600 transition duration-300"
          >
            Logout
          </button>
          <button
            onClick={handleDeleteAccount}
            className="bg-red-600 text-white px-6 py-2 rounded-full shadow-md hover:bg-red-700 transition duration-300"
          >
            Delete My Account
          </button>
        </div>
      </div>
    </div>
  );
}
