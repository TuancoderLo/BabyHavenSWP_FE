import React from "react";
import "./NavBar.css";

function NavBar() {
  return (
    <header className="member-topbar">
      <div className="member-search-container">
        <input
          type="text"
          placeholder="Hinted search text"
          className="children-search-input"
        />
      </div>
      <div className="member-user-info">Hello, ABC</div>
    </header>
  );
}

export default NavBar;
