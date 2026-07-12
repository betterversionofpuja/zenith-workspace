import { useEffect, useState } from "react";
import { HiOutlinePlus, HiOutlineX } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../config/axios";
import ProjectCard from "../components/ProjectCard";

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(false);

  const [projects, setProjects] = useState([]);
  const [fetchingProjects, setFetchingProjects] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setFetchingProjects(true);

      const response = await axiosInstance.get("/projects/all");

      setProjects(response.data.projects);
    } catch (error) {
      console.log(error);
    } finally {
      setFetchingProjects(false);
    }
  };

  const handleCreateProject = async () => {
    if (!localStorage.getItem("token")) {
      navigate("/register");
      return;
    }

    if (!projectName.trim()) return;

    setLoading(true);

    try {
      await axiosInstance.post("/projects/create", {
        name: projectName,
      });

      await fetchProjects();

      setProjectName("");
      setIsModalOpen(false);
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          error.response?.data?.errors?.[0]?.msg ||
          "Failed to create project"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black px-8 py-8">
      {/* Background Glow */}
      <div className="absolute bottom-[-180px] left-1/2 h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[170px]" />

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-7 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Projects
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Create and manage all your projects with AI assistance.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex h-10 items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <HiOutlinePlus className="text-lg" />
            New Project
          </button>
        </div>

        {/* Projects */}
        {fetchingProjects ? (
          <div className="py-20 text-center text-gray-500">
            Loading projects...
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-[#111111] py-20 text-center">
            <p className="text-lg text-gray-300">
              No projects
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Create your first project to start collaborating.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <>
          <div
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          <div className="fixed left-1/2 top-1/2 z-50 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-[#151515] p-6 shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-5 top-5 text-gray-500 transition hover:text-white"
            >
              <HiOutlineX size={20} />
            </button>

            <h2 className="text-2xl font-semibold text-white">
              New Project
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Enter a name for your project.
            </p>

            <input
              type="text"
              placeholder="e.g. AI Code Reviewer"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="mt-6 h-11 w-full rounded-lg border border-white/10 bg-[#1b1b1d] px-4 text-white outline-none transition focus:border-blue-500"
            />

            <button
              onClick={handleCreateProject}
              disabled={loading}
              className="mt-6 h-11 w-full rounded-lg bg-blue-600 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Project"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;