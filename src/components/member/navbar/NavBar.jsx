import React from "react";
import "./NavBar.css";

function NavBar() {
  return (
    <header className="children-topbar">
      <div className="children-search-container">
        <input
          type="text"
          placeholder="Hinted search text"
          className="children-search-input"
        />
      </div>
      <div className="children-user-info">Hello, ABC</div>
    </header>
  );
}

export default NavBar;
