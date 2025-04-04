import { useState } from "react";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import PropTypes from "prop-types";
import TextInput from "../component/TextInput";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiLock, FiArrowRight } from "react-icons/fi";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const staggerFormItems = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
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

const AuthForm = ({
  title,
  subtitle,
  buttonText,
  endpoint,
  redirectPath,
  altText,
  altLink,
  altHref,
  showNameField,
  isForgotPassword,
}) => {
  const [user, setUser] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Handle forgot password specific logic
      if (isForgotPassword) {
        await axios.post(`${backendUrl}/api/users/forgot-password`, { email: user.email });
        toast.success("Password reset link sent to your email!");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
        return;
      }

      // Handle login and signup
      const { data } = await axios.post(`${backendUrl}${endpoint}`, user);
      localStorage.setItem("token", data.token);
      toast.success(`${buttonText} Successful!`);

      setTimeout(() => {
        navigate(redirectPath);
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Server error");
    } finally {
      setIsLoading(false);
      setUser({ name: "", email: "", password: "" });
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-sky-100 via-white to-blue-50 dark:from-zinc-900 dark:via-black dark:to-indigo-950 overflow-hidden px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" reverseOrder={false} />
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div animate={floatingAnimation.animate} className="absolute top-[15%] left-[15%] w-40 h-40 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl"></motion.div>
        <motion.div animate={{...floatingAnimation.animate, transition: {...floatingAnimation.animate.transition, delay: 0.5}}} className="absolute top-[40%] right-[10%] w-64 h-64 bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-3xl"></motion.div>
        <motion.div animate={{...floatingAnimation.animate, transition: {...floatingAnimation.animate.transition, delay: 1}}} className="absolute bottom-[10%] left-[20%] w-52 h-52 bg-indigo-400/10 dark:bg-indigo-600/10 rounded-full blur-3xl"></motion.div>
      </div>
      
      <div className="flex items-center justify-center w-full">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="w-full max-w-md relative z-10"
        >
          <motion.div 
            className="absolute inset-0 bg-white/20 dark:bg-zinc-900/20 backdrop-blur-lg -z-10 rounded-3xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          ></motion.div>
          
          <motion.form
            variants={staggerFormItems}
            className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md shadow-xl rounded-3xl border border-gray-100 dark:border-gray-700 p-8 sm:p-10 transition-all"
            onSubmit={handleSubmit}
          >
            <motion.div variants={fadeInUp} className="text-center mb-8">
              <div className="flex justify-center mb-2">
                <motion.div 
                  className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {isForgotPassword ? 
                    <FiMail className="w-8 h-8 text-blue-600 dark:text-blue-400" /> : 
                    showNameField ? 
                      <FiUser className="w-8 h-8 text-blue-600 dark:text-blue-400" /> : 
                      <FiLock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  }
                </motion.div>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-2 text-zinc-600 dark:text-zinc-300">
                  {subtitle}
                </p>
              )}
            </motion.div>

            <div className="space-y-5">
              {showNameField && (
                <motion.div 
                  variants={fadeInUp} 
                  className="relative"
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <div className="absolute left-3 top-3.5 text-gray-400">
                    <FiUser size={20} />
                  </div>
                  <TextInput
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={user.name}
                    onChange={handleChange}
                    className="pl-10 py-3.5"
                  />
                </motion.div>
              )}

              <motion.div 
                variants={fadeInUp} 
                className="relative"
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <div className="absolute left-3 top-3.5 text-gray-400">
                  <FiMail size={20} />
                </div>
                <TextInput
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={user.email}
                  onChange={handleChange}
                  className="pl-10 py-3.5"
                />
              </motion.div>

              {!isForgotPassword && (
                <motion.div 
                  variants={fadeInUp} 
                  className="relative"
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <div className="absolute left-3 top-3.5 text-gray-400">
                    <FiLock size={20} />
                  </div>
                  <TextInput
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={user.password}
                    onChange={handleChange}
                    showPassword={showPassword}
                    togglePassword={() => setShowPassword(!showPassword)}
                    className="pl-10 py-3.5"
                  />
                </motion.div>
              )}

              {!isForgotPassword && title.includes("Welcome") && (
                <motion.div variants={fadeInUp} className="text-right">
                  <NavLink
                    to="/forgot-password"
                    className="text-blue-600 dark:text-blue-400 text-sm hover:underline transition-colors"
                  >
                    Forgot Password?
                  </NavLink>
                </motion.div>
              )}

              <motion.button
                variants={fadeInUp}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
                className="custom-button w-full p-3.5 text-white font-medium rounded-lg transition-all duration-300 transform group"
                type="submit"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    {buttonText}
                    <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
                <span className="shine-effect"></span>
              </motion.button>

              <motion.div 
                variants={fadeInUp}
                className="text-center mt-6"
              >
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {altText}{" "}
                  <NavLink
                    to={altHref}
                    className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                  >
                    {altLink}
                  </NavLink>
                </p>
              </motion.div>
              
              <motion.div 
                variants={fadeInUp} 
                className="mt-8 flex items-center justify-center"
              >
                <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
                <p className="mx-4 text-sm text-gray-500 dark:text-gray-400 bg-white/80 dark:bg-zinc-800/80 px-2 rounded-full">or</p>
                <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
              </motion.div>
              
              <motion.div 
                variants={fadeInUp}
                className="mt-6 flex justify-center gap-4"
              >
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-full bg-white dark:bg-zinc-700 shadow-md flex items-center justify-center transition-all hover:shadow-lg"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                    <path fill="none" d="M1 1h22v22H1z" />
                  </svg>
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-full bg-white dark:bg-zinc-700 shadow-md flex items-center justify-center transition-all hover:shadow-lg"
                >
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      fill="#1877F2"
                      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.991 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.064 24 12.073z"
                    />
                  </svg>
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-full bg-white dark:bg-zinc-700 shadow-md flex items-center justify-center transition-all hover:shadow-lg"
                >
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      fill="#000000"
                      className="dark:fill-white"
                      d="M22.2125 5.65605C21.4491 5.99375 20.6395 6.21555 19.8106 6.31411C20.6839 5.79132 21.3374 4.9689 21.6493 4.00005C20.8287 4.48761 19.9305 4.83077 18.9938 5.01461C18.2031 4.17106 17.098 3.69303 15.9418 3.69434C13.6326 3.69434 11.7597 5.56661 11.7597 7.87683C11.7597 8.20458 11.7973 8.52242 11.8676 8.82909C8.39047 8.65404 5.31007 6.99005 3.24678 4.45941C2.87529 5.09767 2.68005 5.82318 2.68104 6.56167C2.68104 8.01259 3.4196 9.29324 4.54149 10.043C3.87737 10.022 3.22788 9.84264 2.64718 9.51997C2.64654 9.5373 2.64654 9.55464 2.64654 9.57496C2.64654 11.5999 4.08819 13.2937 6.00199 13.6823C5.64212 13.7785 5.27158 13.8263 4.90021 13.8247C4.62928 13.8247 4.36987 13.7991 4.11673 13.7543C4.64708 15.4179 6.18819 16.6228 8.0196 16.6553C6.53651 17.8022 4.70128 18.4744 2.82373 18.4703C2.49151 18.4676 2.15929 18.4488 1.82812 18.4139C3.74004 19.6353 5.96552 20.331 8.23842 20.3248C15.9316 20.3248 20.138 13.8868 20.138 8.36821C20.138 8.18774 20.1336 8.00727 20.1248 7.82886C20.9504 7.2309 21.6506 6.49884 22.2125 5.65605Z"
                    />
                  </svg>
                </motion.button>
              </motion.div>
            </div>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
};

AuthForm.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  buttonText: PropTypes.string.isRequired,
  endpoint: PropTypes.string.isRequired,
  redirectPath: PropTypes.string.isRequired,
  altText: PropTypes.string.isRequired,
  altLink: PropTypes.string.isRequired,
  altHref: PropTypes.string.isRequired,
  showNameField: PropTypes.bool,
  isForgotPassword: PropTypes.bool,
};

export default AuthForm;
