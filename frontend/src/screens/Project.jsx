import { useEffect, useState, useContext, useRef } from "react";
import axiosInstance from "../config/axios";
import { useParams } from "react-router-dom";
import {
    PanelGroup,
    Panel,
    PanelResizeHandle,
} from "react-resizable-panels";
import {
    HiOutlineUsers,
    HiOutlinePaperAirplane,
    HiOutlinePaperClip,
    HiOutlineEmojiHappy,
    HiOutlineX,
} from "react-icons/hi";
import { initializeSocket, receiveMessage, sendMessage, disconnectSocket, } from "../config/socket";
import { UserContext } from "../context/user.context.jsx";
import Markdown from 'markdown-to-jsx';
import Workspace from "../components/Workspace.jsx";

const Project = () => {

    const { projectId } = useParams();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [project, setProject] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const { user } = useContext(UserContext);
    const [messages, setMessages] = useState([]);
    const messagesContainerRef = useRef(null);
    const [isZenithThinking, setIsZenithThinking] = useState(false);
    const [fileTree, setFileTree] = useState({});
    console.log(messages);

    console.log(projectId);

    const fetchProject = async () => {
        try {
            const response = await axiosInstance.get(
                `/projects/get-project/${projectId}`
            );

            setProject(response.data.project);
            setFileTree(response.data.project.fileTree || {});

        } catch (error) {
            console.log(error);
        }
    };

    const fetchMessages = async () => {
        try {
            const response = await axiosInstance.get(
                `/messages/${projectId}`
            );

            setMessages(response.data.messages);
        } catch (error) {
            console.log(error);
        }
    };

    function send() {
        if (!message.trim()) return;

        const newMessage = {
            message,
            sender: user._id,
            email: user.email,
        };

        sendMessage("project-message", newMessage);

        setMessage("");
    }

    useEffect(() => {
        if (!project?._id) return;

        // Don't save an empty workspace on initial load
        if (Object.keys(fileTree).length === 0) return;

        const timeout = setTimeout(async () => {
            try {
                await axiosInstance.put(
                    `/projects/update-file-tree/${project._id}`,
                    { fileTree }
                );
            } catch (error) {
                console.error(error);
            }
        }, 500);

        return () => clearTimeout(timeout);
    }, [fileTree, project]);


    useEffect(() => {
        if (projectId) {
            fetchProject();
            fetchMessages();
        }
    }, [projectId]);

    function mergeFileTrees(existingTree = {}, newTree = {}) {
        const merged = { ...existingTree };

        for (const key in newTree) {
            if (
                merged[key] &&
                typeof merged[key] === "object" &&
                !merged[key].file &&
                typeof newTree[key] === "object" &&
                !newTree[key].file
            ) {
                merged[key] = mergeFileTrees(merged[key], newTree[key]);
            } else {
                merged[key] = newTree[key];
            }
        }

        return merged;
    }

    useEffect(() => {
        if (!project?._id) return;

        initializeSocket(project._id);

        receiveMessage("project-message", (data) => {
            if (data.isAI) {
                setIsZenithThinking(false);

                if (data.fileTree) {
                    setFileTree((prev) =>
                        mergeFileTrees(prev, data.fileTree)
                    );
                }
            }

            setMessages((prev) => [...prev, data]);
        });

        receiveMessage("zenith-thinking", () => {
            setIsZenithThinking(true);
        });

        return () => {
            disconnectSocket();
        };
    }, [project]);

    useEffect(() => {
        if (!messagesContainerRef.current) return;

        messagesContainerRef.current.scrollTop =
            messagesContainerRef.current.scrollHeight;
    }, [messages]);

    const addCollaborator = async () => {
        try {
            const response = await axiosInstance.get("/users/all");

            const user = response.data.users.find(
                (u) => u.email === email
            );

            if (!user) {
                alert("User not found");
                return;
            }

            await axiosInstance.put("/projects/add-user", {
                projectId,
                users: [user._id],
            });

            fetchProject();
            setEmail("");
            setIsAddModalOpen(false);

        } catch (error) {
            console.log(error);
        }
    };



    return (
        <main className="relative h-screen overflow-hidden bg-black">
            {/* Background Glow */}
            <div className="absolute -left-40 bottom-[-180px] h-[500px] w-[500px] rounded-full bg-blue-700/20 blur-[180px]" />

            <PanelGroup direction="horizontal" className="h-full">

                {/* ================= LEFT PANEL ================= */}

                <Panel defaultSize={30} minSize={20} maxSize={45}>
                    <section className="relative flex h-full flex-col border-r border-blue-500/20 bg-[#121212]/95 backdrop-blur-xl">
                        {/* Header */}

                        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-blue-500/20 bg-[#121212]/95 px-6 py-5 backdrop-blur-xl">

                            <div className="flex items-center gap-4">

                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1b1b1b] shadow-[0_0_20px_rgba(37,99,235,0.15)] transition hover:bg-[#202020]"
                                >
                                    <HiOutlineUsers className="text-3xl text-blue-400" />
                                </button>

                                <div>
                                    <h1 className="text-2xl font-semibold text-white">
                                        {project?.name}
                                    </h1>

                                    <p className="mt-1 text-sm text-gray-400">
                                        {project?.users.length} Collaborators
                                    </p>
                                </div>

                            </div>

                        </div>

                        {/* Messages */}

                        <div
                            ref={messagesContainerRef}
                            className="flex-1 overflow-y-auto p-5 space-y-3"
                        >
                            {messages.length === 0 ? (
                                <div className="flex h-full items-center justify-center">
                                    <div className="text-center">
                                        <div className="mb-6 text-6xl">💬</div>

                                        <h2 className="text-3xl font-light text-white">
                                            Start chatting
                                        </h2>

                                        <p className="mt-4 text-gray-500">
                                            Collaborate with your teammates in real time.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                messages.map((msg, index) => (


                                    <div
                                        key={index}
                                        className={`mb-4 flex ${msg.sender === user._id ? "justify-end" : "justify-start"
                                            }`}
                                    >
                                        <div
                                            className={`max-w-[75%] rounded-2xl px-4 py-3 ${msg.sender === user._id
                                                ? "bg-blue-600 text-white"
                                                : "bg-[#222] text-white"
                                                }`}
                                        >
                                            <p
                                                className={`mb-2 text-xs font-semibold ${msg.sender === user._id
                                                    ? "text-blue-100"
                                                    : "text-gray-400"
                                                    }`}
                                            >
                                                {msg.email.split("@")[0]}
                                            </p>

                                            <div className="flex items-end justify-between gap-4">
                                                <div className="overflow-x-auto break-words text-[15px] leading-relaxed">
                                                    {msg.isAI ? (
                                                        <Markdown>{msg.message}</Markdown>
                                                    ) : (
                                                        msg.message
                                                    )}
                                                </div>

                                                <span
                                                    className={`shrink-0 text-[11px] ${msg.sender === user._id
                                                        ? "text-blue-100/70"
                                                        : "text-gray-500"
                                                        }`}
                                                >
                                                    {new Date(msg.createdAt || msg.timestamp).toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))


                            )}
                            {isZenithThinking && (
                                <div className="mb-4 flex justify-start">
                                    <div className="max-w-[75%] rounded-2xl bg-[#222] px-4 py-3 text-white">
                                        <p className="mb-2 text-xs font-semibold text-gray-400">
                                            zenith
                                        </p>

                                        <p className="animate-pulse text-sm italic text-gray-300">
                                            Thinking...
                                        </p>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Message Box */}

                        <div className="border-t border-blue-500/20 bg-[#121212]/95 p-5">

                            <div className="flex h-14 items-center gap-3 rounded-2xl border border-blue-500/20 bg-[#1a1a1a] px-4 shadow-[0_0_20px_rgba(37,99,235,0.08)]">

                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            send();
                                        }
                                    }}
                                    className="flex-1 bg-transparent text-white placeholder:text-gray-500 outline-none"
                                />

                                <button className="rounded-full p-2 text-gray-400 transition hover:bg-[#232323] hover:text-white">
                                    <HiOutlinePaperClip size={22} />
                                </button>

                                <button className="rounded-full p-2 text-gray-400 transition hover:bg-[#232323] hover:text-white">
                                    <HiOutlineEmojiHappy size={22} />
                                </button>

                                <button
                                    onClick={send}
                                    className="rounded-full bg-blue-600 p-3 text-white shadow-[0_0_20px_rgba(37,99,235,0.35)] transition-all duration-300 hover:scale-105 hover:bg-blue-700 hover:shadow-[0_0_35px_rgba(37,99,235,0.55)]"
                                >
                                    <HiOutlinePaperAirplane size={18} />
                                </button>

                            </div>

                        </div>

                    </section>
                </Panel>
                <PanelResizeHandle className="w-[3px] bg-white/10 hover:bg-blue-500 transition-colors" />

                {/* ================= RIGHT PANEL ================= */}

                <Panel defaultSize={70}>
                    <section className="relative flex h-full overflow-hidden bg-black">

                        <div className="absolute right-[-250px] top-[-150px] h-[450px] w-[450px] rounded-full bg-blue-700/10 blur-[180px]" />

                        <Workspace
                        projectId={projectId}
                            fileTree={fileTree}
                            onFileChange={(filePath, content) => {
                                setFileTree((prev) => {
                                    const updated = structuredClone(prev);

                                    const keys = filePath.split("/");
                                    let current = updated;

                                    for (let i = 0; i < keys.length - 1; i++) {
                                        current = current[keys[i]];
                                    }

                                    current[keys[keys.length - 1]].file.contents = content;

                                    return updated;
                                });
                            }}
                            onTreeChange={setFileTree}

                        />

                    </section>
                </Panel>

                {/* ================= COLLABORATORS SIDEBAR ================= */}

                <div
                    className={`fixed left-0 top-0 z-50 h-screen w-[360px] border-r border-blue-500/20 bg-[#121212]/95 backdrop-blur-xl shadow-[0_0_40px_rgba(37,99,235,0.15)] transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                        }`}
                >

                    {/* Sidebar Header */}

                    <div className="flex items-center justify-between border-b border-blue-500/20 px-6 py-5">

                        <div>
                            <h2 className="text-2xl font-semibold text-white">
                                Collaborators
                            </h2>

                            <p className="mt-1 text-sm text-gray-400">
                                {project?.users.length} Members
                            </p>
                        </div>

                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="rounded-full p-2 text-gray-400 transition hover:bg-[#222] hover:text-white"
                        >
                            <HiOutlineX size={24} />
                        </button>

                    </div>

                    {/* Members */}

                    <div className="space-y-4 p-5">
                        {project?.users.map((user, index) => (
                            <div
                                key={user._id}
                                className="flex items-center gap-4 rounded-2xl bg-[#1b1b1b] p-4 transition hover:bg-[#232323]"
                            >
                                <div className="grid h-12 w-12 place-items-center rounded-full bg-blue-600 text-lg font-semibold text-white flex-shrink-0">
                                    {user.email.charAt(0).toUpperCase()}
                                </div>

                                <div>
                                    <h3 className="truncate font-medium text-white">
                                        {user.email}
                                    </h3>

                                    <p className="text-sm text-gray-500">
                                        {index === 0 ? "Owner" : "Collaborator"}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Bottom Button */}

                    <div className="absolute bottom-0 left-0 w-full border-t border-blue-500/20 bg-[#121212]/95 p-5">

                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="w-full rounded-xl bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700"
                        >
                            + Add Collaborator
                        </button>

                    </div>

                </div>

                {isAddModalOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsAddModalOpen(false)}
                        />

                        <div className="fixed left-1/2 top-1/2 z-[70] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-blue-500/20 bg-[#121212] p-6">

                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-2xl font-semibold text-white">
                                    Add Collaborators
                                </h2>

                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <HiOutlineX size={24} />
                                </button>
                            </div>

                            <input
                                type="email"
                                placeholder="Enter collaborator's email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-xl border border-gray-700 bg-[#1b1b1b] px-4 py-3 text-white outline-none focus:border-blue-500"
                            />

                            <button
                                onClick={addCollaborator}
                                className="mt-6 w-full rounded-xl bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700"
                            >
                                Add Collaborator
                            </button>

                        </div>
                    </>
                )}

                {/* Overlay */}

                {isSidebarOpen && (
                    <div
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                    />
                )}
            </PanelGroup>

        </main>
    );
};

export default Project;