import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import logo from "../assets/logo.jpg";

export default function Navbar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false); // mobile menu toggle

  const navItemClass = (path) =>
    location.pathname === path
      ? "text-[#b78654] border-b-2 border-[#b78654] pb-1"
      : "text-[#b8bbc0] hover:text-[#b78654] transition duration-300";

  return (
    <nav className="bg-white dark:bg-[#131f2f] shadow-lg px-4 sm:px-8 py-4 flex justify-between items-center fixed w-full top-0 z-50 transition-colors duration-300">
      {/* Logo + App Name */}
      <Link
        to="/home"
        className="flex items-center space-x-2 sm:space-x-3 cursor-pointer hover:scale-105 transition-transform duration-300"
      >
        <img
          src={logo}
          alt="Logo"
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-[#b8bbc0] shadow-md"
        />
        <span className="text-sm sm:text-2xl font-bold text-[#b78654] tracking-wider">
          WeConnect
        </span>
      </Link>

      {/* Hamburger button for mobile */}
      <button
        className="sm:hidden text-[#b78654] text-2xl focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        ☰
      </button>

      {/* Desktop Nav Items */}
      <div className="hidden sm:flex items-center space-x-6">
        <Link to="/people" className={navItemClass("/people")}>
          People
        </Link>
        <Link to="/profile" className={navItemClass("/profile")}>
          Profile
        </Link>
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
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-white dark:bg-[#131f2f] px-4 py-4 flex flex-col space-y-4 sm:hidden shadow-lg z-40">
          <Link
            to="/people"
            className={navItemClass("/people")}
            onClick={() => setIsOpen(false)}
          >
            People
          </Link>
          <Link
            to="/profile"
            className={navItemClass("/profile")}
            onClick={() => setIsOpen(false)}
          >
            Profile
          </Link>
          <Link
            to="/create-post"
            className="bg-[#40da70] text-white font-semibold px-4 py-2 rounded-full shadow hover:bg-[#37c265] transition duration-300 text-center"
            onClick={() => setIsOpen(false)}
          >
            + Create Post
          </Link>
          <button
            onClick={() => {
              toggleTheme();
              setIsOpen(false);
            }}
            className="bg-[#b78654] text-white px-4 py-2 rounded-full shadow hover:bg-[#9c653a] transition duration-300 flex items-center justify-center"
          >
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      )}
    </nav>
  );
}
