import { IoMail } from "react-icons/io5";
import { NavLink } from "react-router-dom";

const Footer = () => {
    return (
        <div className="manrope-regular min-h-48 w-full mt-32 bg-white dark:bg-zinc-900 dark:border-zinc-300 border-t-2 dark:text-white">
            <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-4 py-8 items-center">
                {/* Logo Section */}
                <div className="flex flex-col items-center gap-y-3 px-3 text-center">
                    <NavLink to="/">
                        <div className="w-48 flex justify-center items-center">
                            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-700 to-blue-400 bg-clip-text text-transparent">
                                Impulse
                            </h1>
                        </div>
                    </NavLink>
                    <p className=" max-w-[400px] font-normal text-base">
                        The Ultimate Guide to Ace Success
                    </p>
                </div>

                {/* Quick Links */}
                <div className="flex flex-col gap-y-2 text-center text-lg">
                    <h1 className="font-medium cursor-pointer">Quick Links</h1>
                    <div className="text-[#ABAFB8] flex flex-col cursor-pointer">
                        <NavLink to={"/home"}>Home</NavLink>
                        <NavLink to={"/about"}>About Us</NavLink>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="flex flex-col gap-y-3 text-center text-lg">
                    <h1 className="font-medium">GET IN TOUCH</h1>
                    <div className="flex items-center gap-x-3 justify-center text-[#ABAFB8] cursor-pointer">
                        <IoMail className="w-5 h-5" />
                        <span>
                            <a href="mailto:impulse@gmail.com" className="rajdhani-regular text-blue-400  underline">impulse@gmail.com</a>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Footer;
