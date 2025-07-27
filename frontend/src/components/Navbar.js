import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-gray-800 p-4 text-white flex justify-between items-center">
      <div className="font-bold text-xl">
        <Link to="/">E-Commerce Store</Link>
      </div>
      <div className="space-x-6">
        <Link className="hover:text-gray-300" to="/">Home</Link>
        <Link className="hover:text-gray-300" to="/cart">Cart</Link>
        {user && (
          <Link className="hover:text-gray-300" to="/orders">
            Order History
          </Link>
        )}
        {user ? (
          <button
            onClick={handleLogout}
            className="hover:text-gray-300 cursor-pointer bg-red-600 px-3 py-1 rounded"
          >
            Logout ({user.username})
          </button>
        ) : (
          <Link className="hover:text-gray-300" to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
