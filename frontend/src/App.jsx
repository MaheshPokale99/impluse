import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/Home";
import ThemeProvider from "./context/ThemeContext";
import Navbar from "./component/Navbar";
import Footer from "./component/Footer";
import ImageUpload from "./pages/UploadImage";
import Signup from "./pages/Signup";
import Login from "./pages/Login";


function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="w-full min-h-screen h-full flex flex-col">
          <Navbar />
          <div className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/signup" element={<Signup></Signup>}></Route>
              <Route path="/login" element={<Login></Login>}></Route>
              <Route path="/image" element={<ImageUpload></ImageUpload>}></Route>
              <Route path="/upload" element={<ImageUpload></ImageUpload>}></Route>
            </Routes>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;