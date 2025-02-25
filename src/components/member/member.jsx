import "./member.css";
import Sidebar from "./sidebar/Sidebar.jsx";
import NavBar from "./navbar/Navbar.jsx";

function Member() {
    return (
        <div className="children-page">
          {/* Gọi Sidebar */}
          <Sidebar />
    
          {/* Khu vực bên phải */}
          <div className="children-main-content">
            {/* Gọi NavBar */}
            <NavBar />
            </div>
            </div>
            );
            }  

export default  Member;  
