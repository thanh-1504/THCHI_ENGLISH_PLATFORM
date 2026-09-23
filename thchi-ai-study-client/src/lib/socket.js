import { io } from "socket.io-client";
let socket = null;

const SOCKET_URL =
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_SERVER_URL
    : import.meta.env.VITE_API_URL;

export function connecSocket(accessToken) {
  socket = io(SOCKET_URL, {
    auth: { accessToken: accessToken },
    withCredentials: true,
  });
  socket.on("connect", () =>
    console.log(`Socket connected with id ${socket.id}`),
  );
  socket.on("disconnect", () => console.log(`Socket disconnected `));

  return socket;
}

export function getSocket() {
  return socket;
}
