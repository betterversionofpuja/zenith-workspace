import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineArrowLeft,
  HiOutlineLockClosed,
  HiOutlineLogout,
  HiOutlineMail,
  HiOutlineUser,
  HiOutlineX,
} from "react-icons/hi";

import axiosInstance from "../config/axios";
import { UserContext } from "../context/user.context";
import FormMessage from "../components/FormMessage";

const Profile = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [changingPassword, setChangingPassword] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState("");
  const [changePasswordSuccess, setChangePasswordSuccess] = useState("");

  const name = user?.email
    ? user.email.split("@")[0].charAt(0).toUpperCase() +
    user.email.split("@")[0].slice(1)
    : "";

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const closeModal = () => {
    setIsChangePasswordOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setChangePasswordError("");
    setChangePasswordSuccess("");
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (currentPassword === newPassword) {
      setChangePasswordError(
        "New password must be different from current password."
      );
      return;
    }

    setChangingPassword(true);
    setChangePasswordError("");
    setChangePasswordSuccess("");

    try {
      const res = await axiosInstance.put("/users/change-password", {
        currentPassword,
        newPassword,
      });

      setChangePasswordSuccess(res.data.message);
      setCurrentPassword("");
      setNewPassword("");

      closeModal();
    } catch (error) {
      setChangePasswordError(
        error?.response?.data?.message || "Unable to update password."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.get("/users/logout");
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      navigate("/login", { replace: true });
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black px-6 py-10">
      <div className="mx-auto max-w-3xl">

        <button
          onClick={() => navigate("/")}
          className="mb-8 flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
        >
          <HiOutlineArrowLeft />
          Back
        </button>

        <div className="rounded-xl border border-white/10 bg-[#121212] p-8">

          <h1 className="mb-8 text-2xl font-semibold text-white">
            Profile
          </h1>

          <div className="space-y-7">

            <div className="flex items-center">
              <div className="flex w-36 items-center gap-2 text-gray-400">
                <HiOutlineUser />
                Name
              </div>

              <input
                readOnly
                value={name}
                className="h-11 flex-1 rounded-lg border border-white/10 bg-[#181818] px-4 text-white outline-none"
              />
            </div>

            <div className="flex items-center">
              <div className="flex w-36 items-center gap-2 text-gray-400">
                <HiOutlineMail />
                Email
              </div>

              <input
                readOnly
                value={user.email}
                className="h-11 flex-1 rounded-lg border border-white/10 bg-[#181818] px-4 text-white outline-none"
              />
            </div>

            <div className="flex items-center">
              <div className="flex w-36 items-center gap-2 text-gray-400">
                <HiOutlineLockClosed />
                Password
              </div>

              <div className="relative flex-1">

                <input
                  readOnly
                  value="••••••••"
                  className="h-11 w-full rounded-lg border border-white/10 bg-[#181818] px-4 text-white outline-none"
                />



              </div>
            </div>

            <div className="flex justify-between pt-6">
              <button
                onClick={() => setIsChangePasswordOpen(true)}
                className="rounded-lg bg-[#173D9D] px-5 py-2 text-sm font-medium text-white hover:bg-[#2148A8]"
              >
                Change Password
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#181818] px-5 py-2 text-sm text-white hover:bg-[#202020]"
              >
                <HiOutlineLogout />
                Logout
              </button>
            </div>
          </div>
        </div>

        {isChangePasswordOpen && (
          <>
            <div
              onClick={closeModal}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            />

            <form
              onSubmit={handleChangePassword}
              className="fixed left-1/2 top-1/2 z-50 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-[#181818] p-6 shadow-2xl"
            >
              <button
                type="button"
                onClick={closeModal}
                className="absolute right-5 top-5 text-gray-500 hover:text-white"
              >
                <HiOutlineX size={20} />
              </button>

              <h2 className="text-xl font-semibold text-white">
                Change Password
              </h2>

              <div className="mt-6 space-y-4">

                <input
                  type="password"
                  placeholder="Current Password"
                  value={currentPassword}
                  onChange={(e) => {
                    setChangePasswordError("");
                    setCurrentPassword(e.target.value);
                  }}
                  required
                  className="h-11 w-full rounded-lg border border-white/10 bg-[#121212] px-4 text-white placeholder:text-gray-500 outline-none focus:border-[#173D9D]"
                />

                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => {
                    setChangePasswordError("");
                    setNewPassword(e.target.value);
                  }}
                  required
                  className="h-11 w-full rounded-lg border border-white/10 bg-[#121212] px-4 text-white placeholder:text-gray-500 outline-none focus:border-[#173D9D]"
                />

                <FormMessage message={changePasswordError} />

                {changePasswordSuccess && (
                  <p className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
                    {changePasswordSuccess}
                  </p>
                )}

              </div>

              <button
                type="submit"
                disabled={
                  changingPassword ||
                  !currentPassword.trim() ||
                  !newPassword.trim()
                }
                className="mt-6 h-11 w-full rounded-lg bg-[#173D9D] text-sm font-medium text-white transition hover:bg-[#2148A8] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {changingPassword ? "Updating..." : "Update Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );

};

export default Profile;