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
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const HomePage = () => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-sky-100 to-white dark:from-zinc-900 dark:to-black">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="w-full px-6 sm:px-12 py-16 flex flex-col items-center text-center"
      >
        <div className="mt-20 md:mt-36 space-y-4">
          <h1 className="text-black dark:text-white font-bold text-3xl sm:text-4xl md:text-6xl leading-tight">
            Supercharge Your Career with
          </h1>
          <h1 className="text-blue-600 dark:text-blue-400 font-bold text-3xl sm:text-4xl md:text-6xl">
            Long-Term Mentorship
          </h1>
          <p className="text-slate-600 dark:text-zinc-400 text-lg sm:text-xl max-w-2xl mx-auto">
            Helping students turn dreams into reality because the right guidance makes all the difference.
          </p>

          <div className="flex flex-col md:flex-row gap-4 mt-10 items-center justify-center">
            <button className="custom-button-light w-[90%] md:w-[35%] h-14">
              Start Now
              <span className="shine-effect"></span>
            </button>
            <button className="custom-button w-[90%] md:w-[35%] h-14">
              <span>Find your Mentor</span>
              <FaArrowRightLong className="ml-2 mt-1" />
              <span className="shine-effect"></span>
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-10 px-6 sm:px-12 w-full max-w-7xl mx-auto"
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


      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        className="w-full md:w-[90%] mx-auto mt-12"
      >
        <Features />
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        className="w-full md:w-[90%] mx-auto mt-12"
      >
        <Work/>
      </motion.div>

      {/* Query Section */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        className="w-full md:w-[90%] mx-auto mt-12 rounded-[32px] border border-gray-300 bg-white/80 dark:bg-zinc-800 shadow-lg p-8 backdrop-blur-md"
      >
        <QuerySection />
      </motion.div>
    </div>
  );
};

const FeatureItem = ({ icon, text }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="flex items-center gap-3 p-1 bg-white dark:bg-zinc-800 shadow-md rounded-lg transition-all duration-300"
  >
    <div className="w-10 h-10 flex justify-center items-center">{icon}</div>
    <span className="text-gray-700 dark:text-gray-300 text-base lg:text-lg">{text}</span>
  </motion.div>
);

FeatureItem.propTypes = {
  icon: PropTypes.node.isRequired,
  text: PropTypes.string.isRequired,
};

export default HomePage;
