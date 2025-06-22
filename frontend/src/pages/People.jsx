import { useEffect, useState } from "react";
import { getAllUsers, followUser, unfollowUser } from "../api/people";
import { useTheme } from "../context/ThemeContext";

export default function PeoplePage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  const isNavbarDark = theme === "dark";
  const isCardDark = !isNavbarDark; // Opposite of Navbar

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (userId, isFollowing) => {
    try {
      if (isFollowing) {
        await unfollowUser(userId);
      } else {
        await followUser(userId);
      }
      fetchUsers();
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  if (loading) return <p className="text-center mt-20 text-lg">Loading...</p>;

  return (
    <div
      className="min-h-screen p-6 pt-24 transition-colors duration-300 
      bg-gradient-to-r from-green-50 to-blue-100 dark:from-gray-900 dark:to-gray-800"
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {users.length > 0 ? (
          users.map((user) => (
            <div
              key={user.id}
              className={`relative flex flex-col items-center rounded-2xl p-6 shadow-xl border transition-transform transform hover:scale-105 duration-300
              ${
                isCardDark
                  ? "bg-gray-900 text-white border-gray-700"
                  : "bg-white text-gray-800 border-gray-300"
              }`}
            >
              <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                {user.username.charAt(0).toUpperCase()}
              </div>

              <h3 className="mt-4 text-2xl font-semibold">@{user.username}</h3>
              <p className="text-sm mt-1 text-gray-600 dark:text-gray-500">
                {user.followers_count} Followers
              </p>

              <button
                onClick={() => handleFollowToggle(user.id, user.is_following)}
                className={`mt-6 px-5 py-2 rounded-full text-sm font-medium shadow-lg transition-all duration-300
                  ${
                    user.is_following
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
              >
                {user.is_following ? "Unfollow" : "Follow"}
              </button>

              {/* Cool ribbon for followed users */}
              {user.is_following && (
                <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow">
                  Following
                </span>
              )}
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-600 dark:text-gray-400">
            No users found.
          </p>
        )}
      </div>
    </div>
  );
}
