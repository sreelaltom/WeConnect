import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import logo from "../assets/logo.jpg";

export default function Navbar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme(); // ThemeContext — no direct localStorage hack

  const navItemClass = (path) =>
    location.pathname === path
      ? "text-[#b78654] border-b-2 border-[#b78654] pb-1"
      : "text-[#b8bbc0] hover:text-[#b78654] transition duration-300";

  return (
    <nav className="bg-white dark:bg-[#131f2f] shadow-lg px-8 py-4 flex justify-between items-center fixed w-full top-0 z-50 transition-colors duration-300">
      {/* Logo + App Name (Clickable Home) */}
      <Link
        to="/home"
        className="flex items-center space-x-3 cursor-pointer hover:scale-105 transition-transform duration-300"
      >
        <img
          src={logo}
          alt="Logo"
          className="w-10 h-10 rounded-full border-2 border-[#b8bbc0] shadow-md"
        />
        <span className="text-2xl font-bold text-[#b78654] tracking-wider">
          WeConnect
        </span>
      </Link>

      {/* Navigation Links — No Home link needed anymore */}

      <Link to="/people" className={navItemClass("/people")}>
        People
      </Link>
      <Link to="/profile" className={navItemClass("/profile")}>
        Profile
      </Link>

      {/* Create Post & Theme Toggle */}

      <Link
        to="/create-post"
        className="bg-[#40da70] text-white font-semibold px-4 py-2 rounded-full shadow hover:scale-105 hover:bg-[#37c265] transition duration-300"
      >
        + Create Post
      </Link>

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
    </nav>
  );
}
