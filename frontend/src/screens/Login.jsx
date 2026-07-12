import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
} from "react-icons/hi";
import axiosInstance from "../config/axios";
import { UserContext } from "../context/user.context";

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await axiosInstance.post(
        "/users/login",
        formData
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      setUser(response.data.user);

      navigate("/");
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.errors ||
          error.response?.data?.message ||
          "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4">
      {/* Background Glow */}
      <div className="absolute bottom-[-220px] left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[200px]" />

      {/* Card */}
      <div className="relative w-full max-w-[430px] rounded-2xl border border-white/10 bg-[#121212]/95 px-8 py-8 shadow-xl backdrop-blur-xl">
        <h1 className="mb-8 text-center text-4xl font-light tracking-tight text-white">
          Log in
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="group relative">
            <HiOutlineMail className="absolute left-5 top-1/2 -translate-y-1/2 text-xl text-gray-500 transition group-focus-within:text-blue-400" />

            <input
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              required
              className="h-12 w-full rounded-full border border-white/10 bg-[#181818] pl-14 pr-5 text-sm text-white placeholder:text-gray-500 outline-none transition-all duration-200 focus:border-blue-500/70"
            />
          </div>

          {/* Password */}
          <div className="group relative">
            <HiOutlineLockClosed className="absolute left-5 top-1/2 -translate-y-1/2 text-xl text-gray-500 transition group-focus-within:text-blue-400" />

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              className="h-12 w-full rounded-full border border-white/10 bg-[#181818] pl-14 pr-14 text-sm text-white placeholder:text-gray-500 outline-none transition-all duration-200 focus:border-blue-500/70"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-xl text-gray-500 transition hover:text-blue-400"
            >
              {showPassword ? (
                <HiOutlineEyeOff />
              ) : (
                <HiOutlineEye />
              )}
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-11 w-full rounded-full bg-[#2563eb] text-base font-medium text-white transition hover:bg-[#3b82f6] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>

          {/* Register Link */}
          <p className="pt-2 text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-blue-400 transition hover:text-blue-300"
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;