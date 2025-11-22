import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Contactpage from './pages/Contactpage'

import LandingPage from './pages/LandingPage'
import Home from './pages/Home'
import LoginPage from './pages/Login'
import MenteeSignup from './pages/MenteeSignup'
import MentorSignup from './pages/MentorSignup'
import MentorEmailVerify from './pages/MentorEmailVerify'
import MenteeEmailVerify from './pages/MenteeEmailVerify'
import MenteeDashboard from './pages/MenteeDashboard'
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import MentorDashboard from './pages/MentorDashboard'
import ChatPage from './pages/ChatPage'
import VideoCallPage from './pages/VideoCallPage'

export default function App() {

  const location = useLocation();

  // PAGES WHERE NAVBAR & FOOTER MUST NOT APPEAR
  const hideRoutes = [
    "/chat",
    "/videocall",
    "/dashboard",
    "/mentor/dashboard",
    "/email-verify",
    "/mentor/email-verify",
    "/"
  ];

  const hideLayout = hideRoutes.some(path => location.pathname.startsWith(path));

  return (
    <div className="min-h-screen flex flex-col">
      
      {/* Hide Navbar */}
      {!hideLayout && <Navbar />}

      <main className="flex-1">
        <ToastContainer position="top-center" />

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup/mentee" element={<MenteeSignup />} />
          <Route path="/signup/mentor" element={<MentorSignup />} />
          <Route path="/mentor/email-verify" element={<MentorEmailVerify />} />
          <Route path="/email-verify" element={<MenteeEmailVerify />} />
          <Route path="/dashboard" element={<MenteeDashboard />} />
          <Route path="/mentor/dashboard" element={<MentorDashboard />} />
          <Route path="/contact" element={<Contactpage/>}/>

          {/* Chat & Video */}
          <Route path="/chat/page" element={<ChatPage />} />
          <Route path="/videocall/:peerId" element={<VideoCallPage />} />
        </Routes>
      </main>

      {/* Hide Footer */}
      {!hideLayout && <Footer />}
    </div>
  )
}
