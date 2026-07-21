import type { Socket } from "socket.io";
import { verifyToken } from "../utils/jwt";
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "../types/socket.types";
import { ERRORS } from "../utils/errors";

type SocketType = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export function socketAuthMiddleware(
  socket: SocketType,
  next: (err?: Error) => void,
) {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error(ERRORS.TOKEN_MISSING.code));
  }

  try {
    const decoded = verifyToken(token);
    socket.data.userId = decoded.userId;
    socket.data.formsJoined = [];
    next();
  } catch (error) {
    next(new Error(ERRORS.TOKEN_INVALID.code));
  }
}
