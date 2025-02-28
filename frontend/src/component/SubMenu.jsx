import PropTypes from "prop-types";
import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";

const SubMenu = ({ item, onClick }) => {
  const { theme } = useContext(ThemeContext);

  return (
    <div>
      <NavLink
        to={item.path}
        onClick={onClick ? onClick : null}
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
