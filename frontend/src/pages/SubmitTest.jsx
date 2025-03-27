import axios from "axios";
import { useContext, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";

const SubmitTest = () => {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext)
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const location = useLocation();
  const selectedTest = location.state?.testData;

  // Submit test
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (Object.keys(selectedAnswers).length === 0) {
        toast.error("please complete test")
        return;
      }

      const answers = selectedTest.questions.map((question) => ({
        question: question.question,
        answer: Array.isArray(selectedAnswers[question._id])
          ? selectedAnswers[question._id]
          : [selectedAnswers[question._id] || "Not Answered"]
      }));

      const payload = {
        testName: selectedTest.title,
        answers
      };

      const response = await axios.post(`${backendUrl}/api/test/submit`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(response.data.message || "Test submitted successfully!", { duration: 3000 });
      setSelectedAnswers({});
      navigate(`/test-submission/${response.data?.submissionId}`);


    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit test.");
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

  return (
    <div className="flex items-center justify-center min-h-screen pt-32">
      {loading ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-50">
          <div className="loader"></div>
          <span className="text-red-500 mt-5">{`Please Wait ${user?.name?.split(" ")[0] || ""}`}</span>
        </div>
      ) : (
        <div className="relative max-w-4xl w-full mx-auto p-8 bg-zinc-100/70 dark:bg-zinc-900/90 backdrop-blur-xl shadow-2xl rounded-3xl border border-gray-200/30 dark:border-zinc-700/30 transition-all duration-100">
          <button
            className="absolute top-4 right-4 p-2 bg-zinc-300 dark:bg-zinc-800  rounded-full hover:bg-red-500/80 dark:hover:bg-red-600/80 text-gray-600 dark:text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-400 transition-all duration-200"
            onClick={() => { navigate("/tests") }}
            aria-label="Close Test"
          >
            <svg
              className="w-5 h-5"
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

          <h2 className="text-4xl font-bold mb-10 text-center">
            {selectedTest?.title}
          </h2>

          {selectedTest?.questions.map((q, qIdx) => (
            <div
              key={q._id}
              className="mb-6 p-6 bg-gradient-to-br from-zinc-100 to-white/90 dark:from-zinc-800/90 dark:to-zinc-700/90 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <p className="font-semibold text-xl text-gray-800 dark:text-gray-100 tracking-wide leading-relaxed">
                {qIdx + 1}. {q.question}
              </p>
              <div className="space-y-4 mt-5">
                {q.options.map((option, optIdx) => (
                  <label
                    key={optIdx}
                    className="flex items-center space-x-4 p-3 rounded-xl bg-white/60 dark:bg-zinc-800/60 hover:bg-gradient-to-r hover:from-indigo-200/60 hover:to-purple-200/60 dark:hover:from-indigo-900/60 dark:hover:to-purple-900/60 transition-all duration-200 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name={`question-${q._id}`}
                      value={option}
                      checked={selectedAnswers[q._id] === option}
                      onChange={() => handleOptionChange(q._id, option)}
                      className="form-radio h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-zinc-600 group-hover:scale-110 group-hover:border-indigo-500 dark:group-hover:border-purple-400 transition-all duration-150"
                    />
                    <span className="text-gray-700 dark:text-gray-200 text-lg font-medium group-hover:text-indigo-700 dark:group-hover:text-purple-300 transition-colors duration-300">
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button className={`${theme === "dark" ? "custom-button-light" : "custom-button"} w-full h-14`}
            onClick={handleSubmit}
          >
            <span className="text-lg font-bold">Submit</span>
            <span className="shine-effect"></span>
          </button>
        </div>
      )
      }

      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default SubmitTest;
