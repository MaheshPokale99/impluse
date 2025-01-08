import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./componenet/pages/Home";
import ThemeProvider from "./context/ThemeContext";
import Navbar from "./componenet/Navbar";
import Footer from "./componenet/Contact"

function App() {
  return (
    <div>
      <BrowserRouter>
        <ThemeProvider>
          <Navbar></Navbar>
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
          <Footer></Footer>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;