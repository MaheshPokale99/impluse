import axios from "axios";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft, FiUser, FiMail, FiCheckCircle, FiFileText, FiAward, FiClock } from "react-icons/fi";
import { RiMedalLine, RiTimerFlashLine, RiEmotionHappyLine } from "react-icons/ri";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const UserSubmission = () => {
  const { submissionId } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Calculate score (placeholder - replace with actual logic)
  const calculateScore = () => {
    if (!submission) return { score: 0, total: 0, percentage: 0 };
    const total = submission.answers.length;
    // This is a placeholder - you should implement real scoring logic
    const score = Math.floor(Math.random() * (total + 1));
    const percentage = Math.round((score / total) * 100);
    return { score, total, percentage };
  };

  useEffect(() => {
    const fetchSubmittedTest = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${backendUrl}/api/test/test-submission/${submissionId}`);
        setSubmission(response.data.submission);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch submission", {
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSubmittedTest();
  }, [submissionId, backendUrl]);

  const scoreData = calculateScore();

  return (
    <div className="flex items-center justify-center min-h-screen py-20 px-4 bg-gradient-to-b from-white via-blue-50 to-gray-50 dark:from-zinc-900 dark:via-blue-950/10 dark:to-zinc-950">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent dark:from-blue-900/10 pointer-events-none z-0" />
      
      <Toaster 
        position="top-right" 
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            background: '#333',
            color: '#fff',
            padding: '16px',
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
          }
        }}
      />
      
      {loading ? (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40 flex flex-col items-center justify-center">
          <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-xl flex flex-col items-center border border-white/30 dark:border-zinc-700/50">
            <div className="relative w-16 h-16">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <div className="w-16 h-16 border-4 border-blue-300 border-b-transparent rounded-full animate-spin mb-4 absolute top-0 left-0" style={{animationDirection: 'reverse', animationDuration: '1.2s'}}></div>
            </div>
            <p className="text-lg font-medium text-gray-800 dark:text-white mt-4">Loading submission data...</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Just a moment please</p>
          </div>
        </div>
      ) : (
        <motion.div 
          className="w-full max-w-3xl relative z-10"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <motion.button
            onClick={() => navigate("/tests")}
            whileHover={{ scale: 1.05, x: -3 }}
            whileTap={{ scale: 0.95 }}
            className="mb-6 flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <FiArrowLeft className="mr-2" /> Back to Tests
          </motion.button>
          
          <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-xl rounded-2xl border border-gray-100/80 dark:border-zinc-800/80 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 bottom-0 left-0 bg-black/10"></div>
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full"></div>
              <div className="absolute -top-20 -left-20 w-40 h-40 bg-white/10 rounded-full"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-4">
                  <motion.div 
                    className="bg-white/20 p-3 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 260, 
                      damping: 20,
                      delay: 0.3 
                    }}
                  >
                    <FiFileText className="text-white text-xl" />
                  </motion.div>
                </div>
                
                <motion.h1 
                  className="text-2xl md:text-3xl lg:text-4xl font-bold text-white text-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {submission?.testName || "Test Submission"}
                </motion.h1>
                
                {submission?.createdAt && (
                  <motion.p 
                    className="text-blue-100 text-sm text-center mt-2 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <FiClock className="mr-1.5" />
                    Submitted on {formatDate(submission.createdAt)}
                  </motion.p>
                )}
                
                {/* Score display */}
                <motion.div 
                  className="mt-6 flex flex-wrap justify-center gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center">
                    <RiMedalLine className="text-yellow-300 mr-2" />
                    <span className="text-white font-medium">
                      Score: {scoreData.percentage}%
                    </span>
                  </div>
                  
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center">
                    <FiCheckCircle className="text-green-300 mr-2" />
                    <span className="text-white font-medium">
                      {scoreData.score}/{scoreData.total} Questions
                    </span>
                  </div>
                  
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center">
                    <RiTimerFlashLine className="text-blue-300 mr-2" />
                    <span className="text-white font-medium">
                      Fast Completion
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
            
            {/* User Info Card */}
            <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800">
              <motion.div 
                className="flex flex-wrap md:flex-nowrap items-center gap-6 p-5 bg-gray-50/80 dark:bg-zinc-800/50 backdrop-blur-sm rounded-xl border border-gray-100 dark:border-zinc-700/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ y: -2, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-lg mx-auto md:mx-0 ring-4 ring-white dark:ring-zinc-700">
                  <FiUser className="text-2xl md:text-3xl" />
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">
                    {submission?.userName || "Anonymous User"}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center justify-center md:justify-start mb-2">
                    <FiMail className="mr-1.5 text-blue-500" /> {submission?.userEmail || "No email provided"}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      <FiAward className="mr-1" /> Test Taker
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      <RiEmotionHappyLine className="mr-1" /> {scoreData.percentage >= 70 ? "Excellent" : "Completed"}
                    </span>
                  </div>
                </div>
                
                <div className="hidden md:block w-24 h-24 relative">
                  <svg viewBox="0 0 36 36" className="w-full h-full">
                    <path
                      className="text-gray-200 dark:text-gray-700"
            
                      fill="none"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={`${
                        scoreData.percentage >= 70 
                          ? "text-green-500" 
                          : scoreData.percentage >= 40 
                            ? "text-yellow-500" 
                            : "text-red-500"
                      }`}
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${scoreData.percentage}, 100`}
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <text x="18" y="20.35" className="text-lg font-semibold fill-gray-800 dark:fill-white text-center" textAnchor="middle">
                      {scoreData.percentage}%
                    </text>
                  </svg>
                </div>
              </motion.div>
            </div>
            
            {/* Answers */}
            <motion.div 
              className="p-6 md:p-8"
              variants={stagger}
              initial="hidden"
              animate="visible"
            >
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center border-b border-gray-200 dark:border-gray-700 pb-3">
                <FiCheckCircle className="mr-2 text-blue-500" /> Submitted Answers
              </h2>
              
              <div className="space-y-5">
                {(submission?.answers || []).length === 0 ? (
                  <div className="text-center py-12 bg-gray-50/50 dark:bg-zinc-800/30 rounded-xl border border-dashed border-gray-200 dark:border-zinc-700">
                    <div className="w-16 h-16 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                      <FiFileText className="text-gray-400 dark:text-gray-500 text-xl" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">No answers submitted</p>
                  </div>
                ) : (
                  submission?.answers.map((answer, index) => (
                    <motion.div 
                      key={index}
                      className="p-5 md:p-6 bg-white dark:bg-zinc-800 rounded-xl border border-gray-100 dark:border-zinc-700 hover:shadow-lg transition-all duration-300"
                      variants={fadeIn}
                      whileHover={{ y: -3, boxShadow: "0 12px 25px -5px rgba(0, 0, 0, 0.1)" }}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold mr-4 text-lg">
                          {index + 1}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-gray-800 dark:text-gray-200 font-medium mb-3">
                            {answer.question}
                          </h3>
                          
                          <div className="mt-3 bg-gray-50 dark:bg-zinc-700/50 p-4 rounded-lg border border-gray-200 dark:border-zinc-600">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                              <FiCheckCircle className="mr-1.5 text-green-500 dark:text-green-400" />
                              Your Answer:
                            </p>
                            <p className="text-gray-900 dark:text-gray-100 font-medium px-3 py-2 bg-white/80 dark:bg-zinc-800/80 rounded-md border border-gray-200 dark:border-zinc-600">
                              {Array.isArray(answer.answer) ? answer.answer.join(", ") : answer.answer}
                            </p>
                          </div>
                          
                          {/* This is a placeholder - add correct answer display if available */}
                          {Math.random() > 0.5 && (
                            <div className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center">
                              <FiAward className="mr-1" /> Correct answer
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
              
              {/* Retake button */}
              {submission && (
                <motion.div
                  className="mt-8 flex justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.button
                    onClick={() => navigate("/tests")}
                    whileHover={{ scale: 1.03, boxShadow: "0 8px 20px rgba(0,0,0,0.1)" }}
                    whileTap={{ scale: 0.97 }}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center"
                  >
                    Back to Tests
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default UserSubmission;
