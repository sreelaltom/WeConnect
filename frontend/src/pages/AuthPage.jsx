import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, registerUser } from "../api/auth";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import logo from "../assets/logo.jpg"; // ✅ Your logo here

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const token = await login(username, password);
        localStorage.setItem("token", token);
        navigate("/home");
      } else {
        await registerUser(username, email, password);
        setIsLogin(true);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F9FA] px-4">
      {/* App Logo with animation */}
      <motion.img
        src={logo}
        alt="WeConnect Logo"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-24 h-24 mb-4 rounded-full shadow-md"
      />

      {/* App Name */}
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-gray-700 mb-6"
      >
        WeConnect
      </motion.h1>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 120 }}
        className="bg-[#F8F9F9] border border-[#DAD7CD] rounded-xl shadow-md p-8 w-full max-w-sm space-y-5"
      >
        <h2 className="text-2xl text-center text-gray-700 font-semibold">
          {isLogin ? "Welcome Back 👋" : "Join Us 🎉"}
        </h2>

        {error && <p className="text-red-500 text-center text-sm">{error}</p>}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-2 rounded-md bg-[#FFFFFF] border border-[#DAD7CD] text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#2E86AB]"
          required
        />

        {!isLogin && (
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-md bg-[#FFFFFF] border border-[#DAD7CD] text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#2E86AB]"
            required
          />
        )}

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-md bg-[#FFFFFF] border border-[#DAD7CD] text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#2E86AB] pr-10"
            required
          />
          <div
            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          className="w-full bg-[#2E86AB] text-white font-semibold py-2 rounded-md hover:bg-[#257495] transition"
        >
          {isLogin ? "Login" : "Register"}
        </motion.button>

        <p
          onClick={() => setIsLogin(!isLogin)}
          className="text-center text-sm text-gray-600 cursor-pointer hover:underline"
        >
          {isLogin
            ? "Don't have an account? Register here!"
            : "Already registered? Login here!"}
        </p>
      </motion.form>
    </div>
  );
}
