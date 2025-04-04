import { FaArrowRightLong } from "react-icons/fa6";
import { RiLightbulbFlashLine } from "react-icons/ri";
import { LiaGripfire } from "react-icons/lia";
import { IoIosFlash } from "react-icons/io";
import QuerySection from "../component/QuerySection";
import PropTypes from "prop-types";
import Features from "../component/Features";
import { motion } from "framer-motion";
import Work from "../component/Work";

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

const HomePage = () => {


  return (
    <div className="relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-24 w-72 h-72 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-60 -right-24 w-96 h-96 bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-400/10 dark:bg-indigo-600/10 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="relative z-10"
      >
        {/* Hero Section */}
        <div className="w-full px-6 sm:px-12 py-16 flex flex-col items-center text-center mx-auto">
          <div className="mt-14 md:mt-24 space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="mx-auto bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 
                p-3 rounded-full w-fit mb-6"
            >
              <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent text-sm md:text-base font-medium px-4">
                Transform Your Career Path
              </span>
            </motion.div>

            <h1 className="text-black dark:text-white font-bold text-4xl sm:text-5xl md:text-7xl leading-tight">
              Supercharge Your Career with
            </h1>
            <div className="relative">
              <h1 className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent font-bold text-4xl sm:text-5xl md:text-7xl">
                Long-Term Mentorship
              </h1>
              <svg className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-48 md:w-64 h-6 text-blue-500/30 dark:text-blue-400/20" viewBox="0 0 200 12" fill="currentColor">
                <path d="M6.68795 11.7806C26.9121 6.98469 72.8549 1.99993 97.1992 1.99994C121.544 1.99994 174.05 6.70895 194.714 11.7806" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-zinc-600 dark:text-zinc-400 text-lg sm:text-xl max-w-2xl mx-auto mt-4"
            >
              Helping students turn dreams into reality because the right guidance makes all the difference.
            </motion.p>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="flex flex-col md:flex-row gap-6 mt-12 items-center justify-center"
            >
              <motion.button 
                variants={fadeIn}
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                className="custom-button-light w-[90%] md:w-[35%] h-14 group border border-blue-100 dark:border-blue-800/30"
              >
                <span className="text-zinc-800 dark:text-zinc-100 relative z-10 flex items-center">
                  Start Now
                  <IoIosFlash className="ml-2 text-blue-600 dark:text-blue-400" />
                </span>
                <span className="shine-effect"></span>
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-100/60 to-indigo-100/60 dark:from-blue-900/20 dark:to-indigo-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              </motion.button>
              
              <motion.button 
                variants={fadeIn}
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                className="custom-button w-[90%] md:w-[35%] h-14 flex items-center justify-center group"
              >
                <span className="relative z-10 flex items-center">
                  Find your Mentor
                  <FaArrowRightLong className="ml-2 transform transition-transform duration-300 group-hover:translate-x-1" />
                </span>
                <span className="shine-effect"></span>
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-600/10 to-blue-600/10 dark:from-indigo-600/20 dark:to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              </motion.button>
            </motion.div>
          </div>
        </div>

        {/* Features Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-16 px-6 sm:px-12 w-full max-w-7xl mx-auto"
        >
          <FeatureItem
            icon={<RiLightbulbFlashLine className="text-[#FFD700] text-3xl" />}
            text="Unlock Your Potential with Mentorship"
          />
          <FeatureItem
            icon={<LiaGripfire className="text-[#FF5733] text-3xl" />}
            text="Fuel Your Dreams with the Right Mentors"
          />
          <FeatureItem
            icon={<IoIosFlash className="text-[#007BFF] text-3xl" />}
            text="Empowering Students, Transforming Careers"
          />
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="w-full md:w-[90%] mx-auto mt-24"
        >
          <Features />
        </motion.div>

        {/* Work Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="w-full md:w-[90%] mx-auto mt-24"
        >
          <Work />
        </motion.div>

        {/* Query Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          className="w-full md:w-[90%] mx-auto my-24 rounded-3xl border border-gray-200 dark:border-gray-800 
            bg-white/5 dark:bg-zinc-900/20 shadow-xl p-1 md:p-8 backdrop-blur-lg"
        >
          <QuerySection />
        </motion.div>
      </motion.div>
    </div>
  );
};

const FeatureItem = ({ icon, text }) => (
  <motion.div
    whileHover={{ scale: 1.05, y: -5 }}
    transition={{ duration: 0.2 }}
    className="card flex items-center gap-3 p-4 bg-white dark:bg-zinc-800/80 shadow-lg rounded-xl border border-gray-100 dark:border-gray-700"
  >
    <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex justify-center items-center shadow-inner">{icon}</div>
    <span className="text-gray-700 dark:text-gray-200 text-base lg:text-lg font-medium">{text}</span>
  </motion.div>
);

FeatureItem.propTypes = {
  icon: PropTypes.node.isRequired,
  text: PropTypes.string.isRequired,
};

export default HomePage;
