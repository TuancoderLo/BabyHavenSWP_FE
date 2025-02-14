// Navbar.jsx
import { FaSearch } from "react-icons/fa";
import "./Navbar.css";

function Navbar() {
    return (
        <div className="navbar">
            {/* Nếu muốn hiển thị nút hamburger ở đây */}
            {/*           <div className="navbar-toggle" onClick={toggleSidebar}>
                &#9776;
            </div>*/}

            <div className="navbar-search">
                <FaSearch className="search-icon" />
                <input type="text" placeholder="Search..." />
            </div>

            <div className="navbar-user">
                <span>Helu!!! BabyThree</span>
            </div>
        </div>
    );
}


export default Navbar;
