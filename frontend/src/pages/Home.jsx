import { useEffect, useState } from "react";
import { getPostsWithCounts } from "../api/post";
import PostCard from "../components/PostCard";

export default function Home() {
  const [posts, setPosts] = useState([]);

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
    <div className="min-h-screen bg-gradient-to-r from-gray-100 to-gray-300 p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-700">
        Latest Posts 🚀
      </h1>
      <div className="space-y-6 max-w-xl mx-auto">
        {posts.length > 0 ? (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <p className="text-center text-gray-600">No posts yet.</p>
        )}
      </div>
    </div>
  );
}
