import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiSend, FiMail, FiPhone, FiMessageSquare, FiCheckCircle } from "react-icons/fi";
import { MdQuestionAnswer } from "react-icons/md";
import { RiShieldLine } from "react-icons/ri";
import ChatShow from "./ChatShow";
import TextInput from "./TextInput"

const QuerySection = () => {
  const [query, setQuery] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedQuery, setSubmittedQuery] = useState("");
  const containerRef = useRef(null);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && email.trim()) {
      setSubmittedQuery(query);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setQuery("");
        setEmail("");
        setPhone("");
      }, 3000);
    }
  };
  
  // Frequently asked questions
  const faqs = [
    {
      id: 1,
      question: "How do I advance my career in tech?",
      answer: "Focus on building practical projects, networking with professionals, and staying updated with industry trends. Our mentors can guide you through specialized learning paths."
    },
    {
      id: 2,
      question: "What skills are most in-demand now?",
      answer: "Currently, AI/ML, cloud computing, full-stack development, and cybersecurity are highly sought after. Our mentors can help you identify which path aligns with your strengths."
    },
    {
      id: 3,
      question: "How do I prepare for technical interviews?",
      answer: "Practice coding challenges, review data structures and algorithms, prepare for behavioral questions, and do mock interviews. Our mentors can conduct practice sessions with you."
    },
    {
      id: 4,
      question: "How can I transition into tech from another field?",
      answer: "Start with fundamentals, leverage transferable skills, build relevant projects, and network effectively. Our mentors can create a personalized transition plan for you."
    },
    {
      id: 5,
      question: "How do I stay motivated during my learning journey?",
      answer: "Set clear goals, find a community, celebrate small wins, and focus on practical applications. Our mentors provide regular check-ins to keep you accountable."
    }
  ];

  return (
    <section ref={containerRef} className="w-full max-w-6xl mx-auto py-8 px-4 md:py-12 md:px-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
          <span className="text-indigo-600 dark:text-indigo-400">Ask Questions</span> & Get Expert Advice
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Browse common questions or send us a message
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white/90 dark:bg-zinc-800/90 rounded-xl shadow-lg overflow-hidden">
        <div className="lg:col-span-5 bg-gray-50 dark:bg-zinc-900/50 border-r border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-800 flex items-center">
            <MdQuestionAnswer className="text-indigo-500 dark:text-indigo-400 mr-2 text-xl" />
            <h3 className="font-semibold text-gray-800 dark:text-white">Frequently Asked Questions</h3>
          </div>
          
          <div className="overflow-y-auto" style={{ maxHeight: "450px" }}>
            {faqs.map((faq) => (
              <div key={faq.id} className="border-b border-gray-200 dark:border-gray-700/50">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  className="w-full px-4 py-3 text-left flex justify-between items-center hover:bg-gray-100 dark:hover:bg-zinc-800/70 transition-colors"
                >
                  <span className="font-medium text-gray-700 dark:text-gray-300">{faq.question}</span>
                  <span className="text-indigo-600 dark:text-indigo-400 text-sm font-medium flex items-center">
                    <motion.div
                      animate={{ rotate: expandedFaq === faq.id ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FiChevronDown className="text-indigo-500 dark:text-indigo-400" />
                    </motion.div>
                  </span>
                </button>
                
                <AnimatePresence>
                  {expandedFaq === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 py-3 bg-indigo-50/50 dark:bg-indigo-900/20 border-l-4 border-indigo-500 dark:border-indigo-400 text-gray-600 dark:text-gray-300 text-sm">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
        
        <div className="lg:col-span-7 bg-white dark:bg-zinc-800">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
            <FiMessageSquare className="text-indigo-500 dark:text-indigo-400 mr-2 text-xl" />
            <h3 className="font-semibold text-gray-800 dark:text-white">Send Your Question</h3>
          </div>
          
          <div className="p-6">
            {isSubmitted ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center text-center h-72"
              >
                <FiCheckCircle className="text-green-500 text-5xl mb-4" />
                <h4 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Thank You!</h4>
                <p className="text-gray-600 dark:text-gray-300 max-w-md">
                  We've received your question and will get back to you shortly. Check your email for updates.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="text-gray-400" />
                    </div>
                    <TextInput
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                {/* Phone Field */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number <span className="text-gray-400">(Optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiPhone className="text-gray-400" />
                    </div>
                    <TextInput
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 1234569870"
                    />
                  </div>
                </div>

                {/* Question/Message Field */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Your Question <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    required
                    rows={5}
                    className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                    placeholder="What would you like to know about your career path?"
                  ></textarea>
                  <div className="mt-1 text-right text-xs text-gray-500 dark:text-gray-400">
                    {query.length} characters
                  </div>
                </div>

                {/* Submit Button */}
                <div>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={!query.trim() || !email.trim()}
                    className={`w-full py-3 px-4 rounded-lg flex items-center justify-center ${
                      query.trim() && email.trim() 
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
                        : "bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
                    } transition-colors duration-200 shadow-sm font-medium`}
                  >
                    <FiSend className="mr-2" />
                    Send Your Question
                  </motion.button>
                </div>

                {/* Privacy Note */}
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  <RiShieldLine className="inline-block mr-1" />
                  Your information is secure and will not be shared with third parties.
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      
      {/* Show recent answers below */}
      <div className="mt-8">
        <div className="p-4 bg-white dark:bg-zinc-800 rounded-xl">
          <div className="flex items-center mb-4">
            <h3 className="font-semibold text-gray-800 dark:text-white text-lg">Recent Answers</h3>
            <motion.span 
              className="ml-2 px-2 py-0.5 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              New
            </motion.span>
          </div>
          <div className="border-gray-200 dark:border-gray-700">
            <ChatShow 
              question={submittedQuery || undefined} 
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuerySection;
