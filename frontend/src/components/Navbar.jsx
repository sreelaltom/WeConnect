import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/"); // Redirect to login
  };

  const navItemClass = (path) =>
    location.pathname === path
      ? "text-yellow-300 border-b-2 border-yellow-300 pb-1"
      : "text-white hover:text-yellow-300 transition duration-300";

  return (
    <nav className="bg-gradient-to-r from-purple-500 to-indigo-600 shadow-lg px-8 py-4 flex justify-between items-center fixed w-full top-0 z-50">
      {/* Brand Name */}
      <div
        className="text-3xl font-bold text-white drop-shadow tracking-wider cursor-pointer"
        onClick={() => navigate("/home")}
      >
        WeConnect 🌐
      </div>

      {/* Navigation Links */}
      <div className="flex space-x-6 items-center">
        <Link to="/home" className={navItemClass("/home")}>
          Home
        </Link>
        <Link to="/people" className={navItemClass("/people")}>
          People
        </Link>
        <Link to="/profile" className={navItemClass("/profile")}>
          Profile
        </Link>
        <Link
          to="/create-post"
          className="bg-yellow-300 text-purple-800 font-semibold px-4 py-2 rounded-full shadow hover:scale-105 hover:bg-yellow-400 transition duration-300"
        >
          + Create Post
        </Link>
        <button
          onClick={handleLogout}
          className="bg-white text-purple-600 font-semibold px-4 py-2 rounded-full shadow hover:bg-gray-100 hover:scale-105 transition duration-300"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
