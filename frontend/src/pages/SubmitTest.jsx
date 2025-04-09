import axios from "axios";
import { useContext, useState, useEffect, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { FiArrowLeft, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { RiTimerFlashLine, RiMedalLine, RiQuestionMark } from "react-icons/ri";
import confetti from 'canvas-confetti';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const SubmitTest = () => {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [remainingTime, setRemainingTime] = useState(null);
  const [timeWarning, setTimeWarning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const location = useLocation();
  const selectedTest = location.state?.testData;

  useEffect(() => {
    if (!selectedTest) {
      toast.error("No test selected. Please choose a test first.");
      navigate("/tests");
    }
  }, [selectedTest, navigate]);

  useEffect(() => {
    if (selectedTest) {
      const timeLimit = selectedTest.timeLimit || 30 * 60; 
      setRemainingTime(timeLimit);
      updateProgress();
    }
  }, [selectedTest]);
  
  // Update progress calculation
  const updateProgress = useCallback(() => {
    if (!selectedTest?.questions || !selectedTest.questions.length) return;
    
    const totalQuestions = selectedTest.questions.length;
    const answeredQuestions = Object.keys(selectedAnswers).length;
    const percent = Math.round((answeredQuestions / totalQuestions) * 100);
    setProgress(percent);
    
    if (percent === 100 && answeredQuestions === totalQuestions) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        console.log("Confetti effect failed to run");
      }
    }
  }, [selectedAnswers, selectedTest]);
  
  useEffect(() => {
    updateProgress();
  }, [selectedAnswers, updateProgress]);
  
  useEffect(() => {
    if (remainingTime === null) return;
    
    const timer = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          toast.error("Time's up! Submitting your test...");
          handleSubmit();
          return 0;
        }
        
        if (prev === 300) {
          setTimeWarning(true);
          toast.error("5 minutes remaining!", {
            icon: <FiAlertCircle />,
            style: {
              borderRadius: '10px',
              background: '#333',
              color: '#fff',
            }
          });
        }
        
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [remainingTime]);

  const formatTime = (seconds) => {
    if (seconds === null) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (remainingTime === null) return "text-white";
    if (remainingTime < 300) return "text-red-400"; 
    if (remainingTime < 600) return "text-yellow-400";
    return "text-white";
  };

  // Submit test
  const handleSubmit = async () => {
    if (submitting) return; 
    
    try {
      setLoading(true);
      setSubmitting(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        toast.error("You need to be logged in to submit a test");
        navigate("/login");
        return;
      }

      if (!selectedTest) {
        toast.error("Test data not found");
        navigate("/tests");
        return;
      }

      if (Object.keys(selectedAnswers).length === 0) {
        toast.error("Please answer at least one question before submitting", {
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
        setLoading(false);
        setSubmitting(false);
        return;
      }

      // Format answers for submission
      const answers = selectedTest.questions.map((question) => ({
        question: question.question,
        answer: selectedAnswers[question._id] 
          ? (Array.isArray(selectedAnswers[question._id])
              ? selectedAnswers[question._id]
              : [selectedAnswers[question._id]])
          : ["Not Answered"]
      }));

      const payload = {
        testName: selectedTest.title,
        answers
      };

      const response = await axios.post(`${backendUrl}/api/test/submit`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      toast.success(response.data.message || "Test submitted successfully!", { 
        duration: 3000,
        icon: '🎉',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        }
      });
      
      try {
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.6 }
        });
      } catch (e) {
        console.log("Confetti effect failed to run");
      }
      
      setSelectedAnswers({});
      
      if (response.data?.submissionId) {
        navigate(`/test-submission/${response.data.submissionId}`);
      } else {
        navigate("/tests");
      }
    } catch (error) {
      console.error("Error submitting test:", error);
      toast.error(error.response?.data?.message || "Failed to submit test.", {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        }
      });
      setSubmitting(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle selecting answers
  const handleOptionChange = (questionId, selectedOption) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: selectedOption,
    }));
  };

  const handleBackButton = () => {
    if (Object.keys(selectedAnswers).length > 0) {
      const confirmed = window.confirm("Are you sure you want to leave? Your progress will be lost.");
      if (confirmed) {
        navigate("/tests");
      }
    } else {
      navigate("/tests");
    }
  };

  if (!selectedTest) {
    return null; 
  }

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
          <div className="bg-white dark:bg-zinc-800 p-8 rounded-xl shadow-xl flex flex-col items-center max-w-md w-full border border-white/30 dark:border-zinc-700/50">
            <div className="relative w-16 h-16">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <div className="w-16 h-16 border-4 border-blue-300 border-b-transparent rounded-full animate-spin mb-4 absolute top-0 left-0" style={{animationDirection: 'reverse', animationDuration: '1.2s'}}></div>
            </div>
            <p className="text-xl font-medium text-gray-800 dark:text-white mt-4 mb-2">Submitting Your Test</p>
            <p className="text-gray-500 dark:text-gray-400 text-center">
              Please wait while we process your answers, {user?.name?.split(" ")[0] || ""}
            </p>
            <div className="mt-6 w-full bg-gray-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ 
                  width: "100%",
                  transition: { duration: 2.5, ease: "easeInOut" } 
                }}
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
              />
            </div>
          </div>
        </div>
      ) : (
        <motion.div 
          className="relative max-w-4xl w-full mx-auto bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-xl rounded-2xl border border-gray-100/80 dark:border-zinc-800/80 overflow-hidden"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          {/* Header with Timer and Progress */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 bottom-0 left-0 bg-black/10"></div>
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full"></div>
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-white/10 rounded-full"></div>
            
            <div className="flex justify-between items-center relative z-10">
              <motion.button
                whileHover={{ scale: 1.05, x: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBackButton}
                className="p-2.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all flex items-center"
              >
                <FiArrowLeft className="mr-1.5" /> Back
              </motion.button>
              
              <div className="flex items-center space-x-4">
                <motion.div 
                  className={`flex items-center bg-white/20 px-4 py-2 rounded-lg ${timeWarning ? 'animate-pulse' : ''}`}
                  whileHover={{ scale: 1.05 }}
                >
                  <RiTimerFlashLine className={`${getTimeColor()} mr-2 text-lg`} />
                  <span className={`${getTimeColor()} font-medium`}>
                    {formatTime(remainingTime)}
                  </span>
                </motion.div>
                
                <div className="hidden md:flex items-center bg-white/20 px-4 py-2 rounded-lg">
                  <RiMedalLine className="text-white mr-2 text-lg" />
                  <span className="text-white font-medium">
                    {progress}% Complete
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex flex-col items-center relative z-10">
              <h1 className="text-2xl md:text-4xl font-bold text-white text-center mb-3">
                {selectedTest?.title}
              </h1>
              <p className="text-blue-100 text-sm md:text-base text-center max-w-2xl">
                {selectedTest?.description || "Please answer all questions to the best of your knowledge."}
              </p>
              
              <div className="w-full max-w-md mt-6 bg-white/20 rounded-full h-2.5 overflow-hidden">
                <motion.div 
                  className="h-full bg-white"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
          
          {/* Questions */}
          <motion.div
            className="p-6 md:p-8"
            variants={stagger}
          >
            {selectedTest?.questions?.map((q, qIdx) => (
              <motion.div
                key={q._id}
                className="mb-8 bg-white dark:bg-zinc-800 rounded-xl shadow-md hover:shadow-lg border border-gray-100 dark:border-zinc-700 overflow-hidden transition-all duration-300"
                variants={fadeIn}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: qIdx * 0.1 }}
                whileHover={{ y: -2 }}
              >
                <div className="p-6 border-b border-gray-100 dark:border-zinc-700 bg-gray-50/80 dark:bg-zinc-800/80 backdrop-blur-sm">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 w-10 h-10 rounded-full flex items-center justify-center mr-3 font-bold text-lg">
                      {qIdx + 1}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      {q.question}
                    </h3>
                  </div>
                  
                  <div className="ml-11 mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                    {selectedAnswers[q._id] ? (
                      <span className="flex items-center text-green-500 dark:text-green-400 px-2 py-0.5 bg-green-50 dark:bg-green-900/20 rounded-full">
                        <FiCheckCircle className="mr-1" /> Answered
                      </span>
                    ) : (
                      <span className="flex items-center px-2 py-0.5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-full">
                        <RiQuestionMark className="mr-1" /> Not answered yet
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-3">
                    {q.options?.map((option, optIdx) => (
                      <motion.label
                        key={optIdx}
                        className={`flex items-center p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                          selectedAnswers[q._id] === option
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                            : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 bg-white dark:bg-zinc-800/80'
                        }`}
                        whileHover={{ scale: 1.01, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                          selectedAnswers[q._id] === option 
                            ? 'border-blue-500 bg-blue-500' 
                            : 'border-gray-300 dark:border-zinc-600'
                        }`}>
                          {selectedAnswers[q._id] === option && (
                            <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", bounce: 0.5 }}
                              className="w-2.5 h-2.5 bg-white rounded-full" 
                            />
                          )}
                        </div>
                        
                        <input
                          type="radio"
                          name={`question-${q._id}`}
                          value={option}
                          checked={selectedAnswers[q._id] === option}
                          onChange={() => handleOptionChange(q._id, option)}
                          className="sr-only"
                        />
                        
                        <span className={`text-base ${
                          selectedAnswers[q._id] === option
                            ? 'font-medium text-blue-700 dark:text-blue-300'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {option}
                        </span>
                      </motion.label>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
            
            <motion.div 
              className="flex justify-between items-center mt-10"
              variants={fadeIn}
            >
              <div className="bg-gray-50/80 dark:bg-zinc-800/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-100 dark:border-zinc-700/50">
                <div className="h-3 w-36 sm:w-48 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{progress}%</span> completed
                </p>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 8px 20px rgba(0,0,0,0.1)" }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                disabled={submitting}
                className={`px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center ${
                  progress === 100 ? 'animate-pulse' : ''
                } ${submitting ? 'opacity-80 cursor-not-allowed' : ''}`}
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>Submit Test</>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default SubmitTest;
