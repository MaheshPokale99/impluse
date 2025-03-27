import { createRoot } from 'react-dom/client'
import './index.css'
import "./styles/index.css";
import App from './App.jsx'
import { AuthProvider } from "./context/AuthContext";
import { Analytics } from "@vercel/analytics/react"


createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <App />
    <Analytics/>
  </AuthProvider>,
)
