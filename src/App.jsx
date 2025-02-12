import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/Home";
import ThemeProvider from "./context/ThemeContext";
import Navbar from "./component/Navbar";
// import Footer from "./component/Footer";


function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
      <div className="w-full min-h-screen">
      <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
          {/* <Footer /> */}
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}


export default App;