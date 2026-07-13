import { memo, useState, useCallback, useEffect } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  FileCode2,
  X,
  FilePlus2,
  FolderPlus
} from "lucide-react";
import {
  PanelGroup,
  Panel,
  PanelResizeHandle,
} from "react-resizable-panels";
import { addFile, addFolder } from "../utils/fileTree";
import {
  createFile as createFileAPI,
  createFolder as createFolderAPI,
  renameItem as renameItemAPI,
  deleteItem as deleteItemAPI,
} from "../services/project.service";


const getLanguage = (fileName) => {
  const ext = fileName.split(".").pop().toLowerCase();

  switch (ext) {
    case "js":
      return "javascript";
    case "jsx":
      return "javascript";
    case "ts":
      return "typescript";
    case "tsx":
      return "typescript";
    case "json":
      return "json";
    case "html":
      return "html";
    case "css":
      return "css";
    case "scss":
      return "scss";
    case "md":
      return "markdown";
    case "py":
      return "python";
    case "java":
      return "java";
    case "c":
      return "c";
    case "cpp":
      return "cpp";
    case "go":
      return "go";
    case "rs":
      return "rust";
    case "php":
      return "php";
    default:
      return "plaintext";
  }
};

const Workspace = ({
  fileTree = {},
  onFileChange,
  onTreeChange,
  projectId,
  projectName,
}) => {
  const [openFiles, setOpenFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [showCreateFile, setShowCreateFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    target: null,
    type: null, // "file" | "folder"
  });
  const [expandedFolders, setExpandedFolders] = useState({
    project: true,
  });


  const monaco = useMonaco();

  useEffect(() => {
    if (!monaco) return;

    monaco.editor.defineTheme("zenith-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#000000",
        "editor.lineHighlightBackground": "#181818",
        "editorCursor.foreground": "#8FB4FF",
        "editor.selectionBackground": "#173D9D55",
        "editor.inactiveSelectionBackground": "#173D9D33",
      },
    });
  }, [monaco]);


  useEffect(() => {
    const closeMenu = () =>
      setContextMenu((prev) => ({
        ...prev,
        visible: false,
      }));

    window.addEventListener("click", closeMenu);

    return () => window.removeEventListener("click", closeMenu);
  }, []);

  const toggleFolder = (path) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const openFile = useCallback((name, contents) => {
    const file = {
      name,
      content: contents,
    };

    setOpenFiles((prev) => {
      if (prev.some((f) => f.name === name)) {
        return prev;
      }

      return [...prev, file];
    });

    setActiveFile(file);
  }, []);

  const createFile = async () => {
    if (!newFileName.trim()) return;

    const folderPath =
      contextMenu.type === "folder"
        ? contextMenu.target
        : "";

    try {
      const { data } = await createFileAPI(
        projectId,
        folderPath,
        newFileName
      );

      onTreeChange(data.fileTree);

      setNewFileName("");
      setShowCreateFile(false);
    } catch (err) {
      console.error(err);
    }
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;

    const folderPath =
      contextMenu.type === "folder"
        ? contextMenu.target
        : "";

    try {
      const { data } = await createFolderAPI(
        projectId,
        folderPath,
        newFolderName
      );

      onTreeChange(data.fileTree);

      setNewFolderName("");
      setShowCreateFolder(false);
    } catch (err) {
      console.error(err);
    }
  };

  const renameItem = async () => {
    if (!renameValue.trim()) return;

    try {
      const { data } = await renameItemAPI(
        projectId,
        contextMenu.target,
        renameValue
      );

      onTreeChange(data.fileTree);

      setShowRenameModal(false);
      setRenameValue("");
    } catch (err) {
      console.error(err);
    }
  };

  const deleteItem = async () => {
    try {
      const { data } = await deleteItemAPI(
        projectId,
        contextMenu.target
      );

      onTreeChange(data.fileTree);

      setContextMenu((prev) => ({
        ...prev,
        visible: false,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const renderTree = useCallback(
    (tree, path = "") => {
      if (!tree || typeof tree !== "object") return null;

      return Object.entries(tree).map(([name, value]) => {
        const currentPath = path ? `${path}/${name}` : name;

        // File
        if (value?.file) {
          return (
            <div
              key={currentPath}
              onClick={() => openFile(currentPath, value.file.contents)}
              onContextMenu={(e) => {
                e.preventDefault();

                setContextMenu({
                  visible: true,
                  x: e.clientX,
                  y: e.clientY,
                  target: currentPath,
                  type: "file",
                });
              }}
              className="ml-5 flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-gray-300 transition-colors duration-200 hover:bg-[#202020]"
            >              <FileCode2 size={15} className="text-gray-500" />
              <span>{name}</span>
            </div>
          );
        }

        if (!value || typeof value !== "object") return null;

        const expanded = expandedFolders[currentPath];



        return (
          <div key={currentPath} className="ml-4">
            <div
              onClick={() => toggleFolder(currentPath)}
              onContextMenu={(e) => {
                e.preventDefault();

                setContextMenu({
                  visible: true,
                  x: e.clientX,
                  y: e.clientY,
                  target: currentPath,
                  type: "folder",
                });
              }}
              className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-white transition-colors duration-200 hover:bg-[#202020]"
            >
              {expanded ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}

              {expanded ? (
                <FolderOpen size={16} className="text-gray-500" />
              ) : (
                <Folder size={16} className="text-gray-500" />
              )}

              <span>{name}</span>
            </div>

            {expanded && (
              <div className="ml-4 border-l border-[rgba(255,255,255,0.08)] pl-2">
                {renderTree(value, currentPath)}
              </div>
            )}
          </div>
        );
      });
    },
    [expandedFolders, openFile]
  );





  return (
    <PanelGroup
      direction="horizontal"
      className="h-full w-full bg-black"
    >
      {/* Explorer */}
      <Panel defaultSize={25} minSize={15} maxSize={40}>
        <aside className="h-full overflow-auto border-r border-[rgba(255,255,255,0.08)] bg-[#121212]">
          <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] px-4 py-3">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
              Explorer
            </span>

            <div className="flex items-center gap-3 text-gray-500">


              <FilePlus2
                size={16}
                className="cursor-pointer transition-colors duration-200 hover:text-gray-300"
                onClick={() => setShowCreateFile(true)}
              />

              <FolderPlus
                size={16}
                className="cursor-pointer transition-colors duration-200 hover:text-gray-300"
                onClick={() => setShowCreateFolder(true)}
              />

            </div>
          </div>

          <div className="px-2 py-2 text-sm">
            {/* Root Project */}

            <div
              onClick={() => toggleFolder("project")}
              className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-white transition-colors duration-200 hover:bg-[#202020]"
            >
              {expandedFolders.project ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}

              {expandedFolders.project ? (
                <FolderOpen size={17} className="text-gray-500" />
              ) : (
                <Folder size={17} className="text-gray-500" />
              )}

              <span className="font-medium">
                {projectName || "project"}
              </span>
            </div>

            {expandedFolders.project && (
              <div className="ml-4 border-l border-[rgba(255,255,255,0.08)] pl-3">
                {renderTree(fileTree)}
              </div>
            )}
          </div>
        </aside>
      </Panel>
      <PanelResizeHandle className="w-px bg-[rgba(255,255,255,0.05)] transition-colors duration-200 hover:bg-[#173D9D]/60" />

      {/* Editor */}
      <Panel defaultSize={75}>
        <section className="flex h-full flex-col">
          <div className="flex h-11 overflow-x-auto whitespace-nowrap bg-[#121212]">
            {openFiles.map((file) => (
              <button
                key={file.name}
                onClick={() => setActiveFile(file)}
                  className={`flex shrink-0 items-center gap-2 px-4 text-sm ${activeFile?.name === file.name
                  ? "bg-black text-white"
                  : "text-gray-400 transition-colors duration-200 hover:bg-[#202020]"
                  }`}
              >
                <span>{file.name}</span>
                <X
                  size={13}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();

                    setOpenFiles((prev) => {
                      const updated = prev.filter((f) => f.name !== file.name);

                      if (activeFile?.name === file.name) {
                        setActiveFile(updated.length ? updated[updated.length - 1] : null);
                      }

                      return updated;
                    });
                  }}
                />
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-hidden">
            {activeFile ? (
              <Editor
                height="100%"
                theme="zenith-dark"
                language={getLanguage(activeFile.name)}
                value={activeFile.content}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  automaticLayout: true,
                  wordWrap: "on",
                  scrollBeyondLastLine: false,
                  scrollbar: {
                    vertical: "hidden",
                    horizontal: "hidden",
                  },
                }}
                onChange={(value) => {
                  const updatedContent = value ?? "";

                  setActiveFile((prev) => ({
                    ...prev,
                    content: updatedContent,
                  }));

                  setOpenFiles((prev) =>
                    prev.map((file) =>
                      file.name === activeFile.name
                        ? { ...file, content: updatedContent }
                        : file
                    )
                  );

                  onFileChange?.(activeFile.name, updatedContent);
                }}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-600">
                Select a file to view its contents.
              </div>
            )}
          </div>
        </section>
      </Panel>

      {contextMenu.visible && (
        <div
          className="fixed z-50 w-48 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#181818] py-1 shadow-xl"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
        >
          {contextMenu.type === "folder" && (
            <>
              <button
                onClick={() => {
                  setShowCreateFile(true);
                  setContextMenu((prev) => ({ ...prev, visible: false }));
                }}
                className="block w-full px-4 py-2 text-left text-sm text-gray-300 transition-colors duration-200 hover:bg-[#202020] hover:text-white"
              >
                New File
              </button>

              <button
                onClick={() => {
                  setShowCreateFolder(true);
                  setContextMenu((prev) => ({ ...prev, visible: false }));
                }}
                className="block w-full px-4 py-2 text-left text-sm text-gray-300 transition-colors duration-200 hover:bg-[#202020] hover:text-white"
              >
                New Folder
              </button>

              <div className="my-1 border-t border-[rgba(255,255,255,0.08)]" />
            </>
          )}

          <button
            onClick={() => {
              setRenameValue(contextMenu.target.split("/").pop());
              setShowRenameModal(true);
              setContextMenu((prev) => ({
                ...prev,
                visible: false,
              }));
            }}
            className="block w-full px-4 py-2 text-left text-sm text-gray-300 transition-colors duration-200 hover:bg-[#202020] hover:text-white"
          >
            Rename
          </button>

          <button
            onClick={deleteItem}
            className="block w-full px-4 py-2 text-left text-sm text-[#DC2626] transition-colors duration-200 hover:bg-[#202020]"
          >
            Delete
          </button>
        </div>
      )}

      {showCreateFile && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-80 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#181818] p-5 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Create New File
            </h2>

            <input
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="e.g. app.js"
              className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#121212] px-3 py-2 text-white placeholder:text-gray-500 outline-none transition-colors duration-200 focus:border-[#173D9D] focus:ring-1 focus:ring-[#173D9D]/20"
            />

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowCreateFile(false);
                  setNewFileName("");
                }}
                className="rounded-lg bg-[#202020] px-3 py-2 text-white transition-colors duration-200 hover:bg-[#181818]"
              >
                Cancel
              </button>

              <button
                onClick={createFile}
                className="rounded-lg bg-[#173D9D] px-3 py-2 text-white transition-colors duration-200 hover:bg-[#2148A8] active:bg-[#14357F]"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateFolder && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-80 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#181818] p-5 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Create New Folder
            </h2>

            <input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="e.g. components"
              className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#121212] px-3 py-2 text-white placeholder:text-gray-500 outline-none transition-colors duration-200 focus:border-[#173D9D] focus:ring-1 focus:ring-[#173D9D]/20"
            />

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowCreateFolder(false);
                  setNewFolderName("");
                }}
                className="rounded-lg bg-[#202020] px-3 py-2 text-white transition-colors duration-200 hover:bg-[#181818]"
              >
                Cancel
              </button>

              <button
                onClick={createFolder}
                className="rounded-lg bg-[#173D9D] px-3 py-2 text-white transition-colors duration-200 hover:bg-[#2148A8] active:bg-[#14357F]"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {showRenameModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-80 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#181818] p-5 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Rename
            </h2>

            <input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#121212] px-3 py-2 text-white outline-none transition-colors duration-200 focus:border-[#173D9D] focus:ring-1 focus:ring-[#173D9D]/20"
            />

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowRenameModal(false);
                  setRenameValue("");
                }}
                className="rounded-lg bg-[#202020] px-3 py-2 text-white transition-colors duration-200 hover:bg-[#181818]"
              >
                Cancel
              </button>

              <button
                onClick={renameItem}
                className="rounded-lg bg-[#173D9D] px-3 py-2 text-white transition-colors duration-200 hover:bg-[#2148A8] active:bg-[#14357F]"
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}
    </PanelGroup>
  );
};

export default memo(Workspace);
