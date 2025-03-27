import { BrowserRouter, Route, Routes } from "react-router-dom";
import { lazy } from "react";
import HomePage from "./pages/Home";
import ThemeProvider from "./context/ThemeContext";
import Navbar from "./component/Navbar";
import Footer from "./component/Footer";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import UserSubmission from "./pages/UserSubmission";
const ImageUpload = lazy(()=>import("./pages/UploadImage"));
const ImageGallery = lazy(()=>import("./pages/ImageGallery"));
const CreateTest = lazy(() => import("./pages/CreateTest"));
const SubmitTest = lazy(() => import("./pages/SubmitTest"));


function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-sky-100 to-white dark:from-zinc-900 dark:to-black overflow-x-hidden">
          <Navbar />
          <div className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/signup" element={<Signup></Signup>}></Route>
              <Route path="/login" element={<Login></Login>}></Route>
              <Route path="/image" element={<ImageUpload></ImageUpload>}></Route>
              <Route path="/upload" element={<ImageUpload></ImageUpload>}></Route>
              <Route path="/image-gallery" element={<ImageGallery></ImageGallery>}></Route>
              <Route path="/tests" element={<CreateTest></CreateTest>}></Route>
              <Route path="/test/:title" element={<SubmitTest></SubmitTest>}></Route>
              <Route path="/test-submission/:submissionId" element={<UserSubmission></UserSubmission>}></Route>
            </Routes>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;