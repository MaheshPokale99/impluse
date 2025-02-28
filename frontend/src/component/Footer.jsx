import { IoMail } from "react-icons/io5";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

const Footer = () => {
    return (
        <footer className="manrope-regular w-full mt-32 bg-white dark:bg-zinc-900 border-t-2 dark:border-zinc-700 text-zinc-900 dark:text-white">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 py-12 px-6 text-center md:text-left">
                
                {/* Logo Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="flex flex-col items-center md:items-start gap-y-3"
                >
                    <NavLink to="/" className="flex justify-center items-center">
                        <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-700 to-blue-400 bg-clip-text text-transparent">
                            Impulse
                        </h1>
                    </NavLink>
                    <p className="max-w-[400px] font-normal text-base text-zinc-600 dark:text-zinc-300">
                        The Ultimate Guide to Ace Success
                    </p>
                </motion.div>

                {/* Quick Links */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="flex flex-col items-center md:items-start gap-y-3"
                >
                    <h1 className="font-semibold text-lg">Quick Links</h1>
                    <nav className="text-zinc-500 dark:text-zinc-400 flex flex-col space-y-1">
                        <NavLink 
                            to="/home" 
                            className="hover:text-blue-500 transition-all duration-300"
                        >
                            Home
                        </NavLink>
                        <NavLink 
                            to="/about" 
                            className="hover:text-blue-500 transition-all duration-300"
                        >
                            About Us
                        </NavLink>
                    </nav>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 30 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex flex-col items-center md:items-start gap-y-3"
                >
                    <h1 className="font-semibold text-lg">Get in Touch</h1>
                    <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
                        <IoMail className="w-5 h-5 text-blue-500" />
                        <a 
                            href="mailto:impulse@gmail.com" 
                            className="text-blue-500 hover:underline transition-all duration-300"
                        >
                            impulse@gmail.com
                        </a>
                    </div>
                </motion.div>
            </div>
        </footer>
    );
};

export default Footer;
