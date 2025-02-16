import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import { SidebarData } from "./SidebarData";
import SubMenu from "./SubMenu";
import { IconContext } from "react-icons/lib";

const Sidebar = () => {
  const [sidebar, setSidebar] = useState(false);

  const showSidebar = () => setSidebar(!sidebar);

  const closeSidebar = (e) => {
    if (!e.target.closest(".sidebar") && !e.target.closest(".sidebar-toggle")) {
      setSidebar(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", closeSidebar);
    return () => document.removeEventListener("mousedown", closeSidebar);
  }, []);

  return (
    <>
      <IconContext.Provider value={{ color: "" }}>
        <div className="h-16 flex items-center justify-start">
          <Link to="#" className="ml-8 text-3xl flex items-center sidebar-toggle">
            <FaIcons.FaBars onClick={showSidebar} className="text-zinc-800 dark:text-zinc-200 hover:scale-110 transition-transform lg:mt-2" />
          </Link>
        </div>

        <nav
          className={`fixed top-0 right-0 w-72 h-screen z-50 shadow-lg rounded-l-lg backdrop-blur-md bg-white/80 dark:bg-black/80 
          transition-transform duration-300 sidebar transform ${sidebar ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="w-full p-6">
            <div className="flex justify-end">
              <AiIcons.AiOutlineClose onClick={showSidebar} className="text-2xl text-gray-700 dark:text-gray-300 cursor-pointer hover:scale-110 transition-transform" />
            </div>

            <div className="mt-6">
              {SidebarData.map((item, index) => (
                <SubMenu item={item} key={index} onClick={showSidebar} />
              ))}
            </div>
          </div>
        </nav>
      </IconContext.Provider>
    </>
  );
};

export default Sidebar;
