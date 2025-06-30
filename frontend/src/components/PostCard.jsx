import { useState, useEffect } from "react";
import { likePost, unlikePost } from "../api/post";
import { getComments, addComment } from "../api/comments";
import { Heart, MessageCircle, AlertCircle, Send } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function PostCard({ post }) {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

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
    e.preventDefault();

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

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddComment(e);
    }
  };

  return (
    <div
      className={`shadow-lg rounded-xl p-6 space-y-4 border transition-all duration-300 hover:shadow-xl ${
        isDarkMode
          ? "bg-gray-800 text-white border-gray-700"
          : "bg-white text-gray-900 border-gray-200"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <span
          className={`font-semibold text-sm sm:text-base ${
            isDarkMode ? "text-blue-400" : "text-blue-600"
          }`}
        >
          @{post.owner_username}
        </span>
        <span
          className={`text-xs sm:text-sm ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {new Date(post.timestamp).toLocaleString()}
        </span>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <h2
          className={`text-base sm:text-lg font-bold leading-tight ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          {post.title}
        </h2>
        <p
          className={`text-sm sm:text-base leading-relaxed ${
            isDarkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {post.content}
        </p>
      </div>

      {/* Error Message */}
      {likeError && (
        <div
          className={`flex items-center text-xs p-3 rounded-lg ${
            isDarkMode
              ? "bg-red-900/50 text-red-300 border border-red-700"
              : "bg-red-50 text-red-600 border border-red-200"
          }`}
        >
          <AlertCircle size={16} className="mr-2 flex-shrink-0" />
          <span>{likeError}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-2">
        <button
          onClick={toggleLike}
          disabled={isLikeLoading}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isLikeLoading ? "opacity-50 cursor-wait" : ""
          } ${
            liked
              ? isDarkMode
                ? "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
                : "bg-red-500 text-white hover:bg-red-600 focus:ring-red-400"
              : isDarkMode
              ? "bg-gray-700 text-gray-300 hover:bg-red-600 hover:text-white focus:ring-gray-500"
              : "bg-gray-100 text-gray-700 hover:bg-red-500 hover:text-white focus:ring-gray-300"
          }`}
        >
          <Heart size={16} fill={liked ? "currentColor" : "none"} />
          <span>
            {liked ? "Liked" : "Like"} ({likeCount || 0})
          </span>
        </button>

        <button
          onClick={toggleComments}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isDarkMode
              ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
              : "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-400"
          }`}
        >
          <MessageCircle size={16} />
          <span>{showComments ? "Hide" : "Comments"}</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div
          className={`mt-6 space-y-4 pt-4 border-t ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          {comments.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-gray-100"
                      : "bg-gray-50 border-gray-200 text-gray-800"
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    <span
                      className={`font-semibold text-sm ${
                        isDarkMode ? "text-blue-400" : "text-blue-600"
                      }`}
                    >
                      @{comment.owner_username}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed break-words">
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p
              className={`text-sm text-center py-4 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              No comments yet. Be the first to comment!
            </p>
          )}

          {/* Comment Form */}
          <form onSubmit={handleAddComment} className="space-y-3">
            <div className="relative">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share your thoughts..."
                rows="3"
                className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 resize-none focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isDarkMode
                    ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                    : "bg-white text-gray-900 border-gray-300 placeholder-gray-500 focus:ring-blue-400 focus:border-blue-400"
                }`}
                style={{
                  WebkitAppearance: "none",
                  fontSize: "16px",
                }}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!newComment.trim() || isCommentLoading}
                className={`flex items-center space-x-2 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  !newComment.trim() || isCommentLoading
                    ? isDarkMode
                      ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : isDarkMode
                    ? "bg-green-600 text-white hover:bg-green-700 hover:scale-105 focus:ring-green-500"
                    : "bg-green-500 text-white hover:bg-green-600 hover:scale-105 focus:ring-green-400"
                }`}
              >
                {isCommentLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Posting...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Post Comment</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
