import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { LanguageProvider } from './contexts/LanguageContext.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <ThemeProvider>
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <StrictMode>
            <App />
          </StrictMode>,
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  </ThemeProvider>

)
