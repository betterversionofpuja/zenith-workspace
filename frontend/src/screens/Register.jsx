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

const Register = () => {
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
                "/users/register",
                formData
            );

            // Save JWT
            localStorage.setItem("token", response.data.token);

            // Save User
            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            // Update Context
            setUser(response.data.user);

            // Redirect to Home
            navigate("/");
        } catch (error) {
            console.error(error);

            alert(
                error.response?.data?.errors ||
                error.response?.data?.message ||
                "Registration failed"
            );
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4">

            {/* Blue Glow */}
            <div className="absolute bottom-[-170px] h-[380px] w-[700px] rounded-full bg-blue-700/20 blur-[160px]" />

            {/* Register Card */}
            <div className="relative w-full max-w-md rounded-[30px] border border-blue-500/20 bg-[#121212]/95 px-8 py-10 shadow-[0_0_60px_rgba(37,99,235,0.15)] backdrop-blur-xl">

                <h1 className="mb-10 text-center text-5xl font-extralight tracking-wide text-white">
                    Sign up
                </h1>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Email */}
                    <div className="relative">
                        <HiOutlineMail className="absolute left-5 top-1/2 -translate-y-1/2 text-xl text-gray-500" />

                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email address"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="h-12 w-full rounded-full border border-blue-500/40 bg-[#171717] pl-14 pr-5 text-sm text-white placeholder:text-gray-500 outline-none transition-all duration-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    {/* Password */}
                    <div className="relative">
                        <HiOutlineLockClosed className="absolute left-5 top-1/2 -translate-y-1/2 text-xl text-gray-500" />

                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="h-12 w-full rounded-full border border-blue-500/40 bg-[#171717] pl-14 pr-14 text-sm text-white placeholder:text-gray-500 outline-none transition-all duration-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-xl text-blue-500 transition hover:text-blue-400"
                        >
                            {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                        </button>
                    </div>

                    {/* Register Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-7 h-12 w-full rounded-full bg-[#252525] text-lg font-medium text-white transition-all duration-300 hover:bg-[#303030] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>

                    {/* Login Link */}
                    <p className="pt-2 text-center text-sm text-gray-400">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="font-medium text-blue-500 transition hover:text-blue-400"
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