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
import FormMessage from "../components/FormMessage";

const Register = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setErrorMessage("");

    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setErrorMessage("");

      const response = await axiosInstance.post(
        "/users/register",
        formData
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      setUser(response.data.user);

      navigate("/");
    } catch {
      setErrorMessage("An account with this email already exists.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4">
      {/* Background Glow */}
      <div className="absolute bottom-[-220px] left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-[#173D9D]/10 blur-[200px]" />

      {/* Card */}
      <div className="relative w-full max-w-[430px] rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#121212]/95 px-8 py-8 shadow-xl backdrop-blur-xl">
        <h1 className="mb-8 text-center text-4xl font-light tracking-tight text-white">
          Sign up
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormMessage message={errorMessage} />

          {/* Email */}
          <div className="relative group">
            <HiOutlineMail className="absolute left-5 top-1/2 -translate-y-1/2 text-xl text-gray-500 transition-colors duration-200 group-focus-within:text-[#8FB4FF]" />

            <input
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              required
              className="h-12 w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#181818] pl-14 pr-5 text-sm text-white placeholder:text-gray-500 outline-none transition-colors duration-200 focus:border-[#173D9D] focus:ring-1 focus:ring-[#173D9D]/20"
            />
          </div>

          {/* Password */}
          <div className="relative group">
            <HiOutlineLockClosed className="absolute left-5 top-1/2 -translate-y-1/2 text-xl text-gray-500 transition-colors duration-200 group-focus-within:text-[#8FB4FF]" />

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
              className="h-12 w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#181818] pl-14 pr-14 text-sm text-white placeholder:text-gray-500 outline-none transition-colors duration-200 focus:border-[#173D9D] focus:ring-1 focus:ring-[#173D9D]/20"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-xl text-gray-500 transition-colors duration-200 hover:text-gray-300"
            >
              {showPassword ? (
                <HiOutlineEyeOff />
              ) : (
                <HiOutlineEye />
              )}
            </button>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-11 w-full rounded-lg bg-[#173D9D] text-base font-medium text-white transition-colors duration-200 hover:bg-[#2148A8] active:bg-[#14357F] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          {/* Login */}
          <p className="pt-2 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-gray-300 transition-colors duration-200 hover:text-white"
            >
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
