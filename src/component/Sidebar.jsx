import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as FaIcons from 'react-icons/fa';
import * as AiIcons from 'react-icons/ai';
import { SidebarData } from './SidebarData';
import SubMenu from './SubMenu';
import { IconContext } from 'react-icons/lib';

const Sidebar = () => {
  const [sidebar, setSidebar] = useState(false);

  const showSidebar = () => setSidebar(!sidebar);
  const closeSidebar = (e) => {
    if (!e.target.closest('.sidebar') && !e.target.closest('.sidebar-toggle')) {
      setSidebar(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', closeSidebar);
    return () => document.removeEventListener('mousedown', closeSidebar);
  }, []);

  return (
    <>
      <IconContext.Provider value={{ color: '' }}>
      <div className="h-20 flex items-center justify-start">
        <Link to="#" className="ml-8 text-3xl flex items-center sidebar-toggle">
          <FaIcons.FaBars onClick={showSidebar}  className='text-zinc-200 mb-4 md:mb-0'/>
        </Link>
      </div>

      <nav
        className={`bg-white dark:bg-[#15171c] w-72 h-screen fixed top-0 right-0 transition-transform duration-300 z-50 sidebar bg-gradient-to-b from-sky-100 to-sky-50 dark:from-zinc-900 ${
          sidebar ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="w-full">
          <Link to="#" className="flex justify-start items-center h-20 text-3xl ml-8">
            <AiIcons.AiOutlineClose onClick={showSidebar} />
          </Link>

          {SidebarData.map((item, index) => (
            <SubMenu item={item} key={index} 
            onClick={showSidebar}/>
          ))}
        </div>
      </nav>
      </IconContext.Provider>
    </>
  );
};

export default Sidebar;
