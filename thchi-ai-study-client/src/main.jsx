import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "./index.css";
import AuthProvider from "./providers/AuthProvider";
import router from "./routes/routes";
const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <AuthProvider>
    <RouterProvider router={router} />
    <ToastContainer
      limit={1}
      autoClose={2000}
      pauseOnHover={false}
      theme="colored"
    />
  </AuthProvider>,
);
