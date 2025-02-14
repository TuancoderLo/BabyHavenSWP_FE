// src/components/Sidebar/Sidebar.jsx
import {
    FaHome, FaChartLine, FaUsers, FaBox, FaEnvelope, FaBell, FaCog, FaSignOutAlt
} from "react-icons/fa";
import "./Sidebar.css";
import PropTypes from "prop-types";

// Import ảnh logo và Name
import logoIcon from "../../assets/logo.png";
import nameIcon from "../../assets/Name.png";

function Sidebar({ isOpen, toggleSidebar }) {
    return (
        <div className={`sidebar ${isOpen ? "open" : ""}`}>
            {/* Thay biểu tượng 3 gạch bằng ảnh logo */}
            <div className="sidebar-toggle-btn" onClick={toggleSidebar}>
                <img src={logoIcon} alt="Logo" className="logo-img" />
            </div>

            {/* Logo hoặc tiêu đề -> thay BabyHaven bằng ảnh Name.png */}
            <div className="sidebar-logo">
                {isOpen ? (
                    <img src={nameIcon} alt="BabyHaven" className="name-img" />
                ) : (
                    <h2></h2> /* Nếu không muốn hiển thị gì khi đóng sidebar, để rỗng */
                )}
            </div>

            {/* Menu items */}
            <ul className="sidebar-menu">
                <li>
                    <FaHome className="icon" />
                    {isOpen && <span>Home</span>}
                </li>
                <li>
                    <FaChartLine className="icon" />
                    {isOpen && <span>Analysis</span>}
                </li>
                <li>
                    <FaUsers className="icon" />
                    {isOpen && <span>Members</span>}
                </li>
                <li>
                    <FaBox className="icon" />
                    {isOpen && <span>Packages</span>}
                </li>
                <li>
                    <FaEnvelope className="icon" />
                    {isOpen && <span>Inbox</span>}
                </li>
                <li>
                    <FaBell className="icon" />
                    {isOpen && <span>Notifications</span>}
                </li>
                <li>
                    <FaCog className="icon" />
                    {isOpen && <span>Settings</span>}
                </li>
            </ul>

            {/* Footer (Sign out) */}
            <div className="sidebar-footer">
                <FaSignOutAlt className="icon" />
                {isOpen && <span>Sign Out</span>}
            </div>
        </div>
    );
}

Sidebar.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggleSidebar: PropTypes.func.isRequired,
};

export default Sidebar;
