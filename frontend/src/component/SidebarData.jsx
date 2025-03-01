import { assets } from "../assets/assets"

export const SidebarData = [
  {
    title: 'HOME',
    path: '/',
    icon: <img src={assets.home} alt="Home" className="w-6 h-6" />,
  },
  {
    title: 'Profile',
    path: '/profile',
    icon: <img src={assets.profile} alt="Profile" className="w-6 h-6" />,
  },
  {
      title: 'Upload Image',
      path: '/upload',
      icon: <img src={assets.upload} alt="Profile" className="w-6 h-6" />,
  },
  {
    title: 'Gallery',
    path: '/image-gallery',
    icon: <img src={assets.image} alt="Profile" className="w-6 h-6" />,
  },
  {
    title: 'Team',
    path: '/team',
    icon: <img src={assets.team} alt="Team" className="w-6 h-6" />,
  },
  {
    title: 'Support',
    path: '/support',
    icon: <img src={assets.support} alt="Support" className="w-6 h-6" />,
  },
  {
    title: 'About',
    path: '/about',
    icon: <img src={assets.about} alt="About" className="w-6 h-6 text-white" />,
  },
  {
    title: 'Login',
    path: '/login',
    icon: <img src={assets.logout} alt="Logout" className="w-6 h-6 text-white" />,
  },
  {
    title: 'Logout',
    path: '/logout',
    icon: <img src={assets.logout} alt="Logout" className="w-6 h-6 text-white" />,
  },

];
