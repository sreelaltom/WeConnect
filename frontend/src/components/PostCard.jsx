import { useState } from "react";
import { likePost, unlikePost } from "../api/post";
import { getComments, addComment } from "../api/comments"; // Create this if not already

export default function PostCard({ post }) {
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
    <div className="bg-white shadow-md rounded-xl p-4 space-y-3 border border-gray-200">
      <div className="flex justify-between">
        <span className="font-semibold text-gray-700">
          @{post.owner_username}
        </span>
        <span className="text-sm text-gray-500">
          {new Date(post.timestamp).toLocaleString()}
        </span>
      </div>

      <h2 className="text-lg font-bold text-gray-900">{post.title}</h2>
      <p className="text-gray-800">{post.content}</p>

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={toggleLike}
          className={`px-4 py-1 rounded-full text-sm font-medium ${
            liked ? "bg-red-400 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          {liked ? "Liked" : "Like"} ({likeCount})
        </button>
        <button
          onClick={toggleComments}
          className="px-4 py-1 bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600 transition"
        >
          {showComments ? "Hide Comments" : "Comments"}
        </button>
      </div>

      {showComments && (
        <div className="mt-4 space-y-2">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="border p-2 rounded bg-gray-50">
                <span className="font-semibold text-gray-700">
                  @{comment.owner_username}:
                </span>{" "}
                {comment.content}
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No comments yet.</p>
          )}

          <div className="flex space-x-2 mt-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 border rounded px-3 py-1 text-sm"
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
