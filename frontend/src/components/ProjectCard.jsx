import { useNavigate } from "react-router-dom";
import { HiOutlineUserGroup, HiOutlineDotsVertical } from "react-icons/hi";
import { useState } from "react";
import {
  renameProject,
  deleteProject,
} from "../services/project.service";

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [newName, setNewName] = useState(project.name);
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div
      className="group relative cursor-pointer rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#121212] p-5 transition-colors duration-200 hover:border-[rgba(255,255,255,0.08)] hover:bg-[#181818]"
      onClick={() => navigate(`/project/${project._id}`)}
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="min-w-0 flex-1 truncate text-xl font-semibold text-white">
          {project.name}
        </h2>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu((prev) => !prev);
          }}
          className="flex-shrink-0 rounded-md p-1 text-gray-500 opacity-0 transition-colors duration-200 hover:bg-[#202020] hover:text-gray-300 group-hover:opacity-100"
        >
          <HiOutlineDotsVertical className="text-lg" />
        </button>

        {showMenu && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-4 top-12 z-20 w-36 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#181818] py-1 shadow-xl"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(false);
                setShowRename(true);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-300 transition-colors duration-200 hover:bg-[#202020] hover:text-white"
            >
              Rename
            </button>

            <button
              onClick={async (e) => {
                e.stopPropagation();
                setShowMenu(false);

                setShowDelete(true);
              }}
              className="w-full px-4 py-2 text-left text-sm text-[#DC2626] transition-colors duration-200 hover:bg-[#202020]"
            >
              Delete
            </button>
          </div>
        )}

      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
        <HiOutlineUserGroup className="text-base text-gray-500" />

        <span>
          {project.users.length}{" "}
          {project.users.length === 1
            ? "Collaborator"
            : "Collaborators"}
        </span>
      </div>

      {showRename && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setShowRename(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-80 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#181818] p-5 shadow-xl"
          >
            <h2 className="mb-4 text-lg font-semibold text-white">
              Rename Project
            </h2>

            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#121212] px-3 py-2 text-white outline-none transition-colors duration-200 focus:border-[#173D9D] focus:ring-1 focus:ring-[#173D9D]/20"
            />

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowRename(false)}
                className="rounded-lg bg-[#202020] px-4 py-2 text-white transition-colors duration-200 hover:bg-[#181818]"
              >
                Cancel
              </button>

              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  await renameProject(project._id, newName);
                  setShowRename(false);
                  window.location.reload();
                }}
                className="rounded-lg bg-[#173D9D] px-4 py-2 text-white transition-colors duration-200 hover:bg-[#2148A8] active:bg-[#14357F]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showDelete && (
  <div
    onClick={(e) => {
      e.stopPropagation();
      setShowDelete(false);
    }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="w-80 rounded-lg border border-white/10 bg-[#181818] p-5"
    >
      <h2 className="text-base font-semibold text-white">
        Delete Project
      </h2>

      <p className="mt-2 text-sm text-gray-400">
        Delete <span className="text-white">"{project.name}"</span>?
      </p>

      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={() => setShowDelete(false)}
          className="rounded-md bg-[#202020] px-4 py-2 text-sm text-white hover:bg-[#2A2A2A]"
        >
          Cancel
        </button>

        <button
          onClick={async () => {
            await deleteProject(project._id);
            window.location.reload();
          }}
          className="rounded-md bg-[#DC2626] px-4 py-2 text-sm text-white hover:bg-[#B91C1C]"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default ProjectCard;
