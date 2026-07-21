import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "../types/socket.types";
import { socketAuthMiddleware } from "../middlewares/socket-auth.middleware";
import { verifyToken } from "../utils/jwt";

let io: Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export function initSocket(httpServer: HttpServer) {
  io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("join-form", (formId) => {
      socket.join(`form-${formId}`);
      if (!socket.data.formsJoined.includes(formId)) {
        socket.data.formsJoined.push(formId);
      }
      console.log(
        console.log(`Socket ${socket.id} joined form-${formId} (userId: ${socket.data.userId || "anonymous"})`)
      );
    });

    socket.on("leave-form", (formId) => {
      socket.leave(`form-${formId}`);
      socket.data.formsJoined = socket.data.formsJoined.filter(
        (id) => id !== formId,
      );
      console.log(`Socket ${socket.id} left form-${formId}`);
    });

    socket.on("authenticate", (data, callback) => {
      try {
        const decoded = verifyToken(data.token);
        socket.data.userId = decoded.userId;
        callback(true, decoded.userId);
      } catch (error) {
        callback(false);
      }
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io is not initialized");
  }
  return io;
}
