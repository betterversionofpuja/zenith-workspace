import "dotenv/config";

import http from "http"; // Creates a real HTTP server (Socket.io needs this)

import { Server } from "socket.io";
import app from "./app.js";

const port = process.env.PORT || 3000;

// Wrap the Express app inside an HTTP server
// Client → HTTP Server → Express
const server = http.createServer(app);

// Attach Socket.io to the same HTTP server
// Now this server can handle both HTTP requests and WebSocket connections
const io = new Server(server, {
    cors: {
        // Allow the React app to connect to the Socket.io server
        origin: "http://localhost:5173",
        credentials: true,
    },
});

//middleware which lets only authenticated user to connect with socket.io
io.use((socket, next) => {
    try {
        const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1];
        if (!token) {
            return next(new Error('Authentication error'))
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return next(new Error('Authentication error'))
        }

        socket.user = decoded;

        next();

    } catch (error) {
        next(error)
    }
})

io.on("connection", (socket) => { //whenever a new client connects to the server, this event is triggered
    console.log("User connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// Export io so it can be used anywhere in the backend
// e.g. io.emit(), io.to(room).emit()
export { io };

// Start the HTTP server
// This starts both Express APIs and the Socket.io server
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});