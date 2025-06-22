import { useEffect, useState } from "react";
import { getPostsWithCounts } from "../api/post";
import PostCard from "../components/PostCard";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [theme, setTheme] = useState(localStorage.theme || "light");

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

  // Apply theme when changed
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 p-6 transition-colors duration-300">
      {/* Theme Toggle Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={toggleTheme}
          className="bg-[#b78654] text-white px-4 py-2 rounded-full shadow hover:bg-[#9c653a] transition duration-300 flex items-center space-x-2"
        >
          {theme === "dark" ? (
            <>
              <span>☀️</span> <span className="hidden sm:inline">Light</span>
            </>
          ) : (
            <>
              <span>🌙</span> <span className="hidden sm:inline">Dark</span>
            </>
          )}
        </button>
      </div>

      <h1 className="text-3xl font-bold text-center mb-8 text-blue-700 dark:text-blue-300">
        Latest Posts 🚀
      </h1>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {posts.length > 0 ? (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <p className="text-center text-gray-600 dark:text-gray-300 col-span-full">
            No posts yet.
          </p>
        )}
      </div>
    </div>
  );
}
//     </button>
