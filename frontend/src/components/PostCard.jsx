import { useState } from "react";
import { likePost, unlikePost } from "../api/post";
import { getComments, addComment } from "../api/comments";
import { Heart, MessageCircle } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function PostCard({ post }) {
  const { theme } = useTheme(); // get theme
  const isDarkMode = theme === "light"; // PostCard is opposite to Navbar

  const [liked, setLiked] = useState(post.is_liked_by_current_user);
  const [likeCount, setLikeCount] = useState(post.likes_count);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const toggleLike = async () => {
    try {
      if (!liked) {
        await likePost(post.id);
        setLikeCount((prev) => prev + 1);
      } else {
        await unlikePost(post.id);
        setLikeCount((prev) => prev - 1);
      }
      setLiked(!liked);
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const toggleComments = async () => {
    setShowComments(!showComments);
    if (!showComments) {
      try {
        const data = await getComments(post.id);
        setComments(data);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim() === "") return;
    try {
      await addComment(post.id, newComment);
      const updatedComments = await getComments(post.id);
      setComments(updatedComments);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
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
      <div className="flex justify-between">
        <span className="font-semibold">@{post.owner_username}</span>
        <span className="text-sm">
          {new Date(post.timestamp).toLocaleString()}
        </span>
      </div>

      <h2 className="text-lg font-bold">{post.title}</h2>
      <p>{post.content}</p>

      <div className="flex justify-between items-center mt-4 space-x-2">
        <button
          onClick={toggleLike}
          className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium transition transform ${
            liked
              ? "bg-red-500 text-white scale-105"
              : isDarkMode
              ? "bg-gray-200 text-black hover:bg-red-400 hover:text-white"
              : "bg-gray-700 text-white hover:bg-red-400 hover:text-white"
          }`}
        >
          <Heart size={16} fill={liked ? "white" : "none"} />
          <span>{likeCount}</span>
        </button>

        <button
          onClick={toggleComments}
          className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600 transition transform hover:scale-105"
        >
          <MessageCircle size={16} />
          <span>{showComments ? "Hide" : "Comments"}</span>
        </button>
      </div>

      {showComments && (
        <div className="mt-4 space-y-2">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div
                key={comment.id}
                className={`border p-2 rounded ${
                  isDarkMode
                    ? "bg-gray-800 text-white border-gray-700"
                    : "bg-gray-100 text-black border-gray-300"
                }`}
              >
                <span className="font-semibold">
                  @{comment.owner_username}:
                </span>{" "}
                {comment.content}
              </div>
            ))
          ) : (
            <p className="text-sm">No comments yet.</p>
          )}

          <div className="flex space-x-2 mt-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className={`flex-1 border rounded px-3 py-1 text-sm transition ${
                isDarkMode
                  ? "bg-gray-800 text-white border-gray-700"
                  : "bg-gray-100 text-black border-gray-300"
              }`}
            />
            <button
              onClick={handleAddComment}
              className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition"
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
