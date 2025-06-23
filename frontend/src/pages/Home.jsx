import { useEffect, useState } from "react";
import { getPostsWithCounts } from "../api/post";
import PostCard from "../components/PostCard";
import { useTheme } from "../context/ThemeContext"; // 👈 Using global theme

export default function Home() {
  const [posts, setPosts] = useState([]);
  const { theme } = useTheme(); // 👈 Getting global theme

  const isOppositeDarkMode = theme === "light"; // 👈 Opposite of global

  useEffect(() => {
    async function fetchPosts() {
      try {
        const data = await getPostsWithCounts();
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    }
    fetchPosts();
  }, []);

  return (
    <div
      className={`min-h-screen p-6 transition-colors duration-500 ${
        isOppositeDarkMode
          ? "bg-gradient-to-r from-gray-900 to-gray-800 text-white"
          : "bg-gradient-to-r from-gray-100 to-gray-300 text-gray-900"
      }`}
    >
      <h1
        className={`text-3xl font-bold text-center mb-8 ${
          isOppositeDarkMode ? "text-blue-300" : "text-[#b78654]"
        }`}
      >
        Latest Posts 🚀
      </h1>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {posts.length > 0 ? (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <p
            className={`col-span-full text-center ${
              isOppositeDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            No posts yet.
          </p>
        )}
      </div>
    </div>
  );
}
