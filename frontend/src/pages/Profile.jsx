import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { getMyProfile, deletePost, deleteMyAccount } from "../api/profile";
import { getComments, addComment } from "../api/comments";
import { likePost, unlikePost } from "../api/post";
import { FaHeart, FaRegHeart, FaComment, FaTrash } from "react-icons/fa";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postStates, setPostStates] = useState({});
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isOppositeDark = theme === "light"; // Flip the theme

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }
      try {
        const profileData = await getMyProfile();
        setProfile(profileData);
        setPosts(profileData.posts);

        const initialStates = {};
        profileData.posts.forEach((post) => {
          initialStates[post.id] = {
            isLiked: post.is_liked_by_current_user,
            likesCount: post.likes_count,
            commentsCount: post.comments_count,
            showComments: false,
            comments: [],
            newComment: "",
          };
        });
        setPostStates(initialStates);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [navigate]);

  const handleLikeToggle = async (postId) => {
    const state = postStates[postId];
    try {
      if (state.isLiked) {
        await unlikePost(postId);
        setPostStates((prev) => ({
          ...prev,
          [postId]: {
            ...prev[postId],
            isLiked: false,
            likesCount: Math.max(prev[postId].likesCount - 1, 0),
          },
        }));
      } else {
        await likePost(postId);
        setPostStates((prev) => ({
          ...prev,
          [postId]: {
            ...prev[postId],
            isLiked: true,
            likesCount: prev[postId].likesCount + 1,
          },
        }));
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const toggleComments = async (postId) => {
    const state = postStates[postId];
    try {
      if (!state.showComments) {
        const commentsData = await getComments(postId);
        setPostStates((prev) => ({
          ...prev,
          [postId]: {
            ...prev[postId],
            showComments: true,
            comments: commentsData,
          },
        }));
      } else {
        setPostStates((prev) => ({
          ...prev,
          [postId]: {
            ...prev[postId],
            showComments: false,
          },
        }));
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleAddComment = async (e, postId) => {
    e.preventDefault();
    const newCommentText = postStates[postId].newComment.trim();
    if (!newCommentText) return;

    try {
      await addComment(postId, newCommentText);
      const updatedComments = await getComments(postId);
      setPostStates((prev) => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          comments: updatedComments,
          newComment: "",
          commentsCount: updatedComments.length,
        },
      }));
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm("Delete this post?")) {
      try {
        await deletePost(postId);
        setPosts(posts.filter((post) => post.id !== postId));
      } catch (err) {
        console.error("Failed to delete post:", err);
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Delete your account permanently?")) {
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

  if (loading) return <p className="text-center mt-10">Loading Profile...</p>;

  return (
    <div
      className={`min-h-screen pt-24 p-4 transition-colors duration-500 ${
        isOppositeDark
          ? "bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white"
          : "bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 text-gray-900"
      }`}
    >
      <div
        className={`max-w-3xl mx-auto p-8 rounded-3xl shadow-xl space-y-4 border backdrop-blur-md transition-all duration-500 ${
          isOppositeDark
            ? "bg-gray-900/70 border-gray-700"
            : "bg-white/30 border-white/40"
        }`}
      >
        <div className="text-center space-y-2">
          <h1
            className={`text-4xl font-bold ${
              isOppositeDark ? "text-blue-300" : "text-[#b78654]"
            }`}
          >
            @{profile.username}
          </h1>
          <p className="text-lg">
            Followers: {profile.followers_count} | Following:{" "}
            {profile.following_count}
          </p>
          <div className="flex justify-center space-x-4 mt-4">
            <button
              onClick={handleLogout}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full shadow transition"
            >
              Logout
            </button>
            <button
              onClick={handleDeleteAccount}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full shadow transition"
            >
              Delete Account
            </button>
          </div>
        </div>

        <h2
          className={`text-2xl font-semibold text-center border-b pb-2 ${
            isOppositeDark
              ? "text-white border-gray-600"
              : "text-[#b78654] border-[#b78654]"
          }`}
        >
          My Posts 📝
        </h2>

        {posts.length === 0 ? (
          <p className="text-center text-gray-500">You have no posts yet.</p>
        ) : (
          posts.map((post) => {
            const state = postStates[post.id];
            if (!state) return null;
            return (
              <div
                key={post.id}
                className={`p-4 rounded-2xl shadow space-y-2 border transition-all ${
                  isOppositeDark
                    ? "bg-gray-800 text-white border-gray-700"
                    : "bg-white/50 text-gray-800 border-white/40 backdrop-blur-md"
                }`}
              >
                <h3
                  className={`text-lg font-semibold ${
                    isOppositeDark ? "text-blue-300" : "text-[#b78654]"
                  }`}
                >
                  {post.title}
                </h3>
                <p>{post.content}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <button
                    onClick={() => handleLikeToggle(post.id)}
                    className="flex items-center space-x-1 text-green-500"
                  >
                    {state.isLiked ? <FaHeart /> : <FaRegHeart />}
                    <span>{state.likesCount}</span>
                  </button>
                  <button
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center space-x-1 text-blue-500"
                  >
                    <FaComment />
                    <span>{state.commentsCount}</span>
                  </button>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="ml-auto text-gray-400 hover:text-red-500"
                  >
                    <FaTrash />
                  </button>
                </div>

                {state.showComments && (
                  <div className="mt-4 space-y-2">
                    {state.comments.length === 0 ? (
                      <p className="text-gray-500">No comments yet.</p>
                    ) : (
                      state.comments.map((comment) => (
                        <p key={comment.id} className="text-sm">
                          <strong>@{comment.owner_username}:</strong>{" "}
                          {comment.content}
                        </p>
                      ))
                    )}
                    <form
                      onSubmit={(e) => handleAddComment(e, post.id)}
                      className="flex space-x-2 mt-2"
                    >
                      <input
                        type="text"
                        value={state.newComment}
                        onChange={(e) =>
                          setPostStates((prev) => ({
                            ...prev,
                            [post.id]: {
                              ...prev[post.id],
                              newComment: e.target.value,
                            },
                          }))
                        }
                        placeholder="Write a comment..."
                        className={`flex-1 rounded px-3 py-2 text-sm focus:outline-none ${
                          isOppositeDark
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white/70 border-white/40 text-gray-800 backdrop-blur-md"
                        }`}
                      />
                      <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition"
                      >
                        Add
                      </button>
                    </form>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
