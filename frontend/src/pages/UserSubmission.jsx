import axios from "axios";
import { useEffect, useState } from "react"
import toast, { Toaster } from "react-hot-toast";
import { useParams } from "react-router-dom";




const UserSubmission = () => {
  const { submissionId } = useParams();
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const featchSubmittedTest = async () => {
      try {

        const response = await axios.get(`${backendUrl}/api/test/test-submission/${submissionId}`);
        setSelectedAnswers(response.data);

      } 
      catch (error) {
        toast.error(error.response?.data?.message)
      }
    }
    featchSubmittedTest();

  }, [])




  return (
    <div>
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  )
}

export default UserSubmission