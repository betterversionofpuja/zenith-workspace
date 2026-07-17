<div align="center">

# ⚡ Zenith Workspace

### A Real-Time, AI-Powered Collaborative Cloud IDE

**Live chat. Live code. Live AI.**

`MERN Stack` · `WebSockets` · `Gemini AI` · `RAG` · `JWT Auth` · `Redis`

[**🔗 Live Demo**](https://zenithws.vercel.app/) &nbsp;·&nbsp; [**⚙️ API**](https://zenith-workspace-api.onrender.com) &nbsp;·&nbsp; [**📂 Source**](https://github.com/betterversionofpuja/zenith-workspace)

</div>

---

## 📸 Project Preview

<p align="center">
  <img src="./assets/project.png" alt="Zenith Workspace Preview" width="100%">
</p>

---

## 📖 About

**Zenith Workspace** is a real-time collaborative coding platform. Anyone can spin up a **project room**, invite teammates, and **live-chat** with every collaborator inside that room — while an integrated AI Software Engineering Assistant, **Zenith**, sits right there in the conversation, ready to help whenever someone types `@zenith`.

Zenith isn't a bolt-on chatbot. It's **context-aware**: it reads your project's actual files, retrieves only the ones relevant to your question using **vector embeddings + cosine similarity search** (a lightweight **RAG** pipeline), and streams back code, fixes, or full file trees live into everyone's editor over **WebSockets**.

---

## 🧭 How It Works — A First-Time Walkthrough

1. **Sign up / Log in** — secured with **JWT (JSON Web Tokens)** and **bcrypt**-hashed passwords.
2. **Create a Project Room** — this becomes your shared workspace with its own file tree and chat.
3. **Invite Collaborators** — add teammates by email. *(Only registered users can be added — a teammate must already have a Zenith account before they can be added as a collaborator.)*
4. **Live Chat with Collaborators** — every message is broadcast in real time via **Socket.IO**, so all room members see the conversation as it happens.
5. **Code Together** — the built-in **Monaco Editor** (the same editor that powers VS Code) lets everyone create, edit, rename, and delete files/folders, synced live for the whole room.
6. **Bring in Zenith** — mention `@zenith <your request>` in the chat. Behind the scenes:
   - Your prompt is converted into a **vector embedding** (`gemini-embedding-001`).
   - It's compared against every project file's stored embedding using **cosine similarity** to pull in only the **most relevant files** as context (RAG in action).
   - That context + your prompt goes to **Gemini (`gemini-2.5-flash`)** with a custom **system-instruction persona**, so Zenith responds like a senior engineer, not a generic bot.
7. **Watch It Build** — Zenith's reply (explanation, fix, or a generated file tree) is parsed, **merged into the live project**, saved, and pushed to every collaborator's screen instantly.
8. **Iterate** — edit or regenerate any AI message, clear the chat, rename/delete the project — all from the room itself.

---

## ✨ Feature Highlights

- 🔴 **Real-Time Multiplayer Rooms** — live chat + live file-tree sync across every collaborator, powered by **Socket.IO**.
- 🤖 **In-Chat AI Pair Programmer** — `@zenith` triggers context-aware code generation and engineering guidance via **Google Gemini**.
- 🧠 **Retrieval-Augmented Generation (RAG)** — embeddings + cosine similarity ensure Zenith only sees relevant files, not a blind dump of the whole codebase.
- 🖥️ **In-Browser Monaco Editor** — full VS-Code-grade editing experience, no local setup.
- 🔐 **Secure, Stateless Auth** — **JWT** + **bcrypt**, with HTTP-only cookies.
- 🚫 **Redis-Backed Token Blacklisting** — logout instantly invalidates a JWT via **Redis**, closing the replay-attack window.
- 💬 **Editable, Persistent Chat History** — edit/regenerate messages, clear chat — backed by MongoDB.
- 🎨 **Polished, Responsive UI** — **React 19** + **Tailwind CSS v4**, resizable split panels, Markdown-rendered, syntax-highlighted AI responses.
- 👤 **Account Management** — dedicated profile page to view account info, securely change your password, and log out.

---

## 🛠️ Tech Stack

**Frontend**

![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io_Client-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![Monaco Editor](https://img.shields.io/badge/Monaco_Editor-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white)
![Markdown](https://img.shields.io/badge/Markdown-000000?style=for-the-badge&logo=markdown&logoColor=white)

**Backend**

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express_5-000000?style=for-the-badge&logo=express&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![bcrypt](https://img.shields.io/badge/bcrypt-338033?style=for-the-badge&logo=npm&logoColor=white)

**Databases & Caching**

![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)

**AI / ML**

![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)
![RAG](https://img.shields.io/badge/RAG-Retrieval_Augmented_Generation-4B8BBE?style=for-the-badge)
![Vector Embeddings](https://img.shields.io/badge/Vector_Embeddings-FF6F00?style=for-the-badge)

**Deployment**

![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)

**Core Concepts Applied:** Retrieval-Augmented Generation (RAG) · Vector Embeddings & Cosine Similarity Search · WebSocket-Based Real-Time Sync · RESTful API Design · Stateless JWT Authentication · Token Blacklisting / Session Invalidation · MVC Architecture · Middleware-Based Auth Guards · Prompt Engineering · Recursive File-Tree Data Structures

---

## 🏗️ Architecture

```
┌─────────────────┐      WebSocket (Socket.IO)       ┌──────────────────┐
│   React Client    │◄────────────────────────────────►│  Node.js + Express │
│ (Vite + Monaco)   │        REST API (Axios/JWT)       │  + Socket.IO Server│
└─────────────────┘◄────────────────────────────────►└──────────────────┘
                                                                │
                        ┌───────────────────────────────────────┼───────────────────────┐
                        ▼                                       ▼                       ▼
               ┌─────────────────┐                    ┌──────────────────┐      ┌───────────────┐
               │    MongoDB        │                    │   Redis Cache      │      │  Google Gemini  │
               │ Users · Projects   │                    │ (JWT Blacklist)    │      │ Chat + Embeddings│
               │ Messages · Files   │                    └──────────────────┘      └───────────────┘
               │ + Vector Embeddings│
               └─────────────────┘
```

**RAG flow:** prompt → embed (`gemini-embedding-001`) → cosine-similarity match against stored file embeddings → top-K relevant files as context → `gemini-2.5-flash` generates response (auto-falls back to `gemini-3.5-flash` on failure) → file tree merged & broadcast live to the room.

---

## 📄 License

**Proprietary / All Rights Reserved**

This repository is shared for portfolio purposes only.

---

## 👩‍💻 About the Author

**Puja Kumari**

- 🐦 X (Twitter): [https://x.com/pujakumaricodes](https://x.com/pujakumaricodes)
- 💼 LinkedIn: [https://www.linkedin.com/in/betterversionofpuja](https://www.linkedin.com/in/betterversionofpuja)
- 📧 Email: [betterversionofpuja@gmail.com](mailto:betterversionofpuja@gmail.com)

---

## ⭐ Support the Project

If you found this project useful or interesting, consider giving it a ⭐ on GitHub.

It helps others discover the project and motivates me to continue building and improving it.