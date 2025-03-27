import axios from "axios";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useParams } from "react-router-dom";

const UserSubmission = () => {
  const { submissionId } = useParams();
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchSubmittedTest = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${backendUrl}/api/test/test-submission/${submissionId}`);
        setSelectedAnswers(response.data.submission);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch submission");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmittedTest();
  }, [submissionId, backendUrl]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="loader"></div>
        </div>
      ) : (
        <div className="w-full max-w-2xl bg-zinc-100 dark:bg-zinc-800 rounded-2xl shadow-lg p-6 transition-colors duration-300">
          <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200 text-center mb-4">
            {selectedAnswers?.testName || "Test Submission"}
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center">
            Submitted by: <span className="font-medium text-zinc-800 dark:text-zinc-300">{selectedAnswers?.userEmail}</span>
          </p>
          <div className="mt-6 space-y-4">
            {(selectedAnswers?.answers || []).map((answer, index) => (
              <div key={index} className="p-4 border rounded-lg dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700">
                <p className="text-base text-zinc-700 dark:text-zinc-300">
                  <strong className="text-zinc-900 dark:text-zinc-100">Q{index + 1}:</strong> {answer.question}
                </p>
                <p className="text-base mt-2 text-zinc-800 dark:text-zinc-200">
                  <strong className="text-green-600 dark:text-green-400">Answer:</strong> {answer.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default UserSubmission;
