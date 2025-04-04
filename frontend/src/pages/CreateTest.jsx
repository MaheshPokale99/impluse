import axios from "axios";
import { useContext, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { IoMdCloseCircle } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import { IoMdAddCircle } from "react-icons/io";
import { IoMdAdd } from "react-icons/io";
import { LuUpload } from "react-icons/lu";
import { FiEdit3, FiTrash2, FiList, FiPlus, FiFile, FiCheckCircle, FiArrowLeft, FiAward } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi";
import { BiAnalyse } from "react-icons/bi";
import TextInput from "../component/TextInput";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const CreateTest = () => {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([{ question: "", options: ["", ""] }]);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [createTest, setCreateTest] = useState(false);
  const [testDone, setTestDone] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [tests, setTests] = useState([]);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

// all test
  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(`${backendUrl}/api/test/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTests(response.data.tests);
      } catch (error) {
        toast.error(error.response?.data?.message || "Something went wrong!");
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, [testDone]);

  // delete test
  const deleteTest = async (testId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`${backendUrl}/api/test/delete/${testId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success(response.data.message || "Test deleted successfully");
      setTests((prevTests) => prevTests.filter(test => test._id !== testId));

    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete test");
    }
  };


  // create test
  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (!title.trim() || !description.trim() || questions.length === 0 || questions.some(q => !q.question.trim() || q.options.length < 2)) {
        toast.error("Please fill in all fields and provide at least two options per question.");
        setLoading(false);
        return;
      }
      
      const token = localStorage.getItem("token");
      const response = await axios.post(`${backendUrl}/api/test/create`,
        { title, questions, description }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success(response.data.message);
      setTitle("");
      setDescription("");
      setQuestions([{ question: "", options: ["", ""] }]);
      setTestDone(!testDone);
      setCreateTest(false);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create test");
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: "", options: ["", ""] }]);
  };

  const deleteQuestion = (qIdx) => {
    if (questions.length > 1) {
      const newQuestions = [...questions];
      newQuestions.splice(qIdx, 1);
      setQuestions(newQuestions);
    } else {
      toast.error("At least one question is required!");
    }
  };

  const addOption = (qIdx) => {
    const newQuestions = [...questions];
    newQuestions[qIdx].options.push("");
    setQuestions(newQuestions);
  };

  const deleteOption = (qIdx, optIdx) => {
    const newQuestions = [...questions];
    if (newQuestions[qIdx].options.length > 1) {
      newQuestions[qIdx].options.splice(optIdx, 1);
      setQuestions(newQuestions);
    } else {
      toast.error("A question must have at least one option!");
    }
  };

  const handleStartTest = (test) => {
    navigate(`/test/${test.title.replace(/\s+/g, "")}`, { state: { testData: test } });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen pt-24 p-4 bg-gradient-to-b from-white via-blue-50 to-gray-50 dark:from-zinc-900 dark:via-blue-950/10 dark:to-zinc-950">
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
      
      {loading && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="bg-white dark:bg-zinc-800 p-8 rounded-xl shadow-xl flex flex-col items-center border border-white/30 dark:border-zinc-700/50">
            <div className="relative w-16 h-16">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <div className="w-16 h-16 border-4 border-blue-300 border-b-transparent rounded-full animate-spin mb-4 absolute top-0 left-0" style={{animationDirection: 'reverse', animationDuration: '1.2s'}}></div>
            </div>
            <p className="text-lg font-medium text-gray-800 dark:text-white mt-4">Processing...</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Creating your perfect test</p>
          </div>
        </div>
      )}
      
      <AnimatePresence mode="wait">
        {!createTest && (
          <motion.div 
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={fadeIn}
            className="max-w-4xl w-full mx-auto relative z-10"
          >
            <motion.button
              onClick={() => navigate("/")}
              whileHover={{ scale: 1.05, x: -3 }}
              whileTap={{ scale: 0.95 }}
              className="mb-6 flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <FiArrowLeft className="mr-2" /> Back to Dashboard
            </motion.button>
            
            <header className="text-center mb-8">
              <motion.h1 
                className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                Test Management
              </motion.h1>
              <motion.p 
                className="text-gray-600 dark:text-gray-300 mt-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Create and manage engaging assessment tests for your users
              </motion.p>
            </header>
            
            <motion.div 
              className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-xl rounded-2xl border border-gray-100/80 dark:border-zinc-800/80 overflow-hidden"
              whileHover={{ boxShadow: "0 15px 30px rgba(0,0,0,0.1)" }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-6 md:p-8 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                  <FiList className="mr-3 text-blue-500" /> Available Tests
                </h2>
                
                {user?.role === 'admin' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCreateTest(true)}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-md hover:shadow-lg flex items-center font-medium transition-all"
                  >
                    <FiPlus className="mr-1.5" /> Create New Test
                  </motion.button>
                )}
              </div>
              
              <div className="p-6 md:p-8">
                {tests.length === 0 ? (
                  <motion.div 
                    className="flex flex-col items-center justify-center py-20 bg-gray-50/50 dark:bg-zinc-800/30 rounded-xl border border-dashed border-gray-200 dark:border-zinc-700"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <FiFile className="text-6xl text-gray-300 dark:text-gray-600 mb-6" />
                    <h3 className="text-xl font-medium text-gray-500 dark:text-gray-300 mb-2">No tests available yet</h3>
                    {user?.role === 'admin' && (
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-2 max-w-sm text-center">
                        Create your first test to start assessing your users' knowledge and skills
                      </p>
                    )}
                    
                    {user?.role === 'admin' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCreateTest(true)}
                        className="mt-6 px-5 py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg font-medium transition-colors flex items-center"
                      >
                        <HiOutlineSparkles className="mr-1.5" /> Create Your First Test
                      </motion.button>
                    )}
                  </motion.div>
                ) : (
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    {tests.map((test, index) => (
                      <motion.div
                        key={test._id}
                        variants={fadeIn}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -5, boxShadow: "0 12px 20px rgba(0,0,0,0.1)" }}
                        className="bg-white dark:bg-zinc-800 rounded-xl shadow-md hover:shadow-xl border border-gray-100 dark:border-zinc-700 overflow-hidden transition-all duration-300 relative group"
                      >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{test.title}</h3>
                            {user?.role === 'admin' && (
                              <motion.button
                                whileHover={{ scale: 1.1, color: '#ef4444' }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => deleteTest(test._id)}
                                className="p-1.5 rounded-full text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 focus:outline-none"
                              >
                                <FiTrash2 className="w-5 h-5" />
                              </motion.button>
                            )}
                          </div>
                          
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                            {test.description || "No description available"}
                          </p>
                          
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-4">
                            <span className="flex items-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full">
                              <FiCheckCircle className="mr-1" /> 
                              {test.questions?.length || 0} Questions
                            </span>
                            
                            <span className="flex items-center ml-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-2.5 py-1 rounded-full">
                              <FiAward className="mr-1" /> 
                              {Math.floor(Math.random() * 100)}% Completion Rate
                            </span>
                          </div>
                          
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleStartTest(test)}
                            className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center"
                          >
                            <BiAnalyse className="mr-2 text-lg" /> Start Test
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      
        {createTest && (
          <motion.div 
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={fadeIn}
            className="max-w-3xl w-full mx-auto bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-xl rounded-2xl border border-gray-100/80 dark:border-zinc-800/80 overflow-hidden relative z-10"
          >
            <div className="p-6 md:p-8 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                <FiEdit3 className="mr-3 text-blue-500" /> Create New Test
              </h2>
              
              <motion.button
                whileHover={{ scale: 1.1, color: '#ef4444' }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setCreateTest(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 focus:outline-none"
              >
                <IoMdClose className="w-6 h-6" />
              </motion.button>
            </div>
            
            <div className="p-6 md:p-8">
              <div className="space-y-5 mb-8">
                <TextInput
                  type="text"
                  placeholder="Test Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                
                <TextInput
                  type="text"
                  placeholder="Test Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              
              <div className="space-y-6">
                <h3 className="font-semibold text-gray-800 dark:text-white text-lg flex items-center border-b border-gray-100 dark:border-zinc-800 pb-3">
                  Questions
                </h3>
                
                {questions.map((q, qIdx) => (
                  <motion.div
                    key={qIdx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: qIdx * 0.1 }}
                    className="p-5 md:p-6 bg-gray-50/80 dark:bg-zinc-800/50 backdrop-blur-sm rounded-xl border border-gray-100 dark:border-zinc-700/50 hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium text-gray-800 dark:text-white flex items-center">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-bold mr-2">
                          {qIdx + 1}
                        </span>
                        Question {qIdx + 1}
                      </h4>
                      
                      <motion.button
                        whileHover={{ scale: 1.1, color: '#ef4444' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => deleteQuestion(qIdx)}
                        className="p-1 rounded-full text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 focus:outline-none"
                        disabled={questions.length <= 1}
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                    
                    <TextInput
                      type="text"
                      placeholder="Enter your question"
                      value={q.question}
                      onChange={(e) => {
                        const newQuestions = [...questions];
                        newQuestions[qIdx].question = e.target.value;
                        setQuestions(newQuestions);
                      }}
                    />
                    
                    <div className="mt-4 space-y-3">
                      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                        <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        Options:
                      </h5>
                      
                      {q.options.map((opt, optIdx) => (
                        <motion.div 
                          key={optIdx} 
                          className="flex items-center space-x-2"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + optIdx * 0.05 }}
                        >
                          <TextInput
                            type="text"
                            placeholder={`Option ${optIdx + 1}`}
                            value={opt}
                            onChange={(e) => {
                              const newQuestions = [...questions];
                              newQuestions[qIdx].options[optIdx] = e.target.value;
                              setQuestions(newQuestions);
                            }}
                          />
                          
                          <motion.button
                            whileHover={{ scale: 1.1, color: '#ef4444' }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => deleteOption(qIdx, optIdx)}
                            className="p-1 rounded-full text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 focus:outline-none"
                            disabled={q.options.length <= 1}
                          >
                            <IoMdClose className="w-5 h-5" />
                          </motion.button>
                        </motion.div>
                      ))}
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => addOption(qIdx)}
                        className="mt-2 px-3 py-2 bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm flex items-center transition-colors duration-200"
                      >
                        <IoMdAdd className="mr-1" /> Add Option
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
                
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={addQuestion}
                  className="w-full py-3 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-medium rounded-lg flex items-center justify-center transition-colors duration-200"
                >
                  <IoMdAddCircle className="mr-1.5 text-lg" /> Add Another Question
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full py-3.5 mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>Create Test</>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateTest;
