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
    HiOutlineDotsVertical,
    HiOutlinePencil,
} from "react-icons/hi";
import { initializeSocket, receiveMessage, sendMessage, disconnectSocket, } from "../config/socket";
import { UserContext } from "../context/user.context.jsx";
import Markdown from 'markdown-to-jsx';
import Workspace from "../components/Workspace.jsx";
import TextareaAutosize from "react-textarea-autosize";
import {
    clearProjectChat,
    editMessage,
    regenerateMessage,
} from "../services/project.service";


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
    const [showProjectMenu, setShowProjectMenu] = useState(false);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editedMessage, setEditedMessage] = useState("");
    const [showEditModal, setShowEditModal] = useState(false);
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

    const handleSaveEdit = async () => {
        if (!editedMessage.trim()) return;
        const shouldRegenerate = editedMessage
            .toLowerCase()
            .includes("@zenith");

        setShowEditModal(false);

        setMessages((prev) =>
            prev.map((msg) =>
                msg._id === editingMessageId
                    ? {
                        ...msg,
                        message: editedMessage,
                        edited: true,
                    }
                    : msg
            )
        );

        await editMessage(editingMessageId, editedMessage);

        if (shouldRegenerate) {
            setIsZenithThinking(true);

            const response = await regenerateMessage(editingMessageId);

            if (response.data.aiMessage) {
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg._id === response.data.aiMessage._id
                            ? response.data.aiMessage
                            : msg
                    )
                );
            }

            if (response.data.fileTree) {
                setFileTree((prev) =>
                    mergeFileTrees(prev, response.data.fileTree)
                );
            }

            setIsZenithThinking(false);
        }
        if (response.data.aiMessage) {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg._id === response.data.aiMessage._id
                        ? response.data.aiMessage
                        : msg
                )
            );
        }

        if (response.data.fileTree) {
            setFileTree((prev) =>
                mergeFileTrees(prev, response.data.fileTree)
            );
        }

        setIsZenithThinking(false);

        setEditingMessageId(null);
        setEditedMessage("");
    };



    return (
        <main className="relative h-screen overflow-hidden bg-black">
            {/* Background Glow */}
            <div className="absolute -left-40 bottom-[-180px] h-[500px] w-[500px] rounded-full bg-[#173D9D]/12 blur-[180px]" />

            <PanelGroup direction="horizontal" className="h-full">

                {/* ================= LEFT PANEL ================= */}

                <Panel defaultSize={30} minSize={20} maxSize={45}>
                    <section className="relative flex h-full flex-col bg-[#121212]/95 backdrop-blur-xl">
                        {/* Header */}

                        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] bg-[#121212] px-5 py-3">

                            <div className="flex items-center justify-between w-full">

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setIsSidebarOpen(true)}
                                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#181818] transition-colors duration-200 hover:bg-[#202020]"
                                    >
                                        <HiOutlineUsers className="text-xl text-gray-500" />
                                    </button>

                                    <div>
                                        <h1 className="text-xl font-semibold leading-none text-white">
                                            {project?.name}
                                        </h1>

                                        <p className="mt-1 text-xs text-gray-500">
                                            {project?.users.length} collaborators
                                        </p>
                                    </div>
                                </div>

                                <div className="relative">
                                    <button
                                        onClick={() => setShowProjectMenu((prev) => !prev)}
                                        className="rounded-md p-2 text-gray-500 transition-colors duration-200 hover:bg-[#202020] hover:text-gray-300"
                                    >
                                        <HiOutlineDotsVertical className="text-lg" />
                                    </button>

                                    {showProjectMenu && (
                                        <div className="absolute right-0 top-10 z-50 w-40 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#181818] py-1 shadow-xl">
                                            <button
                                                onClick={async () => {
                                                    if (!window.confirm("Clear all chat messages?")) return;

                                                    await clearProjectChat(projectId);

                                                    setMessages([]);
                                                    setShowProjectMenu(false);
                                                }}
                                                className="w-full px-4 py-2 text-left text-sm text-[#DC2626] transition-colors duration-200 hover:bg-[#202020]"
                                            >
                                                Clear Chat
                                            </button>
                                        </div>
                                    )}
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
                                        className={`group mb-5 flex ${msg.sender === user._id
                                            ? "justify-end"
                                            : "justify-start"
                                            }`}
                                    >
                                        <div
                                            style={{ maxWidth: "75%" }}
                                            className={`relative inline-block min-w-[180px] max-w-fit rounded-lg border px-3 py-1 shadow-sm ${msg.sender === user._id
                                                ? "border-[#173D9D]/25 bg-[#173D9D]/15 text-white"
                                                : "border-[rgba(255,255,255,0.08)] bg-[#181818] text-white"
                                                }`}
                                        >
                                            <p
                                                className={`mb-1 text-[11px] font-medium ${msg.sender === user._id
                                                    ? "text-[#8FB4FF]"
                                                    : "text-gray-400"
                                                    }`}
                                            >
                                                {msg.email.split("@")[0].charAt(0).toUpperCase() +
                                                    msg.email.split("@")[0].slice(1)}
                                            </p>

                                            {msg.sender === user._id && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingMessageId(msg._id);
                                                        setEditedMessage(msg.message);
                                                        setShowEditModal(true);
                                                    }}
                                                    className="absolute right-2 top-2 z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                                                >
                                                    <HiOutlinePencil className="text-[11px] text-gray-500 transition-colors duration-200 hover:text-gray-300" />
                                                </button>
                                            )}

                                            <div className="relative">
                                                <div className="whitespace-pre-wrap break-words pr-12 text-[13px] leading-[1.55]">
                                                    {msg.isAI ? (
                                                        <Markdown>{msg.message}</Markdown>
                                                    ) : (
                                                        msg.message
                                                    )}
                                                </div>

                                                <span
                                                    className={`absolute bottom-0 right-0 text-[11px] ${msg.sender === user._id
                                                        ? "text-[#8FB4FF]/70"
                                                        : "text-gray-500"
                                                        }`}
                                                >
                                                    {msg.edited && (
                                                        <span className="mr-1 text-[10px] opacity-70">
                                                            Edited
                                                        </span>
                                                    )}

                                                    {new Date(msg.createdAt || msg.timestamp).toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </span>
                                            </div>                                      </div>
                                    </div>
                                ))


                            )}
                            {isZenithThinking && (
                                <div className="mb-4 flex justify-start">
                                    <div className="max-w-[75%] rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#181818] px-4 py-3 text-white">
                                        <p className="mb-1 text-xs font-semibold text-gray-400">
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

                        <div className="bg-[#121212] p-3">
                            <div className="flex items-end gap-1 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#181818] px-3 py-2 transition-colors duration-200 focus-within:border-[#173D9D] focus-within:ring-1 focus-within:ring-[#173D9D]/20">

                                <TextareaAutosize
                                    minRows={1}
                                    maxRows={6}
                                    value={message}
                                    placeholder="Ask Zenith..."
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            send();
                                        }
                                    }}
                                    className="flex-1 resize-none bg-transparent text-sm leading-6 text-white placeholder:text-gray-500 outline-none"
                                />

                                <button
                                    onClick={send}
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-gray-500 transition-colors duration-200 hover:bg-[#202020] hover:text-gray-300"
                                >
                                    <HiOutlinePaperAirplane size={18} />
                                </button>

                            </div>
                        </div>

                    </section>
                </Panel>
                <PanelResizeHandle
                    className="w-px bg-[rgba(255,255,255,0.08)] transition-colors duration-200 hover:bg-[#173D9D]/60"
                />

                {/* ================= RIGHT PANEL ================= */}

                <Panel defaultSize={70}>
                    <section className="relative flex h-full overflow-hidden bg-black">

                        <div className="absolute right-[-250px] top-[-150px] h-[450px] w-[450px] rounded-full bg-[#173D9D]/10 blur-[180px]" />

                        <Workspace
                            projectId={projectId}
                            projectName={project?.name}
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
                    className={`fixed left-0 top-0 z-50 h-screen w-[330px] border-r border-[rgba(255,255,255,0.08)] bg-[#121212] transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                        }`}
                >
                    {/* Header */}

                    <div className="border-b border-[rgba(255,255,255,0.08)] px-6 py-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-white">
                                    Collaborators
                                </h2>

                                <p className="mt-1 text-xs text-gray-500">
                                    {project?.users.length} Members
                                </p>
                            </div>

                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className="rounded-md p-2 text-gray-500 transition-colors duration-200 hover:bg-[#202020] hover:text-gray-300"
                            >
                                <HiOutlineX size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Members */}

                    <div className="space-y-3 overflow-y-auto p-5 pb-28">
                        {project?.users.map((user, index) => {
                            const username = user.email.split("@")[0];

                            return (
                                <div
                                    key={user._id}
                                    className="flex items-center gap-3 rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#181818] p-3 transition-colors duration-200 hover:bg-[#202020]"
                                >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#173D9D] font-semibold text-white">
                                        {username.charAt(0).toUpperCase()}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <h3 className="truncate text-[15px] font-medium text-white">
                                            {username.charAt(0).toUpperCase() + username.slice(1)}
                                        </h3>

                                        <p className="truncate text-xs text-gray-500">
                                            {user.email}
                                        </p>

                                        <p className="mt-1 text-[11px] text-[#8FB4FF]">
                                            {index === 0 ? "Owner" : "Collaborator"}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Bottom Button */}

                    <div className="absolute bottom-0 left-0 w-full border-t border-[rgba(255,255,255,0.08)] bg-[#121212] p-5">
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#173D9D] py-3 font-medium text-white transition-colors duration-200 hover:bg-[#2148A8] active:bg-[#14357F]"
                        >
                            <span className="text-lg">+</span>
                            <span>Add Collaborator</span>
                        </button>
                    </div>
                </div>

                {isAddModalOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsAddModalOpen(false)}
                        />

                        <div className="fixed left-1/2 top-1/2 z-[70] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#181818] p-6 shadow-2xl">

                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-2xl font-semibold text-white">
                                    Add Collaborators
                                </h2>

                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="text-gray-500 transition-colors duration-200 hover:text-gray-300"
                                >
                                    <HiOutlineX size={24} />
                                </button>
                            </div>

                            <input
                                type="email"
                                placeholder="Enter collaborator's email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#121212] px-4 py-3 text-white placeholder:text-gray-500 outline-none transition-colors duration-200 focus:border-[#173D9D] focus:ring-1 focus:ring-[#173D9D]/20"
                            />

                            <button
                                onClick={addCollaborator}
                                className="mt-6 w-full rounded-lg bg-[#173D9D] py-3 font-medium text-white transition-colors duration-200 hover:bg-[#2148A8] active:bg-[#14357F]"
                            >
                                Add Collaborator
                            </button>



                        </div>
                    </>
                )}

                {showEditModal && (
                    <div
                        className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
                        onClick={() => setShowEditModal(false)}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="w-[650px] rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#181818] p-6 shadow-2xl"
                        >
                            <h2 className="mb-5 text-xl font-semibold text-white">
                                Edit Message
                            </h2>

                            <TextareaAutosize
                                autoFocus
                                minRows={8}
                                value={editedMessage}
                                onChange={(e) => setEditedMessage(e.target.value)}
                                className="w-full resize-none rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#121212] p-4 text-[15px] leading-7 text-white outline-none transition-colors duration-200 focus:border-[#173D9D] focus:ring-1 focus:ring-[#173D9D]/20"
                            />

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="rounded-lg bg-[#202020] px-5 py-2 text-white transition-colors duration-200 hover:bg-[#181818]"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleSaveEdit}
                                    className="rounded-lg bg-[#173D9D] px-5 py-2 text-white transition-colors duration-200 hover:bg-[#2148A8] active:bg-[#14357F]"
                                >
                                    Save & Resend
                                </button>
                            </div>
                        </div>
                    </div>
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
