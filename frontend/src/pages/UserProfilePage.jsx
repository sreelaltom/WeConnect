import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { getUserProfile, followUser, unfollowUser } from "../api/people";
import { getPostsByUser, likePost, unlikePost } from "../api/post";
import { getComments, addComment } from "../api/comments";
import { FaHeart, FaRegHeart, FaComment } from "react-icons/fa";

export default function UserProfilePage() {
  const { userId } = useParams();
  const { theme } = useTheme();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false); // ✅ Follow state
  const [postStates, setPostStates] = useState({});
  const isOppositeDarkMode = theme === "light";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileData = await getUserProfile(userId);
        setProfile(profileData);
        setIsFollowing(profileData.is_following); // ✅ Assume backend sends 'is_following'

        const postData = await getPostsByUser(userId);
        setPosts(postData);

        const initialStates = {};
        postData.forEach((post) => {
          initialStates[post.id] = {
            isLiked: post.is_liked_by_current_user,
            likesCount: post.likes_count ?? 0,
            commentsCount: post.comments_count ?? 0,
            showComments: false,
            comments: [],
            newComment: "",
          };
        });
        setPostStates(initialStates);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await unfollowUser(userId);
        setIsFollowing(false);
        setProfile((prev) => ({
          ...prev,
          followers_count: prev.followers_count - 1,
        }));
      } else {
        await followUser(userId);
        setIsFollowing(true);
        setProfile((prev) => ({
          ...prev,
          followers_count: prev.followers_count + 1,
        }));
      }
    } catch (error) {
      console.error("Error following/unfollowing:", error);
    }
  };

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
    const state = postStates[postId];
    if (!state.newComment.trim()) return;
    try {
      await addComment(postId, state.newComment);
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
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (!profile)
    return <div className="p-4 text-center">Profile not found.</div>;

  return (
    <div
      className={`min-h-screen pt-24 p-6 transition-colors duration-500 ${
        isOppositeDarkMode
          ? "bg-gradient-to-b from-gray-800 via-gray-900 to-black text-white"
          : "bg-gradient-to-b from-gray-100 via-gray-200 to-gray-300 text-gray-900"
      }`}
    >
      {/* Profile Card */}
      <div
        className={`mx-auto max-w-3xl p-8 rounded-3xl shadow-xl backdrop-blur-md text-center border ${
          isOppositeDarkMode
            ? "bg-gray-900/70 border-gray-700"
            : "bg-white/30 border-white/40"
        }`}
      >
        <h1
          className={`text-4xl font-bold ${
            isOppositeDarkMode ? "text-white" : "text-[#b78654]"
          }`}
        >
          @{profile.username}
        </h1>
        <div
          className={`flex justify-center space-x-8 mt-4 text-lg ${
            isOppositeDarkMode ? "text-gray-300" : "text-gray-600"
          }`}
        >
          <p>Followers: {profile.followers_count}</p>
          <p>Following: {profile.following_count}</p>
        </div>

        {/* Follow/Unfollow Button */}
        <button
          onClick={handleFollowToggle}
          className={`mt-4 px-6 py-2 rounded-full shadow-md transition duration-300 ${
            isFollowing
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-green-500 hover:bg-green-600 text-white"
          }`}
        >
          {isFollowing ? "Unfollow" : "Follow"}
        </button>
      </div>

      {/* Posts Section */}
      <h2
        className={`text-2xl font-bold mt-10 mb-6 text-center ${
          isOppositeDarkMode ? "text-white" : "text-[#b78654]"
        }`}
      >
        Posts
      </h2>

      <div className="flex flex-col items-center space-y-6">
        {posts.length === 0 ? (
          <p
            className={`${
              isOppositeDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            No posts yet.
          </p>
        ) : (
          posts.map((post) => {
            const state = postStates[post.id];
            if (!state) return null;

            return (
              <div
                key={post.id}
                className={`w-full max-w-3xl rounded-3xl p-6 shadow-md backdrop-blur-md border ${
                  isOppositeDarkMode
                    ? "bg-gray-900/70 border-gray-700 text-white"
                    : "bg-white/30 border-white/40 text-gray-900"
                }`}
              >
                <h3
                  className={`text-xl font-bold mb-2 ${
                    isOppositeDarkMode ? "text-purple-300" : "text-[#b78654]"
                  }`}
                >
                  {post.title}
                </h3>
                <p>{post.content}</p>

                <div className="flex items-center justify-center space-x-6 mt-4">
                  <button
                    onClick={() => handleLikeToggle(post.id)}
                    className="flex items-center space-x-2 text-green-500 hover:bg-green-600 hover:text-white px-4 py-2 rounded transition"
                  >
                    {state.isLiked ? <FaHeart /> : <FaRegHeart />}
                    <span>{state.likesCount}</span>
                  </button>

                  <button
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center space-x-2 text-blue-500 hover:bg-blue-600 hover:text-white px-4 py-2 rounded transition"
                  >
                    <FaComment />
                    <span>{state.commentsCount}</span>
                  </button>
                </div>

                {state.showComments && (
                  <div className="mt-4">
                    {state.comments.length === 0 ? (
                      <p
                        className={`text-center ${
                          isOppositeDarkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        No comments yet.
                      </p>
                    ) : (
                      state.comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="border-t pt-2 mt-2 border-white/40 dark:border-gray-700"
                        >
                          <p>
                            <strong>@{comment.owner_username}</strong>:{" "}
                            {comment.content}
                          </p>
                        </div>
                      ))
                    )}

                    <form
                      onSubmit={(e) => handleAddComment(e, post.id)}
                      className="mt-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2"
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
                        className={`flex-1 border rounded px-3 py-2 text-sm ${
                          isOppositeDarkMode
                            ? "bg-gray-700 text-white"
                            : "bg-white/30 text-gray-900"
                        }`}
                      />
                      <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
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
