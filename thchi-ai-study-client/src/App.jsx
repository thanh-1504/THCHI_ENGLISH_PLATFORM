import { Outlet } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import Header from "./components/Header";
import { useSocketListeners } from "./hooks/useSocketListeners";
function App() {
  useSocketListeners();
  return (
    <div>
      <Header />
      <Outlet />
    </div>
  );
}

export default App;
