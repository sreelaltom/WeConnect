import { useEffect, useState } from "react";
import { getAllUsers, followUser, unfollowUser } from "../api/people";

export default function PeoplePage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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
      // Refresh user list after follow/unfollow
      fetchUsers();
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-100 to-blue-200 p-6 pt-24">
      <h2 className="text-3xl font-bold text-center text-green-700 mb-8">
        People You May Know
      </h2>
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {users.length > 0 ? (
          users.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center space-y-3 transform hover:scale-105 transition duration-300"
            >
              <div className="text-xl font-semibold text-blue-700">
                @{user.username}
              </div>
              <div className="text-gray-600">
                Followers: {user.followers_count}
              </div>
              <button
                onClick={() => handleFollowToggle(user.id, user.is_following)}
                className={`px-4 py-2 rounded-full text-white font-medium ${
                  user.is_following
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                } transition duration-200`}
              >
                {user.is_following ? "Unfollow" : "Follow"}
              </button>
            </div>
          ))
        ) : (
          <p className="text-center col-span-2 text-gray-500">
            No users found.
          </p>
        )}
      </div>
    </div>
  );
}
