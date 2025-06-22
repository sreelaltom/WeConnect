import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
        localStorage.removeItem("token"); // Remove token
        navigate("/"); // ✅ Redirect to '/' (Login/Auth page)
      } catch (err) {
        console.error("Failed to delete account:", err);
      }
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 pt-24 p-4">
      <div className="max-w-xl mx-auto bg-white/30 backdrop-blur-lg rounded-xl shadow-xl p-8 space-y-6">
        <h2 className="text-3xl font-extrabold text-center text-purple-700 drop-shadow-md">
          @{profile.username}
        </h2>

        <div className="flex justify-center space-x-8 mt-4 text-gray-800">
          <div className="text-center">
            <p className="text-xl font-bold text-purple-700">
              {profile.followers_count}
            </p>
            <p className="text-gray-600 text-sm">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-purple-700">
              {profile.following_count}
            </p>
            <p className="text-gray-600 text-sm">Following</p>
          </div>
        </div>

        <h3 className="text-2xl font-semibold text-center text-purple-700 border-b pb-2">
          My Posts 📝
        </h3>

        {posts.length > 0 ? (
          posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-lg p-4 shadow-md hover:shadow-xl transition duration-300 space-y-2"
            >
              <h4 className="text-lg font-semibold text-purple-800">
                {post.title}
              </h4>
              <p className="text-gray-700">{post.content}</p>
              <button
                onClick={() => handleDeletePost(post.id)}
                className="mt-2 bg-red-500 text-white px-4 py-1 rounded-full hover:bg-red-600 transition duration-300"
              >
                Delete Post
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600">You have no posts yet.</p>
        )}

        {/* Delete Account Button */}
        <div className="text-center mt-8">
          <button
            onClick={handleDeleteAccount}
            className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition duration-300"
          >
            Delete My Account
          </button>
        </div>
      </div>
    </div>
  );
}
