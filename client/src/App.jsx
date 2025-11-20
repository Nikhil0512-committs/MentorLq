import React from 'react'
import { Routes, Route } from 'react-router-dom'

import Navbar from './components/Navbar'
import Footer from './components/Footer'

import LandingPage from './pages/LandingPage'
import Home from './pages/Home'
import LoginPage from './pages/Login'
import MenteeSignup from './pages/MenteeSignup'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup/mentee" element={<MenteeSignup />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
