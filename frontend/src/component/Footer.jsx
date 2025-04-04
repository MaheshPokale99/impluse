import { IoMail } from "react-icons/io5";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { FaLinkedin, FaTwitter, FaGithub, FaDiscord } from "react-icons/fa";

const Footer = () => {
    return (
        <footer className="w-full mt-32 bg-gradient-to-br from-white to-blue-50 dark:from-zinc-900 dark:to-black border-t dark:border-zinc-800 text-zinc-900 dark:text-white">
            <div className="max-w-6xl mx-auto py-16 px-6">
                {/* Top Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
                    {/* Logo Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="flex flex-col items-center md:items-start gap-y-4"
                    >
                        <NavLink to="/" className="flex items-center group relative overflow-hidden">
                            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 
                                bg-clip-text text-transparent transition-all duration-300 
                                group-hover:from-indigo-500 group-hover:to-purple-600">
                                Impulse
                            </h1>
                            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-600 to-indigo-500 
                                transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                        </NavLink>
                        <p className="max-w-[300px] font-normal text-base text-zinc-600 dark:text-zinc-400">
                            Empowering your journey to success through expert mentorship and guidance.
                        </p>
                        
                        {/* Social Media Icons */}
                        <div className="flex space-x-4 mt-4">
                            {[
                                { icon: <FaTwitter />, link: "#" },
                                { icon: <FaLinkedin />, link: "#" },
                                { icon: <FaGithub />, link: "#" },
                                { icon: <FaDiscord />, link: "#" },
                            ].map((social, index) => (
                                <a 
                                    key={index} 
                                    href={social.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="h-10 w-10 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center
                                        text-blue-500 hover:text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-500
                                        transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1"
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </motion.div>

                    {/* Quick Links */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="flex flex-col items-center md:items-start gap-y-6"
                    >
                        <h1 className="font-semibold text-xl relative inline-block">
                            Quick Links
                            <span className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-blue-600 to-indigo-500"></span>
                        </h1>
                        <nav className="text-zinc-600 dark:text-zinc-400 flex flex-col space-y-3 mt-2">
                            {[
                                { name: "Home", link: "/home" },
                                { name: "About Us", link: "/about" },
                                { name: "Mentors", link: "/explore-mentors" },
                                { name: "Success Stories", link: "/success-stories" },
                                { name: "Gallery", link: "/image-gallery" },
                            ].map((link, index) => (
                                <NavLink
                                    key={index}
                                    to={link.link}
                                    className="hover:text-blue-600 transition-all duration-300 flex items-center group"
                                >
                                    <span className="w-0 h-[1px] bg-blue-600 transition-all duration-300 mr-0 group-hover:w-3 group-hover:mr-2"></span>
                                    {link.name}
                                </NavLink>
                            ))}
                        </nav>
                    </motion.div>

                    {/* Contact */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="flex flex-col items-center md:items-start gap-y-6"
                    >
                        <h1 className="font-semibold text-xl relative inline-block">
                            Get in Touch
                            <span className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-blue-600 to-indigo-500"></span>
                        </h1>
                        <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400 group">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center 
                                group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-500 transition-all duration-300">
                                <IoMail className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:text-white" />
                            </div>
                            <a
                                href="mailto:implusehelp@gmail.com"
                                className="text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
                            >
                                implusehelp@gmail.com
                            </a>
                        </div>
                        
                        <button className="mt-4 px-6 py-3 rounded-full 
                            bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-indigo-500 hover:to-purple-600
                            text-white font-medium shadow-md hover:shadow-lg transition-all duration-300
                            hover:scale-105">
                            Contact Us
                        </button>
                    </motion.div>
                </div>
                
                {/* Bottom Section */}
                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-zinc-800 text-center">
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                        © {new Date().getFullYear()} Impulse. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
