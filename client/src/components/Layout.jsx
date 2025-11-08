import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = () => {
  return (
    <div className="min-h-screen app-bg">
      <div className="app-overlay" />
      <Navbar />
      <main className="relative z-10 py-8 px-4">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;