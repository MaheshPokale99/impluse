import { useState, memo } from "react";
import { motion } from "framer-motion";
import { FiMessageSquare, FiUser, FiChevronDown } from "react-icons/fi";
import PropTypes from "prop-types";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

export const ChatShow = ({ question: customQuestion }) => {
  const [expanded, setExpanded] = useState(false);

  const fullText ="Building a strong resume is crucial for making a positive impression on potential employers. Your resume should effectively showcase your skills, experiences, achievements, and qualifications in a clear and organized manner. Start with a compelling professional summary, highlight relevant experiences, quantify achievements, include key skills, and ensure it's error-free with consistent formatting. Tailor your resume for each application, keep it concise (1-2 pages), and include relevant education and certifications. Consider adding additional sections for projects, languages, or volunteer work if relevant.";

  const defaultQuestion = "How do I build a strong resume?";

  return (
    <div className="space-y-6">
      <ChatCard
        name="Sarvesh Pokale"
        time="2 days ago"
        question={customQuestion || defaultQuestion}
        answer={fullText}
        expanded={expanded}
        setExpanded={setExpanded}
      />
      
    </div>
  );
};

const ChatCard = memo(({ name, question, answer, expanded, setExpanded }) => {
  const isLongText = answer.length > 200;
  const displayedText = isLongText && !expanded ? answer.slice(0, 200) + "..." : answer;

  return (
    <motion.div
      variants={fadeInUp}
      className="sm:p-8 rounded-xl bg-white/80 dark:bg-zinc-800/70 shadow-lg sm:border border-gray-100/80 dark:border-zinc-700/80 hover:shadow-2xl transition-all duration-300 backdrop-blur-sm"
      style={{ transformStyle: "preserve-3d" }}
      whileHover={{ y: -5, transition: { duration: 0.3 } }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <motion.div 
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            style={{ transform: "translateZ(10px)" }}
          >
            <FiUser className="w-6 h-6" />
          </motion.div>
          <div>
            <h3 className="font-bold text-zinc-800 dark:text-gray-100 flex items-center text-lg">
              {name}
            </h3>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-start gap-4 mt-5" style={{ transformStyle: "preserve-3d" }}>
        <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/30 dark:to-indigo-900/30 
          p-4 rounded-xl flex items-start gap-3 w-full border border-blue-100/50 dark:border-blue-800/30 shadow-sm"
          style={{ transform: "translateZ(5px)" }}
        >
          <FiMessageSquare className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0 w-5 h-5" />
          <p className="font-medium text-zinc-900 dark:text-white text-lg">
            {question}
          </p>
        </div>

        <motion.div 
          className="bg-gradient-to-br from-gray-50/80 to-white/80 dark:from-zinc-800/50 dark:to-zinc-900/50 
            p-5 rounded-xl w-full border border-gray-100/70 dark:border-zinc-700/50 shadow-md"
          style={{ transform: "translateZ(10px)" }}
          whileHover={{ boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)" }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-zinc-700 dark:text-gray-200 text-base leading-relaxed">
              {displayedText}
            </p>
          </motion.div>
          
          {isLongText && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="mt-4 text-blue-600 dark:text-blue-400 font-medium hover:text-indigo-600 dark:hover:text-indigo-400 
                flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-50/50 dark:bg-blue-900/20 transition-colors
                border border-blue-100/50 dark:border-blue-800/30"
              onClick={() => setExpanded(!expanded)}
              style={{ transform: "translateZ(15px)" }}
            >
              {expanded ? (
                <>
                  <FiChevronDown className="ml-1 transform rotate-180" /> See Less
                </>
              ) : (
                <>
                  <FiChevronDown className="ml-1" /> See More
                </>
              )}
            </motion.button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
});

ChatCard.displayName = "ChatCard";

ChatCard.propTypes = {
  name: PropTypes.string.isRequired,
  time: PropTypes.string.isRequired,
  question: PropTypes.string.isRequired,
  answer: PropTypes.string.isRequired,
  expanded: PropTypes.bool.isRequired,
  setExpanded: PropTypes.func.isRequired
};

ChatShow.propTypes = {
  question: PropTypes.string
};

ChatShow.defaultProps = {
  question: undefined
};

export default ChatShow;
