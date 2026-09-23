import { useEffect } from "react";
import { connecSocket, getSocket } from "../lib/socket";
import useAuthStore from "../store/useAuthStore";
import { useNotificationStore } from "../store/useNotificationStore";

export function useSocketListeners() {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );

  useEffect(() => {
    if (!user) return;
    const socket = getSocket() ?? connecSocket(accessToken);
    socket.on("notification:new", addNotification);

    return () => {
      socket.off("notification:new", addNotification);
    };
  }, [user, accessToken, addNotification]);
}

export function usePaymentSocket(transactionId, { onSuccess, onFailed } = {}) {
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (!transactionId) return;

    const socket = getSocket() ?? connecSocket(accessToken);

    // Join vào room của giao dịch này
    socket.emit("payment:join", { transactionId });

    const handleSuccess = (data) => {
      if (onSuccess) onSuccess(data);
    };

    const handleFailed = (data) => {
      if (onFailed) onFailed(data);
    };

    socket.on("payment:success", handleSuccess);
    socket.on("payment:failed", handleFailed);

    return () => {
      socket.off("payment:success", handleSuccess);
      socket.off("payment:failed", handleFailed);
    };
  }, [transactionId, accessToken, onSuccess, onFailed]);
}
