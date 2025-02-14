import { useState } from 'react'
import Sidebar from "./components/Sidebar/Sidebar";
import Navbar from "./components/Navbar/Navbar";
import Dashboard from "./pages/Dashboard/Dashboard";
import "./App.css";
function App() {
  // State để quản lý sidebar đóng/mở
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Phần nội dung chính (Navbar + trang) */}
      <div className="main-content">
        <Navbar toggleSidebar={toggleSidebar} />
        <Dashboard />
      </div>
    </div>
  );
}

export default App
