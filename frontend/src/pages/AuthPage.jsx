import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, registerUser } from "../api/auth";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import logo from "../assets/logo.jpg";
import { useTheme } from "../context/ThemeContext";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isOppositeDark = theme === "light";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        const token = await login(username, password);
        localStorage.setItem("token", token);
        navigate("/home");
      } else {
        await registerUser(username, email, password);
        setIsLogin(true); // switch to login after successful registration
      }
    } catch (err) {
      console.error("Login/Register Error:", err);
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;

      if (isLogin && (status === 401 || detail?.includes("not found"))) {
        setError(
          "User not found or wrong password.Sign up to create an account."
        );
        setTimeout(() => {
          setIsLogin(false); // switch to register form
          setError(""); // clear the error
          setEmail(""); // optional: clear fields
          setPassword("");
        }, 2000);
      } else if (!isLogin && detail) {
        setError(detail);
      } else {
        setError("Something went wrong! Try again.");
      }
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center px-4 transition-all duration-500 ${
        isOppositeDark
          ? "bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white"
          : "bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 text-gray-900"
      }`}
    >
      <motion.img
        src={logo}
        alt="Logo"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-24 h-24 mb-4 rounded-full shadow-lg border-4 border-white"
      />

      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-4xl font-bold mb-6 ${
          isOppositeDark ? "text-green-300" : "text-green-700"
        }`}
      >
        WeConnect
      </motion.h1>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 120 }}
        className={`w-full max-w-sm p-8 rounded-3xl shadow-xl border backdrop-blur-md space-y-5 ${
          isOppositeDark
            ? "bg-gray-900/70 border-gray-700"
            : "bg-white/30 border-white/40"
        }`}
      >
        <h2
          className={`text-2xl text-center font-semibold ${
            isOppositeDark ? "text-white" : "text-green-700"
          }`}
        >
          {isLogin ? "Welcome Back 👋" : "Join Us 🎉"}
        </h2>

        {error && <p className="text-center text-sm text-red-400">{error}</p>}

        {/* Username */}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={`w-full px-4 py-2 rounded-md outline-none focus:ring-2 ${
            isOppositeDark
              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-green-400"
              : "bg-white/70 border-white/40 text-gray-800 placeholder-gray-600 focus:ring-green-700"
          }`}
          required
        />

        {/* Email (only for register) */}
        {!isLogin && (
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-4 py-2 rounded-md outline-none focus:ring-2 ${
              isOppositeDark
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-green-400"
                : "bg-white/70 border-white/40 text-gray-800 placeholder-gray-600 focus:ring-green-700"
            }`}
            required
          />
        )}

        {/* Password */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full px-4 py-2 pr-10 rounded-md outline-none focus:ring-2 ${
              isOppositeDark
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-green-400"
                : "bg-white/70 border-white/40 text-gray-800 placeholder-gray-600 focus:ring-green-700"
            }`}
            required
          />
          <div
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          className="w-full py-2 rounded-md font-semibold shadow transition bg-green-500 hover:bg-green-600 text-white"
        >
          {isLogin ? "Login" : "Register"}
        </motion.button>

        <p
          onClick={() => setIsLogin(!isLogin)}
          className="text-center text-sm text-gray-500 cursor-pointer hover:underline"
        >
          {isLogin
            ? "Don't have an account? Register here!"
            : "Already registered? Login here!"}
        </p>
      </motion.form>
    </div>
  );
}
