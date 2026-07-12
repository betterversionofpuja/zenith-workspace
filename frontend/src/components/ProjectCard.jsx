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

  return (
    <div
      className="group relative cursor-pointer rounded-xl border border-white/10 bg-[#141414] p-5 transition-all duration-200 hover:border-blue-500/40 hover:bg-[#181818]"
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
          className="flex-shrink-0 rounded-md p-1 text-gray-500 opacity-0 transition-all duration-200 hover:bg-[#222] hover:text-white group-hover:opacity-100"
        >
          <HiOutlineDotsVertical className="text-lg" />
        </button>

        {showMenu && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-4 top-12 z-20 w-36 rounded-lg border border-white/10 bg-[#1b1b1b] py-1 shadow-xl"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(false);
                setShowRename(true);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-[#2a2a2a]"
            >
              Rename
            </button>

            <button
              onClick={async (e) => {
                e.stopPropagation();
                setShowMenu(false);

                if (!window.confirm("Delete this project?")) return;

                await deleteProject(project._id);

                window.location.reload();
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-[#2a2a2a]"
            >
              Delete
            </button>
          </div>
        )}

      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
        <HiOutlineUserGroup className="text-base" />

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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-80 rounded-xl border border-white/10 bg-[#1b1b1b] p-5 shadow-xl"
          >
            <h2 className="mb-4 text-lg font-semibold text-white">
              Rename Project
            </h2>

            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#111] px-3 py-2 text-white outline-none focus:border-blue-500"
            />

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowRename(false)}
                className="rounded-lg bg-[#2a2a2a] px-4 py-2 text-white"
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
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-500"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;