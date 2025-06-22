import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, registerUser } from "../api/auth";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 px-4">
      {/* App Name */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl md:text-6xl font-extrabold text-white mb-8 drop-shadow-lg text-center"
      >
        WeConnect
      </motion.h1>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120 }}
        className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-3xl shadow-xl p-8 md:p-10 w-full max-w-sm space-y-6"
      >
        <h2 className="text-2xl font-semibold text-center text-white drop-shadow">
          {isLogin ? "Welcome Back 👋" : "Join Us 🎉"}
        </h2>

        {error && <p className="text-red-200 text-sm text-center">{error}</p>}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-white/30 text-white placeholder-white/70 outline-none focus:ring-2 focus:ring-white"
          required
        />

        {!isLogin && (
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/30 text-white placeholder-white/70 outline-none focus:ring-2 focus:ring-white"
            required
          />
        )}

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/30 text-white placeholder-white/70 outline-none focus:ring-2 focus:ring-white pr-10"
            required
          />
          <div
            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-white/80 hover:text-white"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="w-full bg-white/30 text-white font-semibold py-2 rounded-lg hover:bg-white/50 transition"
        >
          {isLogin ? "Login" : "Register"}
        </motion.button>

        <p
          onClick={() => setIsLogin(!isLogin)}
          className="text-center text-sm text-white cursor-pointer hover:underline"
        >
          {isLogin
            ? "Don't have an account? Register here!"
            : "Already registered? Login here!"}
        </p>
      </motion.form>
    </div>
  );
}
