import { useState } from "react";
import { createPost } from "../api/post";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext"; // Importing theme context

export default function CreatePostPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const navigate = useNavigate();
  const { theme } = useTheme(); // Getting global theme
  const isOppositeDarkMode = theme === "light"; // Flip the theme

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createPost({ title, content });
      navigate("/home"); // Redirect to home after post creation
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  return (
    <div
      className={`min-h-screen pt-24 flex items-center justify-center transition-colors duration-500 ${
        isOppositeDarkMode
          ? "bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white"
          : "bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 text-gray-900"
      }`}
    >
      <form
        onSubmit={handleSubmit}
        className={`p-8 rounded-3xl shadow-xl w-96 space-y-4 transition-all duration-500 border backdrop-blur-md ${
          isOppositeDarkMode
            ? "bg-gray-900/70 border-gray-700"
            : "bg-white/30 border-white/40"
        }`}
      >
        <h2
          className={`text-2xl font-bold text-center ${
            isOppositeDarkMode ? "text-blue-300" : "text-[#b78654]"
          }`}
        >
          Create New Post
        </h2>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className={`w-full p-2 rounded focus:outline-none backdrop-blur-md ${
            isOppositeDarkMode
              ? "bg-gray-700 text-white border-gray-600"
              : "bg-white/70 text-gray-800 border-white/40"
          }`}
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="4"
          required
          className={`w-full p-2 rounded focus:outline-none backdrop-blur-md ${
            isOppositeDarkMode
              ? "bg-gray-700 text-white border-gray-600"
              : "bg-white/70 text-gray-800 border-white/40"
          }`}
        />
        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 rounded-full shadow-md hover:bg-green-600 transition duration-300"
        >
          Post
        </button>
      </form>
    </div>
  );
}
