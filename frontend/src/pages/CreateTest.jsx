import axios from "axios";
import { useContext, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { IoMdCloseCircle } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import { IoMdAddCircle } from "react-icons/io";
import { IoMdAdd } from "react-icons/io";
import { LuUpload } from "react-icons/lu";
import TextInput from "../component/TextInput";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";


const CreateTest = () => {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([{ question: "", options: ["", ""] }]);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState(null);
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
        return;
      }
      const token = localStorage.getItem("token");
      const response = await axios.post(`${backendUrl}/api/test/create`,
        { title, questions, description }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
      );
      toast.success(response.data.message);
      setTitle("");
      setDescription("");
      setQuestions([{ question: "", options: ["", ""] }]);
    } catch (error) {
      toast.error(error.response?.data?.error);
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

    <div className="flex flex-col items-center justify-center min-h-screen pt-32 p-5">
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="loader"></div>
        </div>
      ) :
        (
          <>
          {/* All test */}
              {(!createTest ) &&
                <div className="max-w-3xl w-full mx-auto p-6 bg-white dark:bg-zinc-900 shadow-xl rounded-lg">
                  <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Available Tests</h2>

                  {tests.length === 0 ? (
                    <p className="text-center text-zinc-500">No tests available.</p>
                  ) :
                    (
                      <div>
                        {tests.map((test) => (
                          <div
                            key={test._id}
                            className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-600 mb-5"
                          >
                            <div>
                              <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold mb-4">{test.title}</h3>
                                <button
                                  className=" bg-zinc-300 dark:bg-zinc-800  rounded-full hover:bg-red-500/80 dark:hover:bg-red-600/80 text-gray-600 dark:text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-400 transition-all duration-200"
                                  onClick={() => { deleteTest(test._id) }}
                                  aria-label="Close Test"
                                >
                                  <svg
                                    className="w-8 h-8"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>
                              </div>
                              <span>{test.description}</span>
                            </div>

                            <button
                              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                              onClick={() => { handleStartTest(test) }}
                            >
                              Start Test
                            </button>
                          </div>
                        ))}
                      </div>
                    )
                  }
                </div>
              }

              {/* cheack role */}
              {(user?.role === 'admin' && !createTest) && (
                <>
                  <button
                    className="bg-green-600 text-white px-4 py-2 h-12 rounded-lg hover:bg-green-700 w-full sm:w-1/4 mt-7"
                    onClick={() => setCreateTest(true)}
                  >
                    Create Test
                  </button>
                </>
              )}
      
            {/* crete test only admin */}
            {createTest &&
              <div className="max-w-lg w-full mx-auto p-6 bg-white dark:bg-zinc-900 shadow-xl rounded-lg">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-2xl md:text-3xl font-bold">
                    Create a New Test
                  </h2>
                  <button
                    className=" bg-zinc-300 dark:bg-zinc-800  rounded-full hover:bg-red-500/80 dark:hover:bg-red-600/80 text-gray-600 dark:text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-400 transition-all duration-200"
                    onClick={() => { setCreateTest(false) }}
                    aria-label="Close Test"
                  >
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="flex flex-col space-y-3 mb-6">
                  <TextInput
                    type="text"
                    placeholder="Enter test title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />

                  <TextInput
                    type="text"
                    placeholder="Enter test description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-6">
                  {questions.map((q, qIdx) => (
                    <div
                      key={qIdx}
                      className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-600"
                    >
                      <div className="w-full flex flex-row items-center justify-between mb-5 gap-2">
                        <TextInput
                          type="text"
                          placeholder={`Question ${qIdx + 1}`}
                          value={q.question}
                          onChange={(e) => {
                            const newQuestions = [...questions];
                            newQuestions[qIdx].question = e.target.value;
                            setQuestions(newQuestions);
                          }}
                        />

                        <button
                          title="Delete Question"
                          className=""
                          onClick={() => deleteQuestion(qIdx)}
                        >
                          <IoMdClose className="h-7 w-7 text-red-400 hover:rotate-180 transition-transform duration-500" />
                        </button>

                      </div>

                      <div className="space-y-3">
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <TextInput
                              type="text"
                              placeholder={`Choice ${optIdx + 1}`}
                              value={opt}
                              onChange={(e) => {
                                const newQuestions = [...questions];
                                newQuestions[qIdx].options[optIdx] = e.target.value;
                                setQuestions(newQuestions);
                              }}
                            />

                            <button
                              onClick={() => deleteOption(qIdx, optIdx)}
                            >
                              <IoMdCloseCircle className="h-7 w-7 text-red-400 hover:rotate-180 transition-transform duration-500" />
                            </button>
                          </div>
                        ))}

                        <button className="flex items-center justify-center mx-auto gap-3 text-blue-500 hover:scale-110 transition-transform duration-500"
                          onClick={() => addOption(qIdx)}
                        >
                          <IoMdAddCircle className="h-6 w-6" />
                          <span className="text-lg">Add Option</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col md:flex-row gap-4 mt-10 items-center justify-center mb-5">
                  <button className="custom-button-light w-full h-14 gap-3"
                    onClick={addQuestion}
                  >
                    <IoMdAdd className="h-6 w-6 font-bold" />
                    <span className="text-lg">Question</span>
                    <span className="shine-effect"></span>
                  </button>
                  <button className="custom-button w-full h-14 gap-3"
                    onClick={async () => {
                      await handleSubmit();
                      setCreateTest(false);
                      setTestDone(true);
                    }}

                  >
                    <LuUpload className="h-6 w-6 font-bold" />
                    <span className="text-lg">Publish</span>
                  </button>
                </div>
              </div>

            }
          </>
        )}
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default CreateTest;
