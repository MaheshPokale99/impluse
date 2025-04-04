import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { FiLock, FiCheckCircle, FiArrowRight } from "react-icons/fi";
import TextInput from "../component/TextInput";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
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

const pulseAnimation = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity
    }
  }
};

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleReset = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(`${backendUrl}/api/users/reset-password`, {
        password,
        token,
      });
      
      setIsSuccess(true);
      toast.success("Password has been reset successfully!");
      
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid or expired token");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-100 via-white to-blue-50 dark:from-zinc-900 dark:via-black dark:to-indigo-950 overflow-hidden px-4">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <motion.div animate={floatingAnimation.animate} className="absolute top-[15%] left-[15%] w-40 h-40 bg-green-400/10 dark:bg-green-600/10 rounded-full blur-3xl"></motion.div>
          <motion.div animate={{...floatingAnimation.animate, transition: {...floatingAnimation.animate.transition, delay: 0.5}}} className="absolute top-[40%] right-[10%] w-64 h-64 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl"></motion.div>
        </div>
        
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md shadow-xl rounded-3xl border border-gray-100 dark:border-gray-700 p-8 sm:p-10 w-full max-w-md relative z-10"
        >
          <motion.div 
            initial={{ scale: 0, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
            className="absolute -top-16 left-1/2 -translate-x-1/2"
          >
            <motion.div 
              className="w-32 h-32 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center"
              animate={pulseAnimation.animate}
            >
              <FiCheckCircle className="w-16 h-16 text-white" />
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="text-center mt-14"
            variants={staggerChildren}
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent mb-2"
            >
              Password Reset Successful!
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-zinc-600 dark:text-zinc-300 mb-8"
            >
              Your password has been updated successfully. You will be redirected to the login page in a few seconds.
            </motion.p>
            <motion.button
              variants={fadeInUp}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/login")}
              className="custom-button w-full p-3.5 text-white font-medium rounded-lg transition-all duration-300 group"
            >
              <span className="flex items-center justify-center">
                Go to Login
                <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
              <span className="shine-effect"></span>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-100 via-white to-blue-50 dark:from-zinc-900 dark:via-black dark:to-indigo-950 overflow-hidden px-4">
      <Toaster position="top-right" reverseOrder={false} />
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div animate={floatingAnimation.animate} className="absolute top-[15%] left-[15%] w-40 h-40 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl"></motion.div>
        <motion.div animate={{...floatingAnimation.animate, transition: {...floatingAnimation.animate.transition, delay: 0.5}}} className="absolute top-[40%] right-[10%] w-64 h-64 bg-indigo-400/10 dark:bg-indigo-600/10 rounded-full blur-3xl"></motion.div>
        <motion.div animate={{...floatingAnimation.animate, transition: {...floatingAnimation.animate.transition, delay: 1}}} className="absolute bottom-[10%] left-[20%] w-52 h-52 bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-3xl"></motion.div>
      </div>
      
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
          onSubmit={handleReset}
          className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md shadow-xl rounded-3xl border border-gray-100 dark:border-gray-700 p-8 sm:p-10 transition-all"
          variants={staggerChildren}
        >
          <motion.div variants={fadeInUp} className="text-center mb-8">
            <div className="flex justify-center mb-2">
              <motion.div 
                className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <FiLock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </motion.div>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              Reset Password
            </h2>
            <p className="mt-2 text-zinc-600 dark:text-zinc-300">
              Enter your new password below
            </p>
          </motion.div>

          <div className="space-y-6">
            <motion.div 
              variants={fadeInUp} 
              className="relative"
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="absolute left-3 top-3.5 text-gray-400">
                <FiLock size={18} />
              </div>
              <TextInput
                type="password"
                name="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                showPassword={showPassword}
                togglePassword={() => setShowPassword(!showPassword)}
                className="pl-10 py-3.5"
              />
            </motion.div>

            <motion.div 
              variants={fadeInUp}
              className="relative"
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="absolute left-3 top-3.5 text-gray-400">
                <FiLock size={18} />
              </div>
              <TextInput
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                showPassword={showConfirmPassword}
                togglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                className="pl-10 py-3.5"
              />
            </motion.div>

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
                  Reset Password
                  <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
              <span className="shine-effect"></span>
            </motion.button>
            
            <motion.div 
              variants={fadeInUp}
              className="mt-4 text-center"
            >
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Remember your password?{" "}
                <motion.a
                  href="/login"
                  className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                  whileHover={{ scale: 1.05 }}
                >
                  Login
                </motion.a>
              </p>
            </motion.div>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default ResetPassword; 