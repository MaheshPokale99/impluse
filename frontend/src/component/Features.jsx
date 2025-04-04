import { ThemeContext } from "../context/ThemeContext";
import styled from "styled-components";
import PropTypes from "prop-types";
import { HiOutlineVideoCamera } from "react-icons/hi";
import { CiMail } from "react-icons/ci";
import { MdOutlineTask } from "react-icons/md";
import { FaRegClock } from "react-icons/fa6";
import { IoRocketOutline } from "react-icons/io5";
import { BsFileEarmarkMedical } from "react-icons/bs";
import { useContext } from "react";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    }
  }
};

const Features = () => {
  return (
    <div className="w-full max-w-8xl px-6 md:px-8 py-12 md:py-20">
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="flex w-full flex-col items-center gap-4"
      >
        <motion.span
          variants={fadeIn}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 
            p-3 rounded-full text-xs md:text-sm font-medium text-blue-600 dark:text-blue-400 mb-2"
        >
          Personalized Support
        </motion.span>
        
        <motion.h1 
          variants={fadeIn}
          className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent font-bold text-3xl sm:text-4xl md:text-5xl text-center max-w-3xl"
        >
          No Need to Struggle Alone Anymore
        </motion.h1>
        
        <motion.p 
          variants={fadeIn}
          className="text-gray-600 dark:text-gray-300 text-lg text-center max-w-2xl mt-2"
        >
          Long-term mentorship that covers everything you need to succeed
        </motion.p>
      </motion.div>

      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {[
          { 
            icon: <HiOutlineVideoCamera />, 
            heading: "1:1 Live Sessions", 
            para: "Never question your progress with frequent One-on-One sessions with expert mentors."
          },
          { 
            icon: <CiMail />, 
            heading: "Unlimited Messaging", 
            para: "Have a doubt? Get the right advice from your mentor via chat anytime you need it."
          },
          { 
            icon: <MdOutlineTask />, 
            heading: "Curated Resources", 
            para: "Access to handpicked learning materials and tasks tailored to your specific goals."
          },
          { 
            icon: <FaRegClock />, 
            heading: "Regular Follow-ups", 
            para: "Stay motivated and consistent with regular check-ins and progress tracking."
          },
          { 
            icon: <IoRocketOutline />, 
            heading: "Job Referrals", 
            para: "Get referrals from our mentor community to top companies in your industry."
          },
          { 
            icon: <BsFileEarmarkMedical />, 
            heading: "Certification", 
            para: "Receive a recognized certification upon completion of your mentorship program."
          },
        ].map((item, index) => (
          <motion.div 
            key={index} 
            variants={fadeIn}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
          >
            <Card {...item} index={index} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

const Card = ({ heading, para, icon, index }) => {
  const { theme } = useContext(ThemeContext);
  
  // Generate different gradient colors for each card
  const gradients = [
    { light: "from-blue-500 to-indigo-500", dark: "from-blue-600 to-indigo-600" },
    { light: "from-purple-500 to-pink-500", dark: "from-purple-600 to-pink-600" },
    { light: "from-emerald-500 to-teal-500", dark: "from-emerald-600 to-teal-600" },
    { light: "from-orange-500 to-amber-500", dark: "from-orange-600 to-amber-600" },
    { light: "from-rose-500 to-red-500", dark: "from-rose-600 to-red-600" },
    { light: "from-cyan-500 to-blue-500", dark: "from-cyan-600 to-blue-600" },
  ];
  
  const gradientClass = theme === "dark" 
    ? gradients[index % gradients.length].dark 
    : gradients[index % gradients.length].light;
  
  return (
    <StyledWrapper theme={theme} gradientClass={gradientClass}>
      <div
        className={`feature-card w-full p-8 rounded-2xl transition-all duration-300
          ${theme === "dark" ? "bg-zinc-800/80" : "bg-white"}
          backdrop-blur-sm border border-gray-100 dark:border-gray-700
          hover:shadow-xl`}
      >
        <div className="relative z-20 h-full flex flex-col">
          <div className="mb-6">
            <div className={`icon-container w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br ${gradientClass}`}>
              <span className="text-2xl text-white">{icon}</span>
            </div>
          </div>
          
          <h3 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-3">{heading}</h3>
          <p className="text-gray-600 dark:text-gray-300 text-base flex-grow">{para}</p>
          
          <div className="mt-6 flex items-center">
            <div className="h-px w-12 bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-700"></div>
            <span className={`text-xs font-medium ml-2 bg-gradient-to-r ${gradientClass} bg-clip-text text-transparent`}>Learn More</span>
          </div>
        </div>
        
        <div className="card-blob" />
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .feature-card {
    position: relative;
    overflow: hidden;
    height: 100%;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
  }

  .card-blob {
    position: absolute;
    z-index: 1;
    top: 75%;
    right: -15%;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    opacity: 0.1;
    filter: blur(30px);
    transition: all 0.5s ease;
  }

  .feature-card:hover .card-blob {
    transform: scale(1.3) translate(-10%, -10%);
    opacity: 0.2;
  }

  .icon-container {
    transition: all 0.3s ease;
  }

  .feature-card:hover .icon-container {
    transform: scale(1.1);
  }
`;

Card.propTypes = {
  icon: PropTypes.node.isRequired,
  para: PropTypes.string.isRequired,
  heading: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
};

export default Features;