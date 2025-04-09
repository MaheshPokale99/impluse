import { BrowserRouter, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import HomePage from "./pages/Home";
import ThemeProvider from "./context/ThemeContext";
import Navbar from "./component/Navbar";
import Footer from "./component/Footer";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import UserSubmission from "./pages/UserSubmission";
import Verify from "./pages/Verify";
const ImageUpload = lazy(() => import("./pages/UploadImage"));
const ImageGallery = lazy(() => import("./pages/ImageGallery"));
const CreateTest = lazy(() => import("./pages/CreateTest"));
const SubmitTest = lazy(() => import("./pages/SubmitTest"));


function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-sky-100 via-white to-blue-50 dark:from-zinc-900 dark:via-black dark:to-indigo-950 overflow-x-hidden">
          <Navbar />
          <div className="flex-1 overflow-auto mt-20 md:mt-24">
            <Suspense fallback={
              <div className="flex items-center justify-center h-[70vh]">
                <div className="loader"></div>
              </div>
            }>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/upload" element={<ImageUpload />} />
                <Route path="/image-gallery" element={<ImageGallery />} />
                <Route path="/tests" element={<CreateTest />} />
                <Route path="/test/:title" element={<SubmitTest />} />
                <Route path="/test-submission/:submissionId" element={<UserSubmission />} />
                <Route path="/verify" element={<Verify />} />
              </Routes>
            </Suspense>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;