import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./componenet/pages/Home";
import ThemeProvider from "./context/ThemeContext";
import Navbar from "./componenet/Navbar";
function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <Navbar></Navbar>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;