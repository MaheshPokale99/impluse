import PropTypes from "prop-types";
import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";

const SubMenu = ({ item, onClick }) => {
  const { theme } = useContext(ThemeContext);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user && (item.title === "Upload Image" || item.title === "Logout")) {
    return null;
  }
  if (user && user.role !== "admin" && item.title === "Upload Image") {
    return null;
  }
  if (user && item.title === "Login") return null;
  

  const handleClick = () => {
    if (item.title === "Logout") {
      logout();
      navigate("/login");
      window.location.reload();
    }
    if (item.title === "Login") {
      navigate("/login");
      window.location.reload();
    }
    if (onClick) onClick();
  };

  return (
    <div>
      <NavLink
        to={item.title === "Logout" ? "#" : item.path}
        onClick={handleClick}
        className={`flex items-center px-5 py-4 text-lg transition-all duration-200 
          ${
            theme === "dark"
              ? "text-white hover:bg-zinc-800 hover:text-blue-400"
              : "text-black hover:bg-zinc-300 hover:text-blue-400"
          } 
          hover:border-l-4 hover:border-purple-500`}
        aria-label={item.title}
      >
        <div className="flex items-center space-x-4">
          {item.icon}
          <span className="ml-4">{item.title}</span>
        </div>
      </NavLink>
    </div>
  );
};

SubMenu.propTypes = {
  item: PropTypes.shape({
    title: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    icon: PropTypes.node.isRequired,
  }).isRequired,
  onClick: PropTypes.func,
};

export default SubMenu;
