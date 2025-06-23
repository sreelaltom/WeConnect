import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // ✅ import Link
import { FaHeart, FaRegHeart, FaComment } from "react-icons/fa";
import { likePost, unlikePost } from "../api/post";
import { getComments, addComment } from "../api/comments";

const PostCard = ({ post }) => {
  const [isLiked, setIsLiked] = useState(post.is_liked_by_current_user);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [commentsCount, setCommentsCount] = useState(post.comments_count);

  useEffect(() => {
    setIsLiked(post.is_liked_by_current_user);
    setLikesCount(post.likes_count);
    setCommentsCount(post.comments_count);
  }, [post]);

  const handleLikeToggle = async () => {
    try {
      if (isLiked) {
        await unlikePost(post.id);
        setIsLiked(false);
        setLikesCount((prev) => prev - 1);
      } else {
        await likePost(post.id);
        setIsLiked(true);
        setLikesCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const toggleComments = async () => {
    if (!showComments) {
      try {
        const data = await getComments(post.id);
        setComments(data);
      } catch (err) {
        console.error("Error fetching comments:", err);
      }
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await addComment(post.id, newComment);
      const updatedComments = await getComments(post.id);
      setComments(updatedComments);
      setNewComment("");
      setCommentsCount((prev) => prev + 1);
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  return (
    <div className="border rounded-xl shadow-md p-4 mb-4 bg-white dark:bg-gray-800 transition-all duration-300">
      <h2 className="text-xl font-bold mb-2 text-[#b78654] dark:text-gray-100">
        {post.title}
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-2">{post.content}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
        Posted by{" "}
        <Link
          to={`/profile/${post.owner_id}`} // 👈 Make sure `post.owner_id` exists in your post object
          className="text-[#b78654] dark:text-purple-300 hover:underline"
        >
          @{post.owner_username}
        </Link>
      </p>

      <div className="flex items-center space-x-4">
        <button
          onClick={handleLikeToggle}
          className="flex items-center space-x-1 text-green-500 hover:bg-green-600 hover:text-white px-3 py-1 rounded transition"
        >
          {isLiked ? <FaHeart /> : <FaRegHeart />}
          <span>{likesCount}</span>
        </button>

        <button
          onClick={toggleComments}
          className="flex items-center space-x-1 text-blue-500 hover:bg-blue-600 hover:text-white px-3 py-1 rounded transition"
        >
          <FaComment />
          <span>{commentsCount}</span>
        </button>
      </div>

      {showComments && (
        <div className="mt-4">
          {comments.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-300">No comments yet.</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="border-t mt-2 pt-2">
                <p className="text-sm text-gray-700 dark:text-gray-200">
                  <strong>{comment.owner_username}:</strong> {comment.content}
                </p>
              </div>
            ))
          )}

          <form onSubmit={handleAddComment} className="mt-4 flex space-x-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 border rounded px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Add
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;
