import { useState, useEffect } from "react";
import { likePost, unlikePost } from "../api/post";
import { getComments, addComment } from "../api/comments";
import { Heart, MessageCircle, AlertCircle, Send } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function PostCard({ post }) {
  const { theme } = useTheme();
  const isDarkMode = theme === "light";

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes_count || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [likeError, setLikeError] = useState(null);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isCommentLoading, setIsCommentLoading] = useState(false);

  useEffect(() => {
    setLiked(!!post.is_liked_by_current_user);
  }, [post.id, post.is_liked_by_current_user]);

  useEffect(() => {
    if (likeError) {
      const timer = setTimeout(() => setLikeError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [likeError]);

  const toggleLike = async () => {
    if (isLikeLoading) return;

    setIsLikeLoading(true);
    setLikeError(null);

    try {
      if (!liked) {
        await likePost(post.id);
        setLikeCount((prev) => (prev || 0) + 1);
        setLiked(true);
      } else {
        await unlikePost(post.id);
        setLikeCount((prev) => Math.max((prev || 0) - 1, 0));
        setLiked(false);
      }
    } catch (err) {
      console.error("Like error:", err);

      if (err.response?.status === 400) {
        if (err.response?.data?.detail === "Post already liked") {
          setLiked(true);
          setLikeError("Post is already liked");
        } else if (err.response?.data?.detail === "Post not liked yet") {
          setLiked(false);
          setLikeError("Post is not liked yet");
        } else {
          setLikeError("Error updating like status");
        }
      } else {
        setLikeError("Network error. Please try again.");
      }
    } finally {
      setIsLikeLoading(false);
    }
  };

  const toggleComments = async () => {
    setShowComments(!showComments);
    if (!showComments && post.id) {
      try {
        const data = await getComments(post.id);
        setComments(data || []);
      } catch (error) {
        console.error("Error fetching comments:", error);
        setComments([]);
      }
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault(); // Prevent form submission

    if (!newComment.trim() || !post.id || isCommentLoading) return;

    setIsCommentLoading(true);

    try {
      await addComment(post.id, newComment);
      const updatedComments = await getComments(post.id);
      setComments(updatedComments || []);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsCommentLoading(false);
    }
  };

  // Handle Enter key press for desktop
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddComment(e);
    }
  };

  return (
    <div
      className={`shadow-md rounded-xl p-4 space-y-3 border transition-colors duration-500 ${
        isDarkMode
          ? "bg-gray-900 text-white border-gray-700"
          : "bg-white text-black border-gray-300"
      }`}
    >
      <div className="flex justify-between items-start">
        <span className="font-semibold text-sm sm:text-base">
          @{post.owner_username}
        </span>
        <span className="text-xs sm:text-sm text-gray-500">
          {new Date(post.timestamp).toLocaleString()}
        </span>
      </div>

      <h2 className="text-base sm:text-lg font-bold leading-tight">
        {post.title}
      </h2>
      <p className="text-sm sm:text-base leading-relaxed">{post.content}</p>

      <div className="flex flex-col space-y-2">
        {likeError && (
          <div className="flex items-center text-xs text-red-500 bg-red-100 dark:bg-red-900 dark:text-red-200 p-2 rounded">
            <AlertCircle size={14} className="mr-1 flex-shrink-0" />
            <span>{likeError}</span>
          </div>
        )}

        <div className="flex justify-between items-center gap-2">
          <button
            onClick={toggleLike}
            disabled={isLikeLoading}
            className={`flex items-center space-x-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition transform touch-manipulation ${
              isLikeLoading ? "opacity-50 cursor-wait" : ""
            } ${
              liked
                ? "bg-red-500 text-white scale-105"
                : isDarkMode
                ? "bg-gray-200 text-black hover:bg-red-400 hover:text-white active:bg-red-500"
                : "bg-gray-700 text-white hover:bg-red-400 hover:text-white active:bg-red-500"
            }`}
          >
            <Heart size={14} fill={liked ? "white" : "none"} />
            <span>
              {liked ? "Liked" : "Like"} ({likeCount || 0})
            </span>
          </button>

          <button
            onClick={toggleComments}
            className="flex items-center space-x-1 px-2 sm:px-3 py-1 bg-blue-500 text-white rounded-full text-xs sm:text-sm hover:bg-blue-600 active:bg-blue-700 transition transform hover:scale-105 touch-manipulation"
          >
            <MessageCircle size={14} />
            <span>{showComments ? "Hide" : "Comments"}</span>
          </button>
        </div>
      </div>

      {showComments && (
        <div className="mt-4 space-y-3">
          {comments.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`border p-2 sm:p-3 rounded text-sm ${
                    isDarkMode
                      ? "bg-gray-800 text-white border-gray-700"
                      : "bg-gray-100 text-black border-gray-300"
                  }`}
                >
                  <span className="font-semibold">
                    @{comment.owner_username}:
                  </span>{" "}
                  <span className="break-words">{comment.content}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No comments yet.</p>
          )}

          {/* Mobile-optimized comment form */}
          <form
            onSubmit={handleAddComment}
            className="flex flex-col sm:flex-row gap-2 mt-3"
          >
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a comment..."
                rows="2"
                className={`w-full border rounded-lg px-3 py-2 text-sm transition resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? "bg-gray-800 text-white border-gray-700 placeholder-gray-400"
                    : "bg-gray-100 text-black border-gray-300 placeholder-gray-500"
                }`}
                style={{
                  WebkitAppearance: "none",
                  fontSize: "16px", // Prevents zoom on iOS
                }}
              />
            </div>
            <button
              type="submit"
              disabled={!newComment.trim() || isCommentLoading}
              className={`flex items-center justify-center gap-1 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition touch-manipulation min-w-[80px] ${
                !newComment.trim() || isCommentLoading
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-green-500 text-white hover:bg-green-600 active:bg-green-700"
              }`}
            >
              {isCommentLoading ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <>
                  <Send size={14} />
                  <span className="hidden sm:inline">Post</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
