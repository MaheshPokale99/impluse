import { createRoot } from 'react-dom/client'
import './index.css'
import "./styles/index.css";
import App from './App.jsx'
import { AuthProvider } from "./context/AuthContext";
import { Analytics } from "@vercel/analytics/react"

// Add Inter font
const interFontUrl = 'https://rsms.me/inter/inter.css';
const linkElement = document.createElement('link');
linkElement.rel = 'stylesheet';
linkElement.href = interFontUrl;
document.head.appendChild(linkElement);

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <App />
    <Analytics/>
  </AuthProvider>,
)
