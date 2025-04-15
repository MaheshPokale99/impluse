import axios from "axios";
import { useState } from "react";
import TextInput from "../component/TextInput";
import { motion } from "framer-motion";
import { FiUser, FiPhone, FiMail, FiMapPin, FiLock } from "react-icons/fi";
import { IoIosFlash } from "react-icons/io";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from 'react-router-dom';


const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
        }
    }
};

const floatingAnimation = {
    animate: {
        y: [0, -10, 0],
        transition: {
            duration: 3,
            ease: "easeInOut",
            repeat: Infinity
        }
    }
};

const Verify = () => {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        address: "",
    });
    const [showOtpForm, setShowOtpForm] = useState(false);
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const navigate=useNavigate();

    const inputFields = [
        { key: "name", placeholder: "Name", icon: FiUser },
        { key: "phone", placeholder: "Phone", icon: FiPhone },
        { key: "email", placeholder: "Email", icon: FiMail },
        { key: "address", placeholder: "Address", icon: FiMapPin },
    ];

    const token = localStorage.getItem("token");

    const handleChange = (e, key) => {
        setFormData((prev) => ({
            ...prev,
            [key]: e.target.value,
        }));
    };

    const handleOtpChange = (e) => {
        setOtp(e.target.value);
    };

    const handlegetOtp = async (e) => {
        e.preventDefault();

        if (Object.values(formData).some((val) => !val)) {
            toast.error("Please fill all fields.");
            return;
        }

        try {
            const Auth = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            setLoading(true);
            const response = await axios.post(
                `${backendUrl}/api/users/send-otp`,
                {
                    email: formData.email,
                },
                Auth
            );

            toast.success(response?.data?.message);
            setShowOtpForm(true);
        }
        catch (error) {
            toast.error(error.response?.data?.message || "Error submitting data.");
        }
        finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();

        if (!otp) {
            toast.error("Please enter OTP");
            return;
        }

        const Auth = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };

        try {
            setLoading(true);
            const response = await axios.put(
                `${backendUrl}/api/users/verify`,
                { 
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email,  
                    address: formData.address,
                    otp 
                },
                Auth
            );
            toast.success(response?.data?.message || "Verification completed successfully!");
            setTimeout(() => {
                navigate('/');
            }, 2500);
            
        }
        catch (error) {
            toast.error(error.response?.data?.message || "Invalid OTP. Please try again.");
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full px-4 sm:px-6 pt-12 pb-32">
            <Toaster position="top-right" reverseOrder={false} />

            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <motion.div animate={floatingAnimation.animate} className="absolute top-[15%] left-[15%] w-40 h-40 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl"></motion.div>
                <motion.div animate={{ ...floatingAnimation.animate, transition: { ...floatingAnimation.animate.transition, delay: 0.5 } }} className="absolute top-[40%] right-[10%] w-64 h-64 bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-3xl"></motion.div>
                <motion.div animate={{ ...floatingAnimation.animate, transition: { ...floatingAnimation.animate.transition, delay: 1 } }} className="absolute bottom-[10%] left-[20%] w-52 h-52 bg-indigo-400/10 dark:bg-indigo-600/10 rounded-full blur-3xl"></motion.div>
            </div>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                className="w-full max-w-xl mx-auto relative z-10"
            >
                <motion.div
                    className="absolute inset-0 bg-white/20 dark:bg-zinc-900/20 backdrop-blur-lg -z-10 rounded-3xl"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                ></motion.div>

                {!showOtpForm ? (
                    <motion.form
                        variants={staggerContainer}
                        className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md shadow-xl rounded-3xl border border-gray-100 dark:border-gray-700 p-8 sm:p-10 transition-all"
                        onSubmit={handlegetOtp}
                    >
                        <motion.div variants={fadeIn} className="text-center mb-8">
                            <div className="flex justify-center mb-2">
                                <motion.div
                                    className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center"
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <IoIosFlash className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                </motion.div>
                            </div>
                            <h2 className="text-3xl font-bold text-blue-600">
                                Verify Your Identity
                            </h2>
                            <p className="mt-2 text-zinc-600 dark:text-zinc-300">
                                Complete your profile to proceed
                            </p>
                        </motion.div>

                        <div className="space-y-4">
                            {inputFields.map(({ key, placeholder, icon }) => (
                                <motion.div
                                    key={key}
                                    variants={fadeIn}
                                    className="relative"
                                    whileHover={{ y: -2 }}
                                    transition={{ type: "spring", stiffness: 400 }}
                                >
                                    <TextInput
                                        type={key === "phone" ? "tel" : key === "email" ? "email" : "text"}
                                        name={key}
                                        placeholder={placeholder}
                                        value={formData[key]}
                                        onChange={(e) => handleChange(e, key)}
                                        icon={icon}
                                        className="pl-10 py-3.5"
                                    />
                                </motion.div>
                            ))}

                            <motion.button
                                variants={fadeIn}
                                whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.4)" }}
                                whileTap={{ scale: 0.97 }}
                                type="submit"
                                disabled={loading}
                                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 text-white font-medium py-3.5 rounded-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-indigo-500 flex items-center justify-center"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    <>Submit & Get OTP</>
                                )}
                            </motion.button>
                        </div>
                    </motion.form>
                ) : (
                    <motion.form
                        variants={staggerContainer}
                        className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md shadow-xl rounded-3xl border border-gray-100 dark:border-gray-700 p-8 sm:p-10 transition-all"
                        onSubmit={handleOtpSubmit}
                    >
                        <motion.div variants={fadeIn} className="text-center mb-8">
                            <div className="flex justify-center mb-2">
                                <motion.div
                                    className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center"
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <FiLock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                </motion.div>
                            </div>
                            <h2 className="text-3xl font-bold text-blue-600">
                                Enter OTP
                            </h2>
                            <p className="mt-2 text-zinc-600 dark:text-zinc-300">
                                We've sent a verification code to your email
                            </p>
                        </motion.div>

                        <div className="space-y-6">
                            <motion.div
                                variants={fadeIn}
                                className="relative"
                                whileHover={{ y: -2 }}
                                transition={{ type: "spring", stiffness: 400 }}
                            >
                                <TextInput
                                    type="text"
                                    name="otp"
                                    placeholder="Verification Code"
                                    value={otp}
                                    onChange={handleOtpChange}
                                    icon={FiLock}
                                />
                            </motion.div>
                            <div className="flex justify-end -translate-y-10 cursor-pointer">
                                <p className="text-blue-500 hover:text-blue-600 transition-colors duration-500 text-sm" onClick={handlegetOtp}>Resend OTP</p>
                            </div>

                            <motion.button
                                variants={fadeIn}
                                whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.4)" }}
                                whileTap={{ scale: 0.97 }}
                                type="submit"
                                disabled={loading}
                                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 text-white font-medium py-3.5 rounded-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-indigo-500 flex items-center justify-center"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Verifying...
                                    </>
                                ) : (
                                    <>Verify OTP</>
                                )}
                            </motion.button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => setShowOtpForm(false)}
                                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                >
                                    Back to form
                                </button>
                            </div>
                        </div>
                    </motion.form>
                )}
            </motion.div>
        </div>
    );
};

export default Verify;