import React, { useState } from "react";
import "./ChildrenPage.css";
import Logo from "../../../assets/avatar_LOGO.jpg"
import Name from "../../../assets/NAME.png"

function ChildrenPage() {
    // State quản lý mở/đóng sidebar
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Hàm toggle sidebar
    const handleToggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="children-page">
            {/* Sidebar */}
            <aside className={`children-sidebar ${sidebarOpen ? "open" : "closed"}`}>
                {/* Logo + Toggle */}
                <div className="children-sidebar-header" onClick={handleToggleSidebar}>
                    {/* Logo luôn hiển thị */}
                    <img
                        src={Logo}
                        alt="Logo"
                        className="children-sidebar-logo"
                    />
                    {/* Chỉ hiển thị Name.png khi sidebarOpen = true */}
                    {sidebarOpen && (
                        <img
                            src={Name}
                            alt="BabyHaven"
                            className="children-sidebar-name"
                        />
                    )}
                </div>

                {/* Menu chính */}
                <nav className="children-sidebar-menu">
                    <ul>
                        <li className="children-menu-item active">
                            <i className="fas fa-child"></i>
                            <span>Children</span>
                        </li>
                        <li className="children-menu-item">
                            <i className="fas fa-stethoscope"></i>
                            <span>Consultation</span>
                        </li>
                        <li className="children-menu-item">
                            <i className="fas fa-heartbeat"></i>
                            <span>Health Analyst</span>
                        </li>
                        <li className="children-menu-item">
                            <i className="fas fa-user-md"></i>
                            <span>Doctor</span>
                        </li>
                        <li className="children-menu-item">
                            <i className="fas fa-bell"></i>
                            <span>Notifications</span>
                        </li>
                        <li className="children-menu-item">
                            <i className="fas fa-cog"></i>
                            <span>Settings</span>
                        </li>
                    </ul>
                </nav>
            </aside>

            {/* Nội dung trang Children */}
            <main className="children-content">
                {/* Header */}
                <header className="children-header">
                    <div className="children-page-title">
                        <h1>Children</h1>
                    </div>
                    <div className="children-header-actions">
                        <input
                            type="text"
                            placeholder="Search child"
                            className="children-search-input"
                        />
                        <span className="children-user-info">Hello, ABD</span>
                    </div>
                </header>

                {/* Danh sách con */}
                <section className="children-child-list">
                    <div className="children-child-card active">
                        <span className="children-child-name">Child 1</span>
                        <span className="children-child-date">DOB: 1/Jan/2023</span>
                    </div>
                    <div className="children-child-card">
                        <span className="children-child-name">Child 2</span>
                        <span className="children-child-date">DOB: 5/May/2021</span>
                    </div>
                    <div className="children-child-card children-add-card">
                        <i className="fas fa-plus"></i>
                        <span>Add Child</span>
                    </div>
                </section>

                {/* Thông tin chi tiết Child 1 */}
                <section className="children-child-details">
                    <div className="children-child-info">
                        <h2>Child 1</h2>
                        <p>Gender: Male</p>
                        <p>Date of Birth: 5-Mar-2023</p>
                        <p>Alert: Medium level</p>
                        <button>Contact to Doctor</button>
                    </div>

                    <div className="children-growth-info">
                        <h3>Growth information</h3>
                        {/* Chart placeholders */}
                        <div className="children-chart-container">
                            <p>Weight / Height chart goes here</p>
                            <p>Line Chart Example</p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default ChildrenPage;